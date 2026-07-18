import sqlite3
conn = sqlite3.connect('D:/meter/Meter/reference/collection-system/instance/collection.db')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = cur.fetchall()
for t in tables:
    print(f'\n=== {t[0]} ===')
    cur.execute(f'PRAGMA table_info("{t[0]}")')
    cols = cur.fetchall()
    for c in cols:
        print(f'  {c[1]:30s} {c[2]:20s} nullable={not c[3]} default={c[4]}')
    cur.execute(f'SELECT COUNT(*) FROM "{t[0]}"')
    cnt = cur.fetchone()[0]
    print(f'  Rows: {cnt}')
conn.close()
