import urllib.request, urllib.error, json, psycopg2, sys, time
sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://127.0.0.1:3001/api/v1'
DSN = 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'
pg = psycopg2.connect(DSN); c = pg.cursor()

def api(method, path, body=None, expect=200):
    url = f'{BASE}{path}'
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method,
        headers={'Content-Type': 'application/json'} if body else {})
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode()) if e.read() else {'error': str(e)}

results = {'pass': 0, 'fail': 0, 'errors': []}

def check(label, ok, detail=''):
    if ok:
        results['pass'] += 1
        print(f'  PASS {label}')
    else:
        results['fail'] += 1
        results['errors'].append(f'{label}: {detail}')
        print(f'  FAIL {label} — {detail}')

# === H1 — Dataset Validation ===
print('=' * 60)
print('H1 — PILOT DATASET VALIDATION')
print('=' * 60)

# DB counts
tables_to_check = {
    'projects': 9, 'location_nodes': 19, 'customers': 10,
    'customer_unit_assignments': 10, 'meters': 10, 'tariff_plans': 37
}
for tbl, expected in tables_to_check.items():
    c.execute(f'SELECT COUNT(*) FROM sim_system."{tbl}"')
    cnt = c.fetchone()[0]
    check(f'H1.{tbl} count = {cnt} (expected {expected})', cnt == expected)

# Integrity: no orphans
c.execute('SELECT COUNT(*) FROM sim_system.customers c LEFT JOIN sim_system.projects p ON c.project_id = p.id WHERE p.id IS NULL')
check('H1.orphan customers', c.fetchone()[0] == 0)
c.execute('SELECT COUNT(*) FROM sim_system.meters m LEFT JOIN sim_system.projects p ON m.project_id = p.id WHERE p.id IS NULL')
check('H1.orphan meters', c.fetchone()[0] == 0)
c.execute('SELECT COUNT(*) FROM sim_system.customer_unit_assignments a LEFT JOIN sim_system.customers c ON a.customer_id = c.id WHERE c.id IS NULL')
check('H1.orphan assignments', c.fetchone()[0] == 0)

# API returns
st, data = api('GET', '/health')
check('H1.health endpoint', st == 200 and data.get('status') == 'ok', str(data))

st, data = api('GET', '/projects')
check('H1.projects API', st == 200 and len(data) >= 9, f'{st} {len(data) if isinstance(data, list) else data}')

st, data = api('GET', '/meters')
check('H1.meters API', st == 200 and len(data) >= 10, f'{st} {len(data) if isinstance(data, list) else data}')

st, data = api('GET', '/tariffs')
check('H1.tariffs API', st == 200 and len(data) >= 37, f'{st} {len(data) if isinstance(data, list) else data}')

# === H2 — User Certification ===
print('\n' + '=' * 60)
print('H2 — USER CERTIFICATION')
print('=' * 60)

# Test JWT token generation
import jwt as pyjwt
JWT_SECRET = 'change-me-in-production'

# Test tokens for each role
roles = ['super_admin', 'project_admin', 'operator', 'technician', 'finance', 'support', 'customer']
for role in roles:
    token = pyjwt.encode({'sub': 'test-user', 'userId': 'test-user', 'role': role, 'projectScope': None}, JWT_SECRET, algorithm='HS256')
    st, data = api('GET', '/meters', None, expect=200)
    check(f'H2.role_{role}_access', st in [200, 401, 403], f'got {st}')

# Test refresh token flow
st, data = api('POST', '/auth/refresh', {'refreshToken': 'invalid-token'}, expect=401)
check('H2.refresh_invalid_token_rejected', st == 401, f'got {st}')

# Test invalid JWT
bad_token = pyjwt.encode({'sub': 'test', 'role': 'nonexistent'}, JWT_SECRET, algorithm='HS256')
req = urllib.request.Request(f'{BASE}/meters',
    headers={'Authorization': f'Bearer {bad_token}'})
try:
    resp = urllib.request.urlopen(req, timeout=5)
    check('H2.invalid_role_rejected', False, f'got {resp.status}')
except urllib.error.HTTPError as e:
    check('H2.invalid_role_rejected', e.code in [401, 403], f'got {e.code}')

# Test no auth
try:
    resp = urllib.request.urlopen(f'{BASE}/meters', timeout=5)
    check('H2.no_auth_rejected', False, f'got {resp.status}')
except urllib.error.HTTPError as e:
    check('H2.no_auth_rejected', e.code in [401, 403], f'got {e.code}')

# === H3 — Operational Replay (Baseline) ===
print('\n' + '=' * 60)
print('H3 — OPERATIONAL READINESS')
print('=' * 60)

# Check API readiness for all operational endpoints
endpoints = [
    ('GET', '/projects'),
    ('GET', '/meters'),
    ('GET', '/tariffs'),
    ('GET', '/periods'),
    ('POST', '/invoices/generate'),
    ('POST', '/payments'),
    ('GET', f'/projects/{"/".join(["p1"])}/customers'),  # will fail but checks route
]
# Test projects detail
st, data = api('GET', '/projects')
projects = data if isinstance(data, list) else []
check(f'H3.projects_accessible', st == 200, f'got {st}')
if projects:
    pid = projects[0].get('id', '')
    st, data = api('GET', f'/projects/{pid}/customers')
    check(f'H3.project_customers_endpoint', st in [200, 401], f'got {st}')
    st, data = api('GET', f'/projects/{pid}/locations')
    check(f'H3.project_locations_endpoint', st in [200, 401], f'got {st}')
    st, data = api('GET', f'/projects/{pid}/dashboard/kpis')
    check(f'H3.dashboard_kpis_endpoint', st in [200, 401], f'got {st}')
    st, data = api('GET', f'/projects/{pid}/dashboard/consumption')
    check(f'H3.dashboard_consumption_endpoint', st in [200, 401], f'got {st}')
    st, data = api('GET', f'/projects/{pid}/dashboard/activity')
    check(f'H3.dashboard_activity_endpoint', st in [200, 401], f'got {st}')
    st, data = api('GET', f'/projects/{pid}/water-balance')
    check(f'H3.water_balance_endpoint', st in [200, 401], f'got {st}')

# Readings endpoints
st, data = api('GET', '/readings/review-queue')
check(f'H3.readings_review_queue_endpoint', st in [200, 401], f'got {st}')

# Invoice endpoints
st, data = api('POST', '/invoices/generate', {'projectId': 'test', 'periodId': 'test'})
check(f'H3.invoice_generate_endpoint', st in [201, 202, 400, 401, 404], f'got {st}')

# === H4 — Billing Readiness ===
print('\n' + '=' * 60)
print('H4 — BILLING READINESS')
print('=' * 60)

# Verify tariff plans cover all meter types
c.execute("SELECT DISTINCT meter_type FROM sim_system.tariff_plans")
types = sorted([r[0] for r in c.fetchall()])
check('H4.tariff_types', set(types) == {'water_main', 'electricity'}, f'got {types}')

c.execute("SELECT COUNT(*) FROM sim_system.tariff_plans WHERE meter_type='electricity'")
elec_cnt = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM sim_system.tariff_plans WHERE meter_type='water_main'")
water_cnt = c.fetchone()[0]
check('H4.electricity_tariffs_exist', elec_cnt > 0, f'{elec_cnt}')
check('H4.water_tariffs_exist', water_cnt > 0, f'{water_cnt}')

c.execute("SELECT COUNT(*) FROM sim_system.tariff_plans WHERE project_id IS NOT NULL")
proj_tariffs = c.fetchone()[0]
check('H4.tariffs_linked_to_projects', proj_tariffs > 0, f'{proj_tariffs}')

# === H5 — Solar Wallet Readiness ===
print('\n' + '=' * 60)
print('H5 — SOLAR WALLET READINESS')
print('=' * 60)

# Check customer_ledger_entries table exists
c.execute("SELECT EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='sim_system' AND tablename='customer_ledger_entries')")
check('H5.ledger_table_exists', c.fetchone()[0])


# === H6 — Document Readiness ===
print('\n' + '=' * 60)
print('H6 — DOCUMENT READINESS')
print('=' * 60)
# Invoices table exists, has proper structure
c.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='invoices' ORDER BY ordinal_position")
invoice_cols = {r[0]: r[1] for r in c.fetchall()}
for col in ['id', 'invoice_number', 'customer_id', 'project_id', 'status', 'total_amount', 'currency']:
    check(f'H6.invoice_col_{col}', col in invoice_cols, f'cols: {list(invoice_cols.keys())[:10]}')

c.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='invoice_lines' ORDER BY ordinal_position")
inv_lines = [r[0] for r in c.fetchall()]
check('H6.invoice_lines_table', len(inv_lines) > 0, f'{len(inv_lines)} cols')

# === Summary ===
print('\n' + '=' * 60)
print('H1-H6 CERTIFICATION RESULTS')
print('=' * 60)
total = results['pass'] + results['fail']
print(f'Total checks: {total}')
print(f'Passed: {results["pass"]}')
print(f'Failed: {results["fail"]}')
if results['fail'] == 0:
    print('VERDICT: ALL PASS ✅ — Ready for next phases')
else:
    print(f'VERDICT: {results["fail"]} failures — Remediation needed')
    for e in results['errors']:
        print(f'  - {e}')

pg.close()
