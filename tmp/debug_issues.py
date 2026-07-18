import urllib.request, json, jwt, time, sys, psycopg2
sys.stdout.reconfigure(encoding='utf-8')
BASE='http://127.0.0.1:3001/api/v1'
SECRET='dev-jwt-secret-do-not-use-in-production'
token=jwt.encode({'sub':'u1','userId':'u1','role':'super_admin','projectScope':None,
    'iat':int(time.time()),'exp':int(time.time())+3600},SECRET,algorithm='HS256')

def api(m,p,b=None):
    url=f'{BASE}{p}'
    d=json.dumps(b).encode() if b else None
    req=urllib.request.Request(url,data=d,method=m,headers={'Content-Type':'application/json','Authorization':f'Bearer {token}'})
    try:
        r=urllib.request.urlopen(req,timeout=10)
        raw=r.read()
        return r.status,json.loads(raw.decode('utf-8')) if raw else {}
    except urllib.error.HTTPError as e:
        bd=e.read().decode('utf-8') if e.read() else ''
        try: return e.code,json.loads(bd) if bd else {}
        except: return e.code,{'error':bd[:200]}
    except Exception as e:
        return 0,{'error':str(e)[:200]}

# Get first project
st,p=api('GET','/projects')
if st==200 and p:
    pid=p[0]['id']
    print(f'Project ID: {pid}')
    st2,d2=api('GET',f'/projects/{pid}/water-balance')
    print(f'Water balance GET: {st2} {json.dumps(d2,ensure_ascii=False)[:200]}')
    
    st3,d3=api('POST','/invoices/generate',{'projectId':pid,'periodId':'test'})
    print(f'Invoice generate POST: {st3} {json.dumps(d3,ensure_ascii=False)[:300]}')
    
    # Check billing periods
    pg=psycopg2.connect('postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse')
    c=pg.cursor()
    c.execute('SELECT id, project_id, period_code FROM sim_system.billing_periods')
    rows=c.fetchall()
    print(f'Billing periods ({len(rows)}): {rows}')
    if not rows:
        # Create a billing period
        import uuid
        bp_id=str(uuid.uuid4())
        c.execute("INSERT INTO sim_system.billing_periods (id, project_id, period_code, period_name, start_date, end_date, due_date, status, created_at) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
            (bp_id, pid, '2026-06', 'June 2026', '2026-06-01', '2026-06-30', '2026-07-15', 'open', '2026-06-17'))
        pg.commit()
        print(f'Created billing period: {bp_id}')
        
        # Retry invoice generation
        st4,d4=api('POST','/invoices/generate',{'projectId':pid,'periodId':bp_id})
        print(f'Invoice generate (retry): {st4} {json.dumps(d4,ensure_ascii=False)[:300]}')
    pg.close()
else:
    print(f'Cannot get projects: {st}')
