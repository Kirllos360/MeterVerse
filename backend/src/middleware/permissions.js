// DEPRECATED — use middleware/security.js instead
// This file kept for reference during migration.
// All permission logic has been consolidated into security.js.

import { prisma } from "../db.js"

const ROUTE_PERMISSION_MAP = {
  "GET /api/customers": "customers.list",
  "GET /api/customers/export": "customers.export",
  "GET /api/customers/stats": "customers.read",
  "GET /api/customers/:id": "customers.read",
  "POST /api/customers": "customers.create",
  "PUT /api/customers/:id": "customers.update",
  "DELETE /api/customers/:id": "customers.delete",

  "GET /api/meters": "meters.list",
  "GET /api/meters/export": "meters.export",
  "GET /api/meters/:id": "meters.read",
  "POST /api/meters": "meters.create",
  "PUT /api/meters/:id": "meters.update",
  "DELETE /api/meters/:id": "meters.delete",

  "GET /api/readings": "readings.list",
  "GET /api/readings/export": "readings.export",
  "GET /api/readings/:id": "readings.read",
  "POST /api/readings": "readings.create",
  "POST /api/readings/bulk": "readings.create",
  "PUT /api/readings/:id": "readings.update",
  "DELETE /api/readings/:id": "readings.delete",

  "GET /api/invoices": "invoices.list",
  "GET /api/invoices/export": "invoices.export",
  "GET /api/invoices/:id": "invoices.read",
  "POST /api/invoices": "invoices.create",
  "POST /api/invoices/generate": "invoices.create",
  "PUT /api/invoices/:id": "invoices.update",
  "DELETE /api/invoices/:id": "invoices.delete",

  "GET /api/payments": "payments.list",
  "GET /api/payments/export": "payments.export",
  "GET /api/payments/:id": "payments.read",
  "POST /api/payments": "payments.create",
  "DELETE /api/payments/:id": "payments.delete",

  "GET /api/notifications": "notifications.list",
  "GET /api/notifications/unread-count": "notifications.list",
  "GET /api/notifications/templates": "notifications.list",
  "PUT /api/notifications/read-all": "notifications.update",
  "PUT /api/notifications/:id/read": "notifications.update",
  "POST /api/notifications/templates": "notifications.create",
  "PUT /api/notifications/templates/:id": "notifications.update",
  "DELETE /api/notifications/templates/:id": "notifications.delete",

  "GET /api/meter-assignments": "meter_assignments.list",
  "GET /api/meter-assignments/:id": "meter_assignments.read",
  "POST /api/meter-assignments": "meter_assignments.create",
  "PUT /api/meter-assignments/:id": "meter_assignments.update",
  "DELETE /api/meter-assignments/:id": "meter_assignments.delete",

  "GET /api/domain/:entity": "admin.list",
  "GET /api/domain/:entity/:id": "admin.read",
  "POST /api/domain/:entity": "admin.create",
  "PUT /api/domain/:entity/:id": "admin.update",
  "DELETE /api/domain/:entity/:id": "admin.delete",
}

const ROLE_PERMISSIONS = {
  super_admin: null,
  admin: ["customers.*", "meters.*", "readings.*", "invoices.*", "payments.*", "notifications.*", "meter_assignments.*", "admin.*"],
  operator: ["customers.*", "meters.*", "readings.*", "invoices.*", "payments.*", "meter_assignments.*"],
  billing: ["invoices.*", "payments.*", "customers.read", "customers.list", "meters.read", "meters.list"],
  viewer: ["*.read", "*.list"],
}

export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" })

    if (req.user.role === "super_admin") return next()

    if (permissions.length === 0) return next()

    const userPerms = ROLE_PERMISSIONS[req.user.role]
    if (!userPerms) return res.status(403).json({ error: "Insufficient permissions" })

    const hasAny = permissions.some(required => {
      return userPerms.some(allowed => {
        const reqPat = required.replace(/\./g, "\\.")
        const allPat = allowed.replace(/\*/g, ".*")
        const regex = new RegExp(`^${allPat.replace(/\.\*/g, ".*")}$`)
        return regex.test(required)
      })
    })

    if (!hasAny) {
      return res.status(403).json({ error: "Permission denied", required: permissions, role: req.user.role })
    }

    next()
  }
}

export async function seedPermissions() {
  const permNames = [...new Set(Object.values(ROUTE_PERMISSION_MAP))]
  for (const key of permNames) {
    await prisma.permission.upsert({
      where: { name: key },
      update: {},
      create: { name: key, module: key.split(".")[0], description: `Permission for ${key}` },
    }).catch(() => {})
  }
  console.log(`Seeded ${permNames.length} permission keys`)
}
