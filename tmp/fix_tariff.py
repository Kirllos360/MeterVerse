import sqlite3
conn = sqlite3.connect('D:/meter/Meter/reference/collection-system/instance/collection_backup_20260606_114451.db')
cur = conn.cursor()
cur.execute("SELECT DISTINCT type, unit FROM tariff")
for r in cur.fetchall():
    print(f'type={r[0]}, unit={r[1]}')
cur.execute("SELECT COUNT(*) FROM tariff")
print(f'Total tariffs: {cur.fetchone()[0]}')
conn.close()
