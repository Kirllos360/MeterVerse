"""
Meter Verse Migration Engine — R4/R5
Transforms legacy Collection System SQLite data → Meter Verse PostgreSQL (sim_system schema)
"""
import sqlite3, psycopg2, hashlib, json, os, sys
from datetime import datetime, date
from decimal import Decimal
from uuid import uuid4

# === Configuration ===
SQLITE_PATH = 'D:/meter/Meter/reference/collection-system/instance/collection_backup_20260606_114451.db'
PG_DSN = 'postgresql://meter_pulse:meter_pulse_dev@127.0.0.1:5432/meter_pulse'

# === State tracking ===
MIGRATION_LOG = []

def log(msg):
    print(f'[{datetime.now().isoformat()}] {msg}')
    sys.stdout.flush()
    MIGRATION_LOG.append(msg)

def connect_pg():
    return psycopg2.connect(PG_DSN)

def connect_sqlite():
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def clear_target():
    """Clear existing data from sim_schema (for clean re-runs)"""
    log('Clearing target tables...')
    conn = connect_pg()
    cur = conn.cursor()
    cur.execute('SET session_replication_role = replica')
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='sim_system' AND table_type='BASE TABLE' AND table_name NOT IN ('_prisma_migrations')")
    existing = {r[0] for r in cur.fetchall()}
    log(f'Found {len(existing)} tables to clear')
    for t in sorted(existing):
        cur.execute(f'TRUNCATE TABLE sim_system."{t}" CASCADE')
    cur.execute('SET session_replication_role = DEFAULT')
    conn.commit()
    cur.close()
    conn.close()
    log('Target cleared.')

def migrate_projects(sl, pg):
    """Migrate projects from SQLite → PostgreSQL"""
    cur = pg.cursor()
    cur_sl = sl.execute('SELECT * FROM project')
    count = 0
    for row in cur_sl.fetchall():
        pid = str(uuid4())
        code = row['name'].lower().replace(' ', '_')[:20]
        name_ar = row['name_ar'] or row['name']
        cur.execute("""
            INSERT INTO sim_system.projects (id, code, name, status, tax_enabled, tax_rate,
                water_difference_mode, created_at, updated_at, created_by, updated_by)
            VALUES (%s, %s, %s, 'active', false, NULL, 'report_only', %s, %s, 'migration', 'migration')
        """, (pid, code, row['name'] + ' / ' + name_ar,
              row['created_at'] or datetime.now(), datetime.now()))
        count += 1
        # Create location node for the project (zone level)
        if row['name']:
            loc_id = str(uuid4())
            loc_code = code + '_zone'
            cur.execute("""
                INSERT INTO sim_system.location_nodes (id, project_id, parent_id, node_type, code, name,
                    status, created_at, updated_at, created_by, updated_by)
                VALUES (%s, %s, NULL, 'zone', %s, %s, 'active', %s, %s, 'migration', 'migration')
            """, (loc_id, pid, loc_code, row['name'], datetime.now(), datetime.now()))
    pg.commit()
    log(f'Migrated {count} projects with location zones')
    return count

def migrate_users(sl, pg):
    """Migrate users"""
    cur = pg.cursor()
    cur_sl = sl.execute('SELECT * FROM user')
    count = 0
    for row in cur_sl.fetchall():
        # Users go to auth system — we record in audit_log as reference
        cur.execute("""
            INSERT INTO sim_system.audit_log (id, actor_id, actor_role, action, resource_type,
                resource_id, before_state, after_state, created_at)
            VALUES (%s, %s, %s, 'create', 'user', %s, NULL, %s, %s)
        """, (str(uuid4()), str(row['id']), row['role'] or 'operator',
              str(row['id']), json.dumps({'username': row['username'], 'display_name': row['display_name']}),
              datetime.now()))
        count += 1
    pg.commit()
    log(f'Logged {count} users to audit_trail')
    return count

def migrate_customers(sl, pg, limit=None):
    """Migrate customers with their assignments"""
    cur = pg.cursor()
    cur_sl = sl.execute('''
        SELECT c.*, p.name as project_name, p.id as legacy_project_id
        FROM customer c JOIN project p ON c.project_id = p.id
        ORDER BY c.id
    ''')
    rows = cur_sl.fetchall()
    if limit:
        rows = rows[:limit]

    # Get project ID mapping
    cur.execute('SELECT id, code FROM sim_system.projects')
    projects = {r[1].split('/')[0].strip().lower().replace(' ', '_')[:20]: r[0] for r in cur.fetchall()}

    count = 0
    for row in rows:
        project_code = row['project_name'].lower().replace(' ', '_')[:20]
        pg_project_id = projects.get(project_code)
        if not pg_project_id:
            log(f'WARN: No project mapping for {row["project_name"]}, skipping customer {row["id"]}')
            continue

        customer_id = str(uuid4())
        customer_code = f'C{row["id"]:04d}'

        cur.execute("""
            INSERT INTO sim_system.customers (id, project_id, customer_code, name, phone, email,
                customer_type, national_or_commercial_id, status, created_at, updated_at, created_by, updated_by)
            VALUES (%s, %s, %s, %s, %s, %s, 'individual', 'migrated', 'active', %s, %s, 'migration', 'migration')
        """, (customer_id, pg_project_id, customer_code, row['name'] or '',
              row['phone'] or '', row['email'] or '',
              row['created_at'] or datetime.now(), datetime.now()))
        count += 1

        # Create unit-level location node if unit_number exists
        if row['unit_number']:
            unit_id = str(uuid4())
            cur.execute("""
                INSERT INTO sim_system.location_nodes (id, project_id, parent_id, node_type, code, name,
                    status, created_at, updated_at, created_by, updated_by)
                VALUES (%s, %s, NULL, 'unit', %s, %s, 'active', %s, %s, 'migration', 'migration')
            """, (unit_id, pg_project_id, f'unit_{row["unit_number"]}', f'Unit {row["unit_number"]}',
                  datetime.now(), datetime.now()))

            # Create customer-unit assignment
            cur.execute("""
                INSERT INTO sim_system.customer_unit_assignments (id, customer_id, unit_id,
                    start_at, end_at, reason, created_at, updated_at, created_by, updated_by)
                VALUES (%s, %s, %s, %s, NULL, 'migration', %s, %s, 'migration', 'migration')
            """, (str(uuid4()), customer_id, unit_id, datetime.now(), datetime.now(), datetime.now()))

        # Create meter if meter_serial exists
        if row['meter_serial']:
            meter_id = str(uuid4())
            cur.execute("""
                INSERT INTO sim_system.meters (id, serial_number, meter_type, brand, model, status,
                    installation_date, activation_date, project_id, location_id,
                    created_at, updated_at, created_by, updated_by)
                VALUES (%s, %s, 'electricity', 'unknown', 'unknown', 'assigned',
                    %s, %s, %s, NULL, %s, %s, 'migration', 'migration')
            """, (meter_id, row['meter_serial'], datetime.now(), datetime.now(),
                  pg_project_id, datetime.now(), datetime.now()))

    pg.commit()
    log(f'Migrated {count} customers with units and meters')
    return count

TYPE_MAP = {
    'electricity': 'electricity',
    'water': 'water_main',
    'chilled': 'electricity',
    'solar': 'electricity',
}

def migrate_tariffs(sl, pg):
    """Migrate tariff plans"""
    cur = pg.cursor()
    cur.execute('SELECT id FROM sim_system.projects LIMIT 1')
    first_project = cur.fetchone()
    first_project_id = first_project[0] if first_project else None
    if not first_project_id:
        log('No projects found, skipping tariffs')
        return 0
    cur_sl = sl.execute("SELECT DISTINCT type, rate FROM tariff")
    count = 0
    for row in cur_sl.fetchall():
        mt = TYPE_MAP.get(row['type'], 'electricity')
        cur.execute("""
            INSERT INTO sim_system.tariff_plans (id, project_id, meter_type, rate_per_unit, currency,
                effective_from, effective_to, status, created_at, updated_at, created_by, updated_by)
            VALUES (%s, %s, %s, %s, 'EGP', '2026-01-01', NULL, 'active', %s, %s, 'migration', 'migration')
        """, (str(uuid4()), first_project_id, mt, float(row['rate']),
              datetime.now(), datetime.now()))
        count += 1
    pg.commit()
    log(f'Migrated {count} tariff plans')
    return count

def run_pilot():
    """Run the full pilot migration"""
    log('=' * 60)
    log('METER VERSE MIGRATION ENGINE — PILOT (R5)')
    log('=' * 60)

    # Connect
    sl = connect_sqlite()
    pg = connect_pg()
    pg.autocommit = False

    try:
        # Phase 1: Clear and rebuild
        clear_target()

        # Phase 2: Projects
        p_count = migrate_projects(sl, pg)

        # Phase 3: Users (audit trail)
        u_count = migrate_users(sl, pg)

        # Phase 4: Tariffs
        t_count = migrate_tariffs(sl, pg)

        # Phase 5: Customers (pilot = 10)
        c_count = migrate_customers(sl, pg, limit=10)

        # Verify
        cur = pg.cursor()
        for table in ['projects', 'location_nodes', 'customers', 'customer_unit_assignments',
                      'meters', 'tariff_plans', 'audit_log']:
            cur.execute(f'SELECT COUNT(*) FROM sim_system."{table}"')
            cnt = cur.fetchone()[0]
            log(f'  {table}: {cnt} rows')

        pg.commit()
        log('PILOT MIGRATION COMPLETE')
        return True

    except Exception as e:
        pg.rollback()
        log(f'ERROR: {e}')
        import traceback
        traceback.print_exc()
        return False
    finally:
        sl.close()
        pg.close()

if __name__ == '__main__':
    success = run_pilot()
    sys.exit(0 if success else 1)
