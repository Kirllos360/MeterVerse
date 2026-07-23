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
    update: { password: adminPassword, role: "super_admin", roleId: superAdminRole.id },
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

  // ─── NOTIFICATION TEMPLATES ──────────────────────────────────────────────

  const NOTIFICATION_TEMPLATES = [
    { key: "customer.created", name: "Customer Created", type: "in_app", subject: "New Customer: {name}", body: "Customer {name} has been registered. Email: {email}", variables: JSON.stringify(["name", "email"]) },
    { key: "customer.updated", name: "Customer Updated", type: "in_app", subject: "Customer Updated: {name}", body: "Customer {name} profile has been updated.", variables: JSON.stringify(["name"]) },
    { key: "customer.archived", name: "Customer Archived", type: "in_app", subject: "Customer Archived: {name}", body: "Customer {name} has been archived.", variables: JSON.stringify(["name"]) },
    { key: "customer.export", name: "Customer Export", type: "in_app", subject: "Customer Export Complete", body: "{count} customers exported to CSV.", variables: JSON.stringify(["count"]) },
    { key: "meter.created", name: "Meter Created", type: "in_app", subject: "New Meter: {serial}", body: "Meter {serial} has been registered at {location}.", variables: JSON.stringify(["serial", "location"]) },
    { key: "meter.updated", name: "Meter Updated", type: "in_app", subject: "Meter Updated: {serial}", body: "Meter {serial} has been updated.", variables: JSON.stringify(["serial"]) },
    { key: "meter.archived", name: "Meter Archived", type: "in_app", subject: "Meter Archived: {serial}", body: "Meter {serial} at {location} has been archived.", variables: JSON.stringify(["serial", "location"]) },
    { key: "reading.created", name: "Reading Recorded", type: "in_app", subject: "Reading: {value} {unit}", body: "Reading of {value} {unit} recorded for meter {serial}.", variables: JSON.stringify(["value", "unit", "serial"]) },
    { key: "reading.anomaly", name: "Reading Anomaly Detected", type: "in_app", subject: "Anomaly: Meter {serial}", body: "Anomaly detected on meter {serial}. Value: {value} {unit}. Expected range: {expected}.", variables: JSON.stringify(["serial", "value", "unit", "expected"]) },
    { key: "readings.bulk_created", name: "Bulk Readings Imported", type: "in_app", subject: "Bulk Import: {count} Readings", body: "{count} readings imported for meter {serial}.", variables: JSON.stringify(["count", "serial"]) },
    { key: "invoice.created", name: "Invoice Created", type: "in_app", subject: "Invoice #{number}", body: "Invoice #{number} for {amount} EGP created for {customer}.", variables: JSON.stringify(["number", "amount", "customer"]) },
    { key: "invoice.generated", name: "Invoice Generated", type: "email", subject: "Invoice #{number} Generated", body: "Invoice #{number} for {amount} EGP generated for {customer}. Due: {dueDate}.", variables: JSON.stringify(["number", "amount", "customer", "dueDate"]) },
    { key: "invoice.updated", name: "Invoice Updated", type: "in_app", subject: "Invoice #{number} Updated", body: "Invoice #{number} for {customer} updated. Status: {status}.", variables: JSON.stringify(["number", "customer", "status"]) },
    { key: "invoice.archived", name: "Invoice Archived", type: "in_app", subject: "Invoice #{number} Archived", body: "Invoice #{number} for {customer} has been archived.", variables: JSON.stringify(["number", "customer"]) },
    { key: "payment.created", name: "Payment Received", type: "email", subject: "Payment Received: {amount} EGP", body: "Payment of {amount} EGP received for invoice #{number}. Method: {method}.", variables: JSON.stringify(["amount", "number", "method"]) },
    { key: "payment.deleted", name: "Payment Removed", type: "in_app", subject: "Payment Removed: {amount} EGP", body: "Payment of {amount} EGP for invoice #{number} has been removed.", variables: JSON.stringify(["amount", "number"]) },
    { key: "assignment.created", name: "Meter Assigned", type: "in_app", subject: "Meter {serial} Assigned", body: "Meter {serial} assigned to customer {customer}. Contract: {contract}.", variables: JSON.stringify(["serial", "customer", "contract"]) },
    { key: "assignment.ended", name: "Meter Assignment Ended", type: "in_app", subject: "Meter {serial} Unassigned", body: "Meter {serial} assignment with {customer} has ended.", variables: JSON.stringify(["serial", "customer"]) },
    { key: "auth.login_success", name: "Login Successful", type: "in_app", subject: "Login: {email}", body: "Successful login from {ip} at {time}.", variables: JSON.stringify(["email", "ip", "time"]) },
    { key: "auth.login_failed", name: "Login Failed", type: "in_app", subject: "Failed Login: {email}", body: "Failed login attempt for {email} from {ip}.", variables: JSON.stringify(["email", "ip"]) },
  ]

  for (const tpl of NOTIFICATION_TEMPLATES) {
    await prisma.notificationTemplate.upsert({
      where: { key: tpl.key },
      update: tpl,
      create: tpl,
    })
  }
  console.log(`  ✅ ${NOTIFICATION_TEMPLATES.length} notification templates`)

  console.log("Seeding complete.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

