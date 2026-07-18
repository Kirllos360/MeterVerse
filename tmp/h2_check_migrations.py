import psycopg2, json, sys
sys.stdout.reconfigure(encoding='utf-8')
DSN = 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'
pg = psycopg2.connect(DSN); c = pg.cursor()

# Check migration state
c.execute('SELECT migration_name, applied_steps_count, started_at, finished_at FROM sim_system."_prisma_migrations" ORDER BY started_at')
print('Applied migrations:')
for r in c.fetchall():
    print(f'  {r[0]} (steps: {r[1]}, started: {r[2]}, finished: {r[3]})')

# List all tables
c.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='sim_system' ORDER BY tablename")
print('\nAll tables:')
for r in c.fetchall():
    print(f'  {r[0]}')

# Check models missing tables
print('\n--- Checking for user/role tables ---')
c.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='sim_system' AND (tablename LIKE '%user%' OR tablename LIKE '%role%' OR tablename LIKE '%perm%' OR tablename LIKE '%login%' OR tablename LIKE '%refresh%')")
rows = c.fetchall()
if rows:
    for r in rows: print(f'  {r[0]}')
else:
    print('  None found — user/role models not migrated')

pg.close()
