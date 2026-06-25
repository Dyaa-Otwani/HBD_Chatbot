import sqlite3
import csv
import json
import os

DB_PATH = 'google_map_data.db'
CSV_PATH = 'g_map_master_table_sample.csv'

# Check DB
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
print('=== DB TABLES ===', tables)

for t in tables:
    cur.execute(f"PRAGMA table_info({t})")
    cols = [(r['name'], r['type']) for r in cur.fetchall()]
    cur.execute(f"SELECT COUNT(*) as c FROM {t}")
    cnt = cur.fetchone()['c']
    print(f'\n--- {t} ({cnt} rows) ---')
    for c in cols:
        print(f'  {c[0]} ({c[1]})')
    if cnt > 0:
        cur.execute(f"SELECT * FROM {t} LIMIT 2")
        rows = cur.fetchall()
        for r in rows:
            print('  SAMPLE:', dict(r))

conn.close()

# Check CSV
print('\n=== CSV ===')
if os.path.exists(CSV_PATH):
    with open(CSV_PATH, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        print(f'HEADERS: {headers}')
        rows = []
        for i, row in enumerate(reader):
            rows.append(row)
            if i >= 3:
                break
        print(f'TOTAL SAMPLE ROWS READ: {len(rows)}')
        for r in rows[:2]:
            print('SAMPLE:', {k: v for k, v in r.items() if v})
    # Count total
    with open(CSV_PATH, 'r', encoding='utf-8', errors='ignore') as f:
        total = sum(1 for _ in f) - 1
    print(f'TOTAL CSV ROWS: {total}')
else:
    print('CSV NOT FOUND')
