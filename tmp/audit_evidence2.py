import os, sys, re, json
sys.stdout.reconfigure(encoding='utf-8')
root = 'D:\\meter\\Meter'
evidence = {}
skip_dirs = {'node_modules','.git','__pycache__','dist','.next','graphify-out','cache','.specify','tools','documentation','specs','backup files','.swm'}

patterns = ['TODO','FIXME','HACK','TEMP','STUB','MOCK','PLACEHOLDER','WORKAROUND','DUMMY','NOT_IMPLEMENTED','XXX']
anti_patterns = {p:[] for p in patterns}

print('=== Scanning for anti-patterns (backend + frontend only) ===')
scan_dirs = [
    os.path.join(root,'backend','src'),
    os.path.join(root,'backend','prisma'),
    os.path.join(root,'backend','test'),
    os.path.join(root,'Frontend','src'),
    os.path.join(root,'Frontend','scripts'),
    os.path.join(root,'scripts'),
]
for sd in scan_dirs:
    if not os.path.exists(sd): continue
    for root_dir, dirs, files in os.walk(sd):
        dirs[:] = [d for d in dirs if d not in skip_dirs and not d.startswith('.')]
        for f in files:
            if not f.endswith(('.ts','.tsx','.js','.py','.sql','.mjs')): continue
            fp = os.path.join(root_dir, f)
            try:
                with open(fp,'r',encoding='utf-8',errors='ignore') as fh:
                    for i, line in enumerate(fh,1):
                        for p in patterns:
                            if p in line.upper():
                                anti_patterns[p].append(f'{os.path.relpath(fp,root)}:{i} {line.strip()[:80]}')
            except: pass

for p in patterns:
    cnt = len(anti_patterns[p])
    print(f'  {p}: {cnt}')
    if cnt>0:
        for m in anti_patterns[p][:3]: print(f'    {m}')

# Module analysis
modules_path = os.path.join(root,'backend','src')
modules = sorted([d for d in os.listdir(modules_path) if os.path.isdir(os.path.join(modules_path,d)) and not d.startswith('.')])
print(f'\nBackend modules: {modules}')
evidence['modules'] = modules

# Controllers
controllers = []
for root_dir, dirs, files in os.walk(modules_path):
    for f in files:
        if f.endswith('.controller.ts'):
            controllers.append(os.path.relpath(os.path.join(root_dir,f),root))
print(f'Controllers: {len(controllers)}')
for c in sorted(controllers): print(f'  {c}')

# Prisma schema
sch = os.path.join(root,'backend','prisma','schema.prisma')
with open(sch,'r',encoding='utf-8') as f: sch_content = f.read()
models = re.findall(r'^model (\w+)', sch_content, re.MULTILINE)
enums = re.findall(r'^enum (\w+)', sch_content, re.MULTILINE)
evidence['models'] = models; evidence['enums'] = enums
print(f'\nPrisma models: {len(models)}')
print(f'Prisma enums: {len(enums)}')

# DB tables
import psycopg2
try:
    pg = psycopg2.connect('postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse')
    c = pg.cursor()
    c.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='sim_system' ORDER BY tablename")
    db_tables = [r[0] for r in c.fetchall()]
    c.execute("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='sim_system'")
    total_cols = c.fetchone()[0]
    evidence['db_tables'] = db_tables; evidence['db_total_columns'] = total_cols
    print(f'\nDB tables: {len(db_tables)}, columns: {total_cols}')
    
    # Check which models are missing from DB
    for model_name in models:
        map_match = re.search(rf'model {re.escape(model_name)}.*?@@map\("(\w+)"\)', sch_content, re.DOTALL)
        expected_table = map_match.group(1) if map_match else None
        if not expected_table:
            # Convert camelCase to snake_case plural
            s = re.sub(r'([A-Z])', r'_\1', model_name).lower().strip('_')
            expected_table = s + ('s' if not s.endswith('s') else 'es' if s.endswith('s') else '')
        if expected_table and expected_table not in db_tables:
            print(f'  MISSING TABLE: {model_name} -> {expected_table}')
    pg.close()
except Exception as e:
    evidence['db_error'] = str(e)
    print(f'DB error: {e}')

# Test files
test_files = []
for root_dir, dirs, files in os.walk(os.path.join(root,'backend','test')):
    for f in files:
        if f.endswith('.spec.ts'): test_files.append(f)
print(f'\nBackend tests: {len(test_files)} files')
for t in sorted(test_files): print(f'  {t}')
evidence['test_files'] = test_files

# Frontend smoke
smoke = os.path.join(root,'Frontend','scripts','smoke-all-pages.mjs')
evidence['frontend_smoke'] = os.path.exists(smoke)
print(f'\nFrontend smoke test: {"EXISTS" if evidence["frontend_smoke"] else "MISSING"}')

# Anti-pattern totals
evidence['todo_total'] = sum(len(v) for v in anti_patterns.values())
evidence['anti_patterns'] = anti_patterns

with open(os.path.join(root,'tmp','audit_evidence.json'),'w',encoding='utf-8') as f:
    json.dump(evidence, f, indent=2, default=str)
print('\n=== Evidence saved to tmp/audit_evidence.json ===')
