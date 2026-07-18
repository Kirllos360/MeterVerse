import sys, psycopg2
sys.stdout.reconfigure(encoding='utf-8')

try:
    conn = psycopg2.connect(host='127.0.0.1', port=5432, dbname='meter_pulse', user='meter_pulse', password='meter_pulse_dev')
    cur = conn.cursor()
    
    cur.execute("SELECT schema_name FROM information_schema.schemata ORDER BY schema_name")
    schemas = [r[0] for r in cur.fetchall()]
    print('Schemas:', schemas)
    
    cur.execute("""SELECT table_name FROM information_schema.tables 
                   WHERE table_schema = 'sim_system' AND table_type = 'BASE TABLE'
                   ORDER BY table_name""")
    tables = [r[0] for r in cur.fetchall()]
    print(f'\nTables in sim_system ({len(tables)}):')
    for t in tables: print(f'  {t}')
    
    print('\nRow counts:')
    for t in tables:
        try:
            cur.execute(f'SELECT COUNT(*) FROM sim_system."{t}"')
            cnt = cur.fetchone()[0]
            print(f'  {t}: {cnt} rows')
        except Exception as e:
            print(f'  {t}: ERROR - {e}')
    
    cur.close(); conn.close()
except Exception as e:
    print(f'ERROR: {e}')
