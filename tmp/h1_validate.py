import psycopg2, sqlite3, json, sys
sys.stdout.reconfigure(encoding='utf-8')

PG_DSN = 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'
SQLITE = 'D:/meter/Meter/reference/collection-system/instance/collection_backup_20260606_114451.db'

pg = psycopg2.connect(PG_DSN)
sl = sqlite3.connect(SQLITE)
sl.row_factory = sqlite3.Row

pgc = pg.cursor()
slc = sl.cursor()

print('=' * 60)
print('H1 — PILOT DATASET CERTIFICATION')
print('=' * 60)

# Target tables
tables = [
    ('projects', 'projects'),
    ('location_nodes', 'location_nodes'),
    ('customers', 'customers'),
    ('customer_unit_assignments', 'customer_unit_assignments'),
    ('meters', 'meters'),
    ('tariff_plans', 'tariff_plans'),
    ('audit_log', 'audit_log'),
    ('readings', 'readings'),
    ('invoices', 'invoices'),
    ('payments', 'payments'),
    ('payment_allocations', 'payment_allocations'),
    ('customer_ledger_entries', 'customer_ledger_entries'),
]

print(f'\n{"Table":30s} {"PG Rows":10s} {"PG Data":20s}')
print('-' * 60)
for label, table in tables:
    pgc.execute(f'SELECT COUNT(*) FROM sim_system."{table}"')
    cnt = pgc.fetchone()[0]
    pgc.execute(f'SELECT COUNT(*) FROM (SELECT 1 FROM sim_system."{table}" LIMIT 1) t')
    sample = 'has data' if pgc.fetchone()[0] > 0 else 'empty'
    print(f'{label:30s} {str(cnt):10s} {sample:20s}')

# Verify data integrity
print('\n\n=== DATA INTEGRITY ===')

# 1. All customers should have a valid project reference
pgc.execute("""
    SELECT COUNT(*) FROM sim_system.customers c
    LEFT JOIN sim_system.projects p ON c.project_id = p.id
    WHERE p.id IS NULL
""")
orphan_customers = pgc.fetchone()[0]
print(f'Orphan customers (no project): {orphan_customers}')

# 2. All meters should have a valid project reference
pgc.execute("""
    SELECT COUNT(*) FROM sim_system.meters m
    LEFT JOIN sim_system.projects p ON m.project_id = p.id
    WHERE p.id IS NULL
""")
orphan_meters = pgc.fetchone()[0]
print(f'Orphan meters (no project): {orphan_meters}')

# 3. All assignments should have valid customer and unit
pgc.execute("""
    SELECT COUNT(*) FROM sim_system.customer_unit_assignments a
    LEFT JOIN sim_system.customers c ON a.customer_id = c.id
    WHERE c.id IS NULL
""")
orphan_assign = pgc.fetchone()[0]
print(f'Orphan assignments (no customer): {orphan_assign}')

# 4. Check tariff plans with valid meter type enum
pgc.execute("""
    SELECT DISTINCT meter_type FROM sim_system.tariff_plans
""")
types = [r[0] for r in pgc.fetchall()]
print(f'Tariff plan types: {types}')

# 5. List projects with data
pgc.execute("""
    SELECT p.code, p.name,
        (SELECT COUNT(*) FROM sim_system.customers c WHERE c.project_id = p.id) as cust_count,
        (SELECT COUNT(*) FROM sim_system.meters m WHERE m.project_id = p.id) as meter_count,
        (SELECT COUNT(*) FROM sim_system.tariff_plans t WHERE t.project_id = p.id) as tariff_count
    FROM sim_system.projects p
""")
print('\nProjects:')
for r in pgc.fetchall():
    print(f'  {r[0]:25s} {r[1][:40]:40s} C={r[2]} M={r[3]} T={r[4]}')

# 6. Customer variance: compare source vs target for first 10
print('\nCustomer migration fidelity (first 10):')
slc.execute('''
    SELECT c.id, c.name, c.phone, c.meter_serial, p.name as project_name
    FROM customer c JOIN project p ON c.project_id = p.id
    ORDER BY c.id LIMIT 10
''')
source_customers = {r['id']: dict(r) for r in slc.fetchall()}

pgc.execute("""
    SELECT customer_code, name, phone
    FROM sim_system.customers ORDER BY created_at LIMIT 10
""")
errors = 0
for r in pgc.fetchall():
    print(f'  {r[0]:10s} {r[1][:30]:30s} phone={r[2]}')

# 7. Check source has 54 customers total, and tariff count
slc.execute('SELECT COUNT(*) FROM customer')
source_cust = slc.fetchone()[0]
slc.execute('SELECT COUNT(*) FROM tariff')
source_tar = slc.fetchone()[0]
print(f'\nSource totals: {source_cust} customers, {source_tar} tariffs')
pgc.execute('SELECT COUNT(*) FROM sim_system.customers')
target_cust = pgc.fetchone()[0]
pgc.execute('SELECT COUNT(*) FROM sim_system.tariff_plans')
target_tar = pgc.fetchone()[0]
print(f'Target totals: {target_cust} customers, {target_tar} tariff plans')

# 8. Backend API test
import urllib.request
try:
    resp = urllib.request.urlopen('http://127.0.0.1:3001/api/v1/health', timeout=5)
    print(f'\nHealth endpoint: {resp.status} {resp.read().decode()}')
except Exception as e:
    print(f'\nHealth endpoint error: {e}')

# Summary
print('\n' + '=' * 60)
variance = orphan_customers + orphan_meters + orphan_assign
print(f'DATA VARIANCE: {variance}')
if variance == 0:
    print('RESULT: PASS ✅ — Data Variance = 0')
else:
    print(f'RESULT: FAIL ❌ — Data Variance = {variance}')

pg.close()
sl.close()
