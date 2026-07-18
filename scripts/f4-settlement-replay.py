"""Phase F4: Settlement Replay - validates settlement XLSM data against formula Total=ConsumptionxRate"""
import openpyxl, os, json, glob
from collections import defaultdict

BASE = r"D:\Operation\Months\09-2025\DONE\GC\New folder (3)\DONE\EXCEL"
xlsm_files = glob.glob(BASE + r"\*.xlsm")

results = {
    'files_processed': 0, 'total_settlements': 0,
    'match_count': 0, 'mismatch_count': 0,
    'anomalies': [], 'rate_counts': defaultdict(int),
    'expected_records': [],
}

seen = set()
for f in sorted(xlsm_files):
    name = os.path.basename(f).replace('.xlsm', '').replace(' (2)', '')
    if name in seen:
        continue
    seen.add(name)
    try:
        wb = openpyxl.load_workbook(f, data_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
        wb.close()
    except Exception as e:
        results['anomalies'].append({'file': f, 'error': str(e)})
        continue

    try:
        customer = str(rows[4][1]) if len(rows) > 4 and rows[4][1] else ''
        unit = str(rows[7][1]) if len(rows) > 7 and rows[7][1] else ''
        contract_type = str(rows[8][1]) if len(rows) > 8 and rows[8][1] else ''
        month_str = str(rows[9][1]) if len(rows) > 9 and rows[9][1] else ''

        rrow = rows[13] if len(rows) > 13 else []
        prev_reading = float(str(rrow[0]).replace(',','')) if rrow[0] else 0
        curr_reading = float(str(rrow[1]).replace(',','')) if rrow[1] else 0
        consumption = float(str(rrow[2]).replace(',','')) if rrow[2] else 0
        rate = float(str(rrow[3]).replace(',','')) if rrow[3] else 0
        total_from_read = float(str(rrow[4]).replace(',','')) if rrow[4] else 0

        fees_row = rows[14] if len(rows) > 14 else []
        admin_row = rows[15] if len(rows) > 15 else []
        fees = float(str(fees_row[4]).replace(',','')) if len(fees_row) > 4 and fees_row[4] else 0
        admin = float(str(admin_row[4]).replace(',','')) if len(admin_row) > 4 and admin_row[4] else 0

        total_row = rows[16] if len(rows) > 16 else []
        invoice_total = float(str(total_row[4]).replace(',','')) if len(total_row) > 4 and total_row[4] else 0
    except Exception as e:
        results['anomalies'].append({'file': f, 'error': str(e), 'msg': 'parse error'})
        continue

    results['files_processed'] += 1
    results['total_settlements'] += 1

    expected_total = round(consumption * rate, 2)
    match = abs(invoice_total - expected_total) < 0.015

    if match:
        results['match_count'] += 1
    else:
        results['mismatch_count'] += 1
        results['anomalies'].append({
            'customer': customer, 'unit': unit, 'consumption': consumption,
            'rate': rate, 'invoice_total': invoice_total, 'expected': expected_total
        })

    results['rate_counts'][rate] += 1

    if abs(fees) > 0.01:
        results['anomalies'].append({'customer': customer, 'field': 'fees', 'value': fees})
    if abs(admin) > 0.01:
        results['anomalies'].append({'customer': customer, 'field': 'admin', 'value': admin})

    results['expected_records'].append({
        'customer': customer, 'unit': unit, 'month': month_str,
        'btu_consumption': round(consumption, 3), 'rate_per_btu': rate,
        'fixed_amount': 0, 'variable_amount': round(consumption * rate, 2),
        'total_amount': round(consumption * rate, 2), 'fees': fees, 'admin': admin,
        'previous_reading': prev_reading, 'current_reading': curr_reading,
        'status': 'APPROVED',
    })

# Summary
total = results['total_settlements']
pct = 100 * results['match_count'] / total if total > 0 else 0
print(f"F4 SETTLEMENT REPLAY RESULTS")
print(f"Files: {results['files_processed']}")
print(f"Settlements: {total}")
print(f"MATCH: {results['match_count']} ({pct:.1f}%)")
print(f"MISMATCH: {results['mismatch_count']}")
print(f"Non-zero fees: {sum(1 for a in results['anomalies'] if a.get('field') == 'fees')}")
print(f"Non-zero admin: {sum(1 for a in results['anomalies'] if a.get('field') == 'admin')}")
print(f"Rate distribution:")
for r, c in sorted(results['rate_counts'].items()):
    print(f"  Rate {r}: {c}")
print(f"Anomalies:")
for a in results['anomalies']:
    if 'consumption' in a:
        print(f"  {a.get('customer','')[:30]} cons={a['consumption']:.1f} rate={a['rate']} total={a['invoice_total']} exp={a['expected']}")
    elif 'error' in a:
        print(f"  ERROR: {a.get('file','')} - {a.get('error','')}")

os.makedirs('reports', exist_ok=True)
with open('reports/f4-settlement-replay.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2, default=str)

with open('reports/f4-expected-settlements.csv', 'w', encoding='utf-8') as f:
    f.write('customer,unit,month,btu_consumption,rate_per_btu,fixed_amount,variable_amount,total_amount,status\n')
    for r in results['expected_records']:
        f.write(f"{r['customer']},{r['unit']},{r['month']},{r['btu_consumption']},{r['rate_per_btu']},{r['fixed_amount']},{r['variable_amount']},{r['total_amount']},{r['status']}\n")

print(f"\nSaved: reports/f4-settlement-replay.json")
print(f"Saved: reports/f4-expected-settlements.csv")
