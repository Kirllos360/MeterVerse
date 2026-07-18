import sqlite3, sys
sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('D:/meter/Meter/reference/collection-system/instance/collection_backup_20260606_114451.db')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [t[0] for t in cur.fetchall()]
for t in tables:
    cur.execute(f'SELECT COUNT(*) FROM "{t}"')
    cnt = cur.fetchone()[0]
    if cnt > 0:
        cur.execute(f'PRAGMA table_info("{t}")')
        cols = [c[1] for c in cur.fetchall()]
        cur.execute(f'SELECT * FROM "{t}" LIMIT 2')
        rows = cur.fetchall()
        print(f'\n=== {t} ({cnt} rows) cols={len(cols)} ===')
        for row in rows:
            for i, c in enumerate(cols):
                v = str(row[i])[:80] if row[i] is not None else 'NULL'
                print(f'  {c}: {v}')
conn.close()
