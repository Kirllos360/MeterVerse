import psycopg2, json
DSN = 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'
pg = psycopg2.connect(DSN); c = pg.cursor()

c.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='sim_system' ORDER BY tablename")
print('Tables:', [r[0] for r in c.fetchall()])

c.execute("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='users' ORDER BY ordinal_position")
print('\nUsers columns:')
for col in c.fetchall(): print(f'  {col[0]:30s} {col[1]:20s} nullable={col[2]}')

c.execute('SELECT COUNT(*) FROM sim_system."users"')
print(f'\nUsers count: {c.fetchone()[0]}')
c.execute('SELECT * FROM sim_system."users"')
rows = c.fetchall()
if rows:
    desc = [d[0] for d in c.description]
    for r in rows:
        for i, v in enumerate(r): print(f'  {desc[i]:25s} = {v}')
        print()

c.execute("SELECT table_name FROM information_schema.columns WHERE table_schema='sim_system' AND (column_name ILIKE '%%role%%' OR column_name ILIKE '%%permission%%') GROUP BY table_name")
print(f'Tables with role/permission columns: {[r[0] for r in c.fetchall()]}')

# Check all tables for role/permission references
c.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='sim_system' AND (tablename LIKE '%%role%%' OR tablename LIKE '%%perm%%' OR tablename LIKE '%%user%%')")
print(f'Role/user/permission tables: {[r[0] for r in c.fetchall()]}')

# Now let's check the Prisma schema for user model
print('\n--- Full table list ---')
c.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='sim_system' ORDER BY tablename")
for t in c.fetchall():
    c.execute(f'SELECT COUNT(*) FROM sim_system."{t[0]}"')
    cnt = c.fetchone()[0]
    print(f'  {t[0]:35s} {cnt} rows')

pg.close()
