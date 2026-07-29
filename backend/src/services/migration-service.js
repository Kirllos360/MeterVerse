import { prisma } from "../server.js"
import { encrypt } from "./credential-vault.js"
import logger from "./logger.js"

const FEATURE_FLAG_KEY = "use_new_connection_profile"

export async function isNewConnectionProfileEnabled() {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: FEATURE_FLAG_KEY } })
    return setting?.value === "true"
  } catch { return false }
}

export async function setFeatureFlag(enabled) {
  await prisma.systemSetting.upsert({
    where: { key: FEATURE_FLAG_KEY },
    update: { value: enabled ? "true" : "false" },
    create: { key: FEATURE_FLAG_KEY, value: enabled ? "true" : "false", category: "migration", type: "flag" },
  })
  logger.info({ enabled, component: "migration" }, "Feature flag updated")
  return { enabled }
}

export async function migrateAll() {
  const results = { attempted: 0, succeeded: 0, failed: 0, errors: [], warnings: [] }

  const settings = await prisma.systemSetting.findMany({
    where: { category: "database_connection", archivedAt: null },
  })

  for (const setting of settings) {
    results.attempted++
    try {
      const value = JSON.parse(setting.value)
      const name = setting.key.replace("db_conn_", "").replace(/_/g, " ")
      const areaId = value.areaId || "default"

      // Check if already migrated
      const existing = await prisma.connectionProfile.findFirst({
        where: { name, areaId, archivedAt: null },
      })
      if (existing) {
        results.warnings.push(`Already migrated: ${name} (${areaId})`)
        continue
      }

      // Create ConnectionProfile
      const profile = await prisma.connectionProfile.create({
        data: {
          name,
          description: `Migrated from SystemSetting: ${setting.key}`,
          status: "active",
          active: true,
          host: value.host || "localhost",
          port: value.port || 5432,
          dbType: value.type || "postgresql",
          dbHost: value.host || "localhost",
          dbPort: value.port || 5432,
          dbName: value.database || "meter_db",
          dbUser: value.username || "meter_user",
          areaId,
        },
      })

      // Create ConnectionCredential
      if (value.password) {
        await prisma.connectionCredential.create({
          data: {
            connectionProfileId: profile.id,
            password: encrypt(value.password),
            dbPassword: encrypt(value.password),
          },
        })
      }

      results.succeeded++
      logger.info({ profileId: profile.id, name, component: "migration" }, "Migrated connection")
    } catch (e) {
      results.failed++
      results.errors.push({ setting: setting.key, error: e.message })
      logger.error({ key: setting.key, error: e.message, component: "migration" }, "Migration failed")
    }
  }

  // Enable feature flag if any succeeded
  if (results.succeeded > 0) {
    await setFeatureFlag(true)
  }

  return results
}

export async function getMigrationStatus() {
  const oldCount = await prisma.systemSetting.count({ where: { category: "database_connection", archivedAt: null } })
  const newCount = await prisma.connectionProfile.count({ where: { archivedAt: null } })
  const flag = await isNewConnectionProfileEnabled()
  return {
    featureFlag: flag,
    oldSystem: oldCount,
    newConnectionProfiles: newCount,
    remaining: Math.max(0, oldCount - newCount),
    migrated: newCount > 0 && oldCount > 0,
    fullyMigrated: newCount >= oldCount && oldCount > 0,
  }
}

export async function verifyDataConsistency() {
  const oldRecords = await prisma.systemSetting.findMany({
    where: { category: "database_connection", archivedAt: null },
  })
  const newRecords = await prisma.connectionProfile.findMany({
    where: { archivedAt: null },
  })

  const checks = []
  for (const old of oldRecords) {
    try {
      const value = JSON.parse(old.value)
      const name = old.key.replace("db_conn_", "").replace(/_/g, " ")
      const matching = newRecords.find(n => n.name === name && n.areaId === (value.areaId || "default"))
      checks.push({
        name,
        oldExists: true,
        newExists: !!matching,
        hostMatch: matching ? matching.host === (value.host || "localhost") : null,
        consistent: matching ? matching.host === (value.host || "localhost") : false,
      })
    } catch {}
  }

  return {
    totalOld: oldRecords.length,
    totalNew: newRecords.length,
    consistent: checks.filter(c => c.consistent).length,
    inconsistent: checks.filter(c => !c.consistent).length,
    checks,
  }
}
