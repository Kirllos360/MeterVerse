import sys, psycopg2
sys.stdout.reconfigure(encoding='utf-8')

conn = psycopg2.connect(host='127.0.0.1', port=5432, dbname='meter_pulse', user='meter_pulse', password='meter_pulse_dev')
cur = conn.cursor()

for schema in ['public']:
    cur.execute("""SELECT table_name FROM information_schema.tables 
                   WHERE table_schema = %s AND table_type = 'BASE TABLE'
                   ORDER BY table_name""", (schema,))
    tables = [r[0] for r in cur.fetchall()]
    print(f'Tables in {schema} ({len(tables)}):')
    for t in tables:
        cur.execute(f'SELECT COUNT(*) FROM "{schema}"."{t}"')
        cnt = cur.fetchone()[0]
        print(f'  {t}: {cnt} rows')

cur.close()
conn.close()
