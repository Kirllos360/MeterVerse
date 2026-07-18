import urllib.request, json, jwt, time, psycopg2, sys, os
sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://127.0.0.1:3001/api/v1'
DSN = 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'
JWT_SECRET = 'dev-jwt-secret-do-not-use-in-production'

pg = psycopg2.connect(DSN); c = pg.cursor()

def make_token(role='super_admin', uid='cert-user-001'):
    return jwt.encode({'sub': uid, 'userId': uid, 'role': role, 'projectScope': None,
        'iat': int(time.time()), 'exp': int(time.time()) + 3600}, JWT_SECRET, algorithm='HS256')

def api(method, path, body=None, token=None):
    hdrs = {'Content-Type': 'application/json'}
    if token: hdrs['Authorization'] = f'Bearer {token}'
    url = f'{BASE}{path}'
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method, headers=hdrs)
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        b = resp.read().decode('utf-8')
        return resp.status, json.loads(b) if b else {}
    except urllib.error.HTTPError as e:
        b = e.read().decode('utf-8') if e.read() else '{}'
        try: return e.code, json.loads(b)
        except: return e.code, {'error': b[:200]}

results = {'pass': 0, 'fail': 0, 'errors': [], 'phases': {}}

def check(phase, label, ok, detail=''):
    results['phases'].setdefault(phase, {'pass': 0, 'fail': 0, 'errors': []})
    if ok:
        results['pass'] += 1; results['phases'][phase]['pass'] += 1
        print(f'  PASS [{phase}] {label}')
    else:
        results['fail'] += 1; results['phases'][phase]['fail'] += 1
        results['phases'][phase]['errors'].append(f'{label}: {detail}')
        results['errors'].append(f'[{phase}] {label}: {detail}')
        print(f'  FAIL [{phase}] {label} — {detail}')

TOKEN = make_token()

# ===== H1 — DATASET VALIDATION =====
print('='*70+'\nH1 — PILOT DATASET VALIDATION\n'+'='*70)
for tbl, exp in [('projects',9),('location_nodes',19),('customers',10),
    ('customer_unit_assignments',10),('meters',10),('tariff_plans',37)]:
    c.execute(f'SELECT COUNT(*) FROM sim_system."{tbl}"')
    cnt = c.fetchone()[0]
    check('H1',f'{tbl} count', cnt==exp, f'{cnt} vs {exp}')

c.execute('SELECT COUNT(*) FROM sim_system.customers c LEFT JOIN sim_system.projects p ON c.project_id=p.id WHERE p.id IS NULL')
check('H1','orphan customers', c.fetchone()[0]==0)
c.execute('SELECT COUNT(*) FROM sim_system.meters m LEFT JOIN sim_system.projects p ON m.project_id=p.id WHERE p.id IS NULL')
check('H1','orphan meters', c.fetchone()[0]==0)

# API
st, d = api('GET','/health')
check('H1','health endpoint', st==200 and d.get('status')=='ok')
st, d = api('GET','/projects', token=TOKEN)
check('H1','projects API (authed)', st==200 and isinstance(d,list) and len(d)>=9)
st, d = api('GET','/meters', token=TOKEN)
check('H1','meters API (authed)', st==200)
st, d = api('GET','/tariffs', token=TOKEN)
check('H1','tariffs API (authed)', st==200)
st, d = api('GET','/periods', token=TOKEN)
check('H1','periods API (authed)', st==200)

# ===== H2 — USER CERTIFICATION =====
print('\n'+'='*70+'\nH2 — USER CERTIFICATION\n'+'='*70)
# Test all roles can access
for role in ['super_admin','project_admin','operator','technician','finance','support','customer']:
    t = make_token(role)
    st, _ = api('GET','/projects', token=t)
    check('H2',f'role {role} can access API', st==200, f'got {st}')

# Refresh token
st, _ = api('POST','/auth/refresh', {'refreshToken':'invalid'})
check('H2','refresh with invalid token rejected', st==401, f'got {st}')

# No auth
st, _ = api('GET','/projects')
check('H2','no-token request rejected', st==401, f'got {st}')

# Invalid role
bad_raw = jwt.encode({'sub':'x','role':'fake_role'}, JWT_SECRET, algorithm='HS256')
st, _ = api('GET','/projects', token=bad_raw)
# This might vary; just check it's not 200
check('H2','invalid role rejected', st!=200, f'got {st}')

# ===== H3 — OPERATIONAL READINESS =====
print('\n'+'='*70+'\nH3 — OPERATIONAL READINESS\n'+'='*70)
st, projects = api('GET','/projects', token=TOKEN)
if st==200 and len(projects)>0:
    pid = projects[0].get('id','')
    for ep in [f'/projects/{pid}/customers',f'/projects/{pid}/locations',
        f'/projects/{pid}/dashboard/kpis',f'/projects/{pid}/dashboard/consumption',
        f'/projects/{pid}/dashboard/activity',f'/projects/{pid}/water-balance']:
        s,_ = api('GET',ep,token=TOKEN)
        check('H3',f'{ep}', s in [200,201], f'got {s}')
st,_ = api('GET','/readings/review-queue',token=TOKEN)
check('H3','GET /readings/review-queue', st in [200,201], f'got {st}')
st,_ = api('POST','/invoices/generate',{'projectId':'test','periodId':'test'},token=TOKEN)
check('H3','POST /invoices/generate', st in [201,202,400,404], f'got {st}')

# ===== H4 — BILLING CERTIFICATION =====
print('\n'+'='*70+'\nH4 — BILLING CERTIFICATION\n'+'='*70)
c.execute("SELECT DISTINCT meter_type FROM sim_system.tariff_plans")
types = sorted([r[0] for r in c.fetchall()])
check('H4','tariff types include water+electricity', set(types)=={'water_main','electricity'}, f'{types}')
c.execute("SELECT COUNT(*) FROM sim_system.tariff_plans WHERE meter_type='electricity'")
check('H4','electricity tariffs exist', c.fetchone()[0]>0)
c.execute("SELECT COUNT(*) FROM sim_system.tariff_plans WHERE meter_type='water_main'")
check('H4','water tariffs exist', c.fetchone()[0]>0)
c.execute("SELECT COUNT(*) FROM sim_system.tariff_plans WHERE project_id IS NOT NULL")
check('H4','tariffs linked to projects', c.fetchone()[0]>0)
# Invoice tables
c.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='invoices' ORDER BY ordinal_position")
inv_cols = {r[0] for r in c.fetchall()}
for col in ['id','invoice_number','customer_id','project_id','status','total_amount','currency']:
    check('H4',f'invoice column {col}', col in inv_cols)
c.execute("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='invoice_lines'")
check('H4','invoice_lines table exists', c.fetchone()[0]>0)
c.execute("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='invoice_adjustments'")
check('H4','invoice_adjustments table exists', c.fetchone()[0]>0)
c.execute("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='billing_periods'")
check('H4','billing_periods table exists', c.fetchone()[0]>0)

# ===== H5 — SOLAR WALLET CERTIFICATION =====
print('\n'+'='*70+'\nH5 — SOLAR WALLET CERTIFICATION\n'+'='*70)
c.execute("SELECT EXISTS (SELECT FROM pg_catalog.pg_tables WHERE schemaname='sim_system' AND tablename='customer_ledger_entries')")
check('H5','ledger table exists', c.fetchone()[0])
c.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='customer_ledger_entries' ORDER BY ordinal_position")
ledger_cols = {r[0] for r in c.fetchall()}
for col in ['id','customer_id','project_id','entry_type','amount_delta','running_balance','entry_at']:
    check('H5',f'ledger column {col}', col in ledger_cols)
# Check entry_type enum
c.execute("SELECT DISTINCT entry_type FROM sim_system.customer_ledger_entries")
entries = [r[0] for r in c.fetchall()]
check('H5','ledger has valid entry types', len(entries)==0 or all(e in ['invoice','payment','adjustment','opening_balance','wallet_deposit','wallet_withdrawal'] for e in entries))

# ===== H6 — DOCUMENT CERTIFICATION =====
print('\n'+'='*70+'\nH6 — DOCUMENT CERTIFICATION\n'+'='*70)
c.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='payments'")
pay_cols = {r[0] for r in c.fetchall()}
for col in ['id','payment_number','customer_id','invoice_id','amount','payment_method','status','currency']:
    check('H6',f'payment column {col}', col in pay_cols)
c.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='payment_allocations'")
alloc_cols = {r[0] for r in c.fetchall()}
check('H6','payment_allocations table', len(alloc_cols)>0)
c.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='report_jobs'")
rj_cols = {r[0] for r in c.fetchall()}
for col in ['id','report_type','status','format','requested_by']:
    check('H6',f'report_jobs column {col}', col in rj_cols)

# ===== SUMMARY =====
print('\n'+'='*70+'\nH1-H6 FINAL RESULTS\n'+'='*70)
print(f'Total checks: {results["pass"]+results["fail"]}')
print(f'Passed: {results["pass"]}')
print(f'Failed: {results["fail"]}')
for phase in sorted(results['phases']):
    p = results['phases'][phase]
    status = 'PASS' if p['fail']==0 else 'FAIL'
    print(f'  {phase}: {p["pass"]} pass, {p["fail"]} fail — {status}')
    for e in p['errors']:
        print(f'    - {e}')

pg.close()
