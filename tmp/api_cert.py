import urllib.request, json, jwt, time, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://127.0.0.1:3001/api/v1'
JWT_SECRET = 'dev-jwt-secret-do-not-use-in-production'

token = jwt.encode({
    'sub': 'cert-user-001', 'userId': 'cert-user-001',
    'role': 'super_admin', 'projectScope': None,
    'iat': int(time.time()), 'exp': int(time.time()) + 3600
}, JWT_SECRET, algorithm='HS256')

headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

def test(method, path, body=None):
    url = f'{BASE}{path}'
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        body = resp.read().decode('utf-8')
        return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        b = e.read().decode('utf-8') if e.read() else '{}'
        try: return e.code, json.loads(b)
        except: return e.code, {'error': b[:100]}

# Test all endpoints
print('=== H1-H2-H3: API Certification ===')
for ep in ['/health', '/projects', '/meters', '/tariffs', '/periods']:
    st, data = test('GET', ep)
    s = json.dumps(data, ensure_ascii=False)[:200]
    print(f'  GET {ep:30s} {st} | {s if st==200 else str(data)[:100]}')

# Project detail
st, data = test('GET', '/projects')
if st == 200 and isinstance(data, list) and len(data) > 0:
    pid = data[0].get('id', '')
    print(f'\nFirst project ID: {pid}')
    for ep in [f'/projects/{pid}/customers', f'/projects/{pid}/locations',
               f'/projects/{pid}/dashboard/kpis',
               f'/projects/{pid}/dashboard/consumption',
               f'/projects/{pid}/dashboard/activity',
               f'/projects/{pid}/water-balance']:
        st2, data2 = test('GET', ep)
        print(f'  GET {ep:60s} {st2} | {json.dumps(data2, ensure_ascii=False)[:100]}')
else:
    print(f'Projects API failed: {st} {json.dumps(data, ensure_ascii=False)[:200]}')

# Review-queue
st, data = test('GET', '/readings/review-queue')
print(f'\n  GET /readings/review-queue: {st} | {json.dumps(data, ensure_ascii=False)[:100]}')

# Invoice generate
st, data = test('POST', '/invoices/generate', {'projectId': 'test', 'periodId': 'test'})
print(f'  POST /invoices/generate: {st} | {json.dumps(data, ensure_ascii=False)[:100]}')

# Payment
st, data = test('POST', '/payments', {'amount': 100})
print(f'  POST /payments: {st} | {json.dumps(data, ensure_ascii=False)[:100]}')

# Auth refresh
st, data = test('POST', '/auth/refresh', {'refreshToken': 'test'})
print(f'  POST /auth/refresh: {st} | {json.dumps(data, ensure_ascii=False)[:100]}')
