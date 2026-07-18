import psycopg2
conn = psycopg2.connect('postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse')
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='sim_system' ORDER BY table_name")
tables = cur.fetchall()
print(f'Tables in sim_system ({len(tables)}):')
for t in tables:
    cur.execute(f'SELECT COUNT(*) FROM sim_system."{t[0]}"')
    cnt = cur.fetchone()[0]
    print(f'  {t[0]:40s} {cnt} rows')
conn.close()
