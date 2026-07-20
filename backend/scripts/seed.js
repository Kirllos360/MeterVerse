import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const PERMISSIONS = [
  { name: "users.read", description: "View users", module: "Users" },
  { name: "users.create", description: "Create users", module: "Users" },
  { name: "users.update", description: "Edit users", module: "Users" },
  { name: "users.delete", description: "Delete users", module: "Users" },
  { name: "roles.read", description: "View roles", module: "Roles" },
  { name: "roles.create", description: "Create roles", module: "Roles" },
  { name: "roles.update", description: "Edit roles", module: "Roles" },
  { name: "roles.delete", description: "Delete roles", module: "Roles" },
  { name: "settings.read", description: "View settings", module: "Settings" },
  { name: "settings.update", description: "Edit settings", module: "Settings" },
  { name: "audit.read", description: "View audit logs", module: "Audit" },
  { name: "customers.read", description: "View customers", module: "Customers" },
  { name: "customers.create", description: "Create customers", module: "Customers" },
  { name: "customers.update", description: "Edit customers", module: "Customers" },
  { name: "customers.delete", description: "Delete customers", module: "Customers" },
  { name: "meters.read", description: "View meters", module: "Meters" },
  { name: "meters.create", description: "Create meters", module: "Meters" },
  { name: "meters.update", description: "Edit meters", module: "Meters" },
  { name: "meters.delete", description: "Delete meters", module: "Meters" },
  { name: "readings.read", description: "View readings", module: "Readings" },
  { name: "readings.create", description: "Import readings", module: "Readings" },
  { name: "readings.delete", description: "Delete readings", module: "Readings" },
  { name: "invoices.read", description: "View invoices", module: "Invoices" },
  { name: "invoices.create", description: "Create invoices", module: "Invoices" },
  { name: "invoices.update", description: "Edit invoices", module: "Invoices" },
  { name: "invoices.delete", description: "Delete invoices", module: "Invoices" },
  { name: "payments.read", description: "View payments", module: "Payments" },
  { name: "payments.create", description: "Record payments", module: "Payments" },
  { name: "export", description: "Export data", module: "System" },
  { name: "admin.access", description: "Access admin panel", module: "System" },
]

const SETTINGS = [
  { key: "app.name", value: "MeterVerse", category: "general", type: "string" },
  { key: "app.timezone", value: "Africa/Cairo", category: "general", type: "string" },
  { key: "app.locale", value: "en", category: "general", type: "string" },
  { key: "app.currency", value: "EGP", category: "general", type: "string" },
  { key: "security.password.min_length", value: "8", category: "security", type: "number" },
  { key: "security.password.require_special", value: "true", category: "security", type: "boolean" },
  { key: "security.session.timeout_minutes", value: "60", category: "security", type: "number" },
  { key: "security.max_login_attempts", value: "5", category: "security", type: "number" },
  { key: "email.smtp.host", value: "", category: "email", type: "string" },
  { key: "email.smtp.port", value: "587", category: "email", type: "number" },
  { key: "email.from.name", value: "MeterVerse", category: "email", type: "string" },
  { key: "email.from.address", value: "noreply@meterverse.com", category: "email", type: "string" },
  { key: "billing.currency", value: "EGP", category: "billing", type: "string" },
  { key: "billing.vat_rate", value: "14", category: "billing", type: "number" },
  { key: "billing.payment_terms_days", value: "30", category: "billing", type: "number" },
  { key: "features.maintenance_mode", value: "false", category: "features", type: "boolean" },
  { key: "features.self_registration", value: "true", category: "features", type: "boolean" },
  { key: "upload.max_file_size_mb", value: "10", category: "upload", type: "number" },
  { key: "upload.allowed_extensions", value: ".csv,.pdf,.xlsx,.jpg,.png", category: "upload", type: "string" },
]

const FEATURE_FLAGS = [
  { key: "billing_automation", name: "Billing Automation", enabled: true, scope: "global" },
  { key: "realtime_monitoring", name: "Real-time Monitoring", enabled: true, scope: "global" },
  { key: "export_advanced", name: "Advanced Export", enabled: false, scope: "global" },
  { key: "multi_tenant", name: "Multi-tenant Support", enabled: true, scope: "global" },
  { key: "audit_trail", name: "Audit Trail", enabled: true, scope: "global" },
  { key: "api_access", name: "API Access", enabled: true, scope: "global" },
  { key: "sso_login", name: "SSO Login", enabled: false, scope: "global" },
  { key: "mfa_required", name: "MFA Required", enabled: false, scope: "global" },
]

async function main() {
  console.log("Seeding database...")

  // Seed permissions
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    })
  }
  console.log(`  ✅ ${PERMISSIONS.length} permissions`)

  // Seed roles
  const allPerms = await prisma.permission.findMany()
  const allPermIds = allPerms.map((p) => p.id)

  const superAdminRole = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: {},
    create: { name: "Super Admin", description: "Full system access", isSystem: true },
  })
  for (const pid of allPermIds) {
    await prisma.permissionOnRole.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: pid } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: pid },
    })
  }

  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin", description: "Administrative access, no delete", isSystem: true },
  })
  for (const p of allPerms) {
    if (!p.name.endsWith(".delete")) {
      await prisma.permissionOnRole.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: p.id },
      })
    }
  }

  const operatorRole = await prisma.role.upsert({
    where: { name: "Operator" },
    update: {},
    create: { name: "Operator", description: "Read + create, own scope", isSystem: true },
  })
  for (const p of allPerms) {
    if (p.name.endsWith(".read") || p.name.endsWith(".create") || p.name === "export" || p.name === "admin.access") {
      await prisma.permissionOnRole.upsert({
        where: { roleId_permissionId: { roleId: operatorRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: operatorRole.id, permissionId: p.id },
      })
    }
  }

  const viewerRole = await prisma.role.upsert({
    where: { name: "Viewer" },
    update: {},
    create: { name: "Viewer", description: "Read only, own scope", isSystem: true },
  })
  for (const p of allPerms) {
    if (p.name.endsWith(".read")) {
      await prisma.permissionOnRole.upsert({
        where: { roleId_permissionId: { roleId: viewerRole.id, permissionId: p.id } },
        update: {},
        create: { roleId: viewerRole.id, permissionId: p.id },
      })
    }
  }

  console.log(`  ✅ 4 roles (Super Admin, Admin, Operator, Viewer)`)

  // Seed admin user
  const adminPassword = await bcrypt.hash("Admin@123", 10)
  await prisma.user.upsert({
    where: { email: "admin@meterverse.com" },
    update: {},
    create: {
      email: "admin@meterverse.com",
      password: adminPassword,
      name: "Super Admin",
      role: "super_admin",
      roleId: superAdminRole.id,
      status: "active",
      emailVerified: true,
    },
  })
  console.log(`  ✅ Admin user: admin@meterverse.com / Admin@123`)

  // Seed system settings
  for (const s of SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }
  console.log(`  ✅ ${SETTINGS.length} system settings`)

  // Seed feature flags
  for (const f of FEATURE_FLAGS) {
    await prisma.featureFlag.upsert({
      where: { key: f.key },
      update: {},
      create: f,
    })
  }
  console.log(`  ✅ ${FEATURE_FLAGS.length} feature flags`)

  console.log("Seeding complete.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
