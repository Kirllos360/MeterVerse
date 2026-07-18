import sqlite3, json
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
        cur.execute(f'SELECT * FROM "{t}" LIMIT 3')
        rows = cur.fetchall()
        print(f'\n=== {t} ({cnt} rows) ===')
        for row in rows:
            d = dict(zip(cols, row))
            print(json.dumps(d, default=str, ensure_ascii=False)[:300])
conn.close()
