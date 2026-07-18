import psycopg2, sys
sys.stdout.reconfigure(encoding='utf-8')
DSN='postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'
pg=psycopg2.connect(DSN); c=pg.cursor()

c.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='payments' ORDER BY ordinal_position")
print('Payments columns:')
for r in c.fetchall(): print(f'  {r[0]:30s} {r[1]}')

c.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='invoices' ORDER BY ordinal_position")
print('\nInvoices columns:')
for r in c.fetchall(): print(f'  {r[0]:30s} {r[1]}')

c.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='invoice_adjustments' ORDER BY ordinal_position")
print('\nInvoice adjustments:')
for r in c.fetchall(): print(f'  {r[0]:30s} {r[1]}')

c.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='sim_system' AND table_name='payment_allocations' ORDER BY ordinal_position")
print('\nPayment allocations:')
for r in c.fetchall(): print(f'  {r[0]:30s} {r[1]}')

pg.close()
