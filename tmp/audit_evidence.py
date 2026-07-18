import os, sys, re, subprocess, json
sys.stdout.reconfigure(encoding='utf-8')
root = 'D:\\meter\\Meter'
backend = os.path.join(root, 'backend')
frontend = os.path.join(root, 'Frontend')
evidence = {}

# ===== TODO/FIXME/HACK/TEMP/STUB/MOCK/PLACEHOLDER/WORKAROUND scan =====
print('=== Scanning for anti-patterns ===')
patterns = ['TODO', 'FIXME', 'HACK', 'TEMP', 'STUB', 'MOCK', 'PLACEHOLDER', 'WORKAROUND', 'DUMMY', 'NOT_IMPLEMENTED', 'XXX']
anti_patterns = {}
for root_dir, dirs, files in os.walk(root):
    # skip node_modules, .git, __pycache__, dist, .next
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', '__pycache__', 'dist', '.next', 'graphify-out', 'cache')]
    for f in files:
        if f.endswith(('.ts', '.tsx', '.js', '.py', '.sql', '.json', '.yaml', '.yml', '.mjs')):
            fp = os.path.join(root_dir, f)
            try:
                with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
                    content = fh.read()
                    for p in patterns:
                        matches = [(i+1, l.strip()[:80]) for i, l in enumerate(content.split('\n')) if p in l.upper()]
                        if matches:
                            rel = os.path.relpath(fp, root)
                            anti_patterns.setdefault(p, []).extend([f'{rel}:{m[0]} {m[1]}' for m in matches])
            except: pass

for p in patterns:
    cnt = len(anti_patterns.get(p, []))
    print(f'  {p}: {cnt} occurrences')
    if cnt > 0:
        for m in anti_patterns[p][:5]:
            print(f'    {m}')

# ===== Source code analysis =====
print('\n=== Source code analysis ===')
backend_ts = []
frontend_tsx = []
for root_dir, dirs, files in os.walk(backend):
    dirs[:] = [d for d in dirs if d not in ('node_modules', 'dist', '.git')]
    for f in files:
        if f.endswith('.ts') and 'node_modules' not in root_dir and 'dist' not in root_dir:
            backend_ts.append(os.path.relpath(os.path.join(root_dir, f), backend))
for root_dir, dirs, files in os.walk(frontend):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.next', '.git', 'graphify-out')]
    for f in files:
        if f.endswith(('.ts', '.tsx')) and 'node_modules' not in root_dir and '.next' not in root_dir:
            frontend_tsx.append(os.path.relpath(os.path.join(root_dir, f), frontend))

evidence['backend_files'] = len(backend_ts)
evidence['frontend_files'] = len(frontend_tsx)
print(f'  Backend .ts files: {len(backend_ts)}')
print(f'  Frontend .ts/.tsx files: {len(frontend_tsx)}')

# ===== Module analysis =====
print('\n=== Module analysis ===')
modules_path = os.path.join(backend, 'src')
modules = [d for d in os.listdir(modules_path) if os.path.isdir(os.path.join(modules_path, d))]
print(f'  Backend modules: {modules}')
evidence['modules'] = modules

# ===== Controller/Route count =====
controllers = []
for root_dir, dirs, files in os.walk(os.path.join(backend, 'src')):
    for f in files:
        if f.endswith('.controller.ts'):
            rel = os.path.relpath(os.path.join(root_dir, f), backend)
            controllers.append(rel)
print(f'  Controllers: {len(controllers)}')
for c in sorted(controllers):
    print(f'    {c}')

# ===== Prisma schema =====
sch_path = os.path.join(backend, 'prisma', 'schema.prisma')
if os.path.exists(sch_path):
    with open(sch_path, 'r', encoding='utf-8') as f:
        sch_content = f.read()
    models = re.findall(r'^model (\w+)', sch_content, re.MULTILINE)
    enums = re.findall(r'^enum (\w+)', sch_content, re.MULTILINE)
    evidence['prisma_models'] = models
    evidence['prisma_enums'] = enums
    print(f'  Prisma models: {len(models)} -> {models}')
    print(f'  Prisma enums: {len(enums)} -> {enums}')
    
    # Check for missing tables
    tables_in_db = []
    import psycopg2
    try:
        pg = psycopg2.connect('postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse')
        c = pg.cursor()
        c.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='sim_system' ORDER BY tablename")
        tables_in_db = [r[0] for r in c.fetchall()]
        pg.close()
    except: pass
    evidence['db_tables'] = tables_in_db
    
    # Compare Prisma models vs DB tables
    model_tables = {m.lower(): m for m in models}
    missing = []
    for m in models:
        table_name = m.lower() + 's'  # heuristic
        if table_name not in tables_in_db and m not in tables_in_db:
            # Check @@map
            map_match = re.search(rf'model {m}.*?@@map\("(\w+)"\)', sch_content, re.DOTALL)
            if map_match:
                actual_table = map_match.group(1)
                if actual_table not in tables_in_db:
                    missing.append((m, actual_table))
            else:
                missing.append((m, table_name))
    evidence['models_missing_from_db'] = missing
    print(f'  Models missing from DB: {missing}')

# ===== Test analysis =====
print('\n=== Test analysis ===')
test_files = []
for root_dir, dirs, files in os.walk(os.path.join(backend, 'test')):
    if 'node_modules' not in root_dir:
        for f in files:
            if f.endswith('.spec.ts'):
                test_files.append(os.path.relpath(os.path.join(root_dir, f), os.path.join(backend, 'test')))
print(f'  Backend test files: {len(test_files)}')
for t in sorted(test_files):
    print(f'    {t}')
evidence['backend_tests'] = test_files

# Check frontend smoke test
smoke_path = os.path.join(frontend, 'scripts', 'smoke-all-pages.mjs')
if os.path.exists(smoke_path):
    evidence['frontend_smoke'] = True
    print('  Frontend smoke test: EXISTS')
else:
    evidence['frontend_smoke'] = False
    print('  Frontend smoke test: MISSING')

# ===== TODO counts for reports =====
evidence['todo_counts'] = {p: len(anti_patterns.get(p, [])) for p in patterns}

# ===== Save evidence =====
with open(os.path.join(root, 'tmp', 'audit_evidence.json'), 'w', encoding='utf-8') as f:
    json.dump(evidence, f, indent=2, default=str)
print('\n=== Evidence saved ===')
