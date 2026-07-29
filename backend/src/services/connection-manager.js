import { prisma } from "../server.js"
import { encrypt, decrypt } from "./credential-vault.js"
import logger from "./logger.js"

const VALID_TRANSITIONS = {
  draft: ["configured", "archived"],
  configured: ["draft", "tested", "archived"],
  tested: ["configured", "active", "pending_review", "archived"],
  pending_review: ["tested", "active", "configured", "archived"],
  active: ["suspended", "failed", "archived"],
  suspended: ["active", "archived"],
  failed: ["reconnecting", "configured", "archived"],
  reconnecting: ["active", "failed", "archived"],
  archived: [],
}

export async function createProfile(data) {
  const { password, dbPassword, tlsKey, backups, ...profileData } = data

  const existing = await prisma.connectionProfile.findFirst({
    where: { name: profileData.name, areaId: profileData.areaId, archivedAt: null },
  })
  if (existing) throw new Error(`Connection "${profileData.name}" already exists in this area`)

  const profile = await prisma.connectionProfile.create({ data: profileData })

  if (password || dbPassword) {
    await prisma.connectionCredential.create({
      data: {
        connectionProfileId: profile.id,
        password: password ? encrypt(password) : "",
        dbPassword: dbPassword ? encrypt(dbPassword) : "",
        tlsKey: tlsKey ? encrypt(tlsKey) : null,
      },
    })
  }

  if (backups?.length > 0) {
    await prisma.backupConfig.createMany({
      data: backups.map((b, i) => ({ connectionProfileId: profile.id, ...b, priority: b.priority || i + 1 })),
    })
  }

  logger.info({ correlationId: profile.id, component: "connection-manager", profileId: profile.id, name: profile.name }, "Profile created")
  return getProfileWithRelations(profile.id)
}

export async function updateProfile(id, data) {
  const { password, dbPassword, tlsKey, backups, ...profileData } = data
  const profile = await prisma.connectionProfile.findUnique({ where: { id } })
  if (!profile || profile.archivedAt) throw new Error("Profile not found")
  if (profile.status === "archived") throw new Error("Cannot update archived profile")

  const updated = await prisma.connectionProfile.update({ where: { id }, data: { ...profileData, version: { increment: 1 } } })

  if (password || dbPassword) {
    const cred = await prisma.connectionCredential.findUnique({ where: { connectionProfileId: id } })
    const credData = {}
    if (password) credData.password = encrypt(password)
    if (dbPassword) credData.dbPassword = encrypt(dbPassword)
    if (tlsKey) credData.tlsKey = encrypt(tlsKey)
    if (cred) {
      await prisma.connectionCredential.update({ where: { connectionProfileId: id }, data: credData })
    } else {
      await prisma.connectionCredential.create({ data: { connectionProfileId: id, password: "", dbPassword: "", ...credData } })
    }
  }

  if (backups) {
    await prisma.backupConfig.deleteMany({ where: { connectionProfileId: id } })
    if (backups.length > 0) {
      await prisma.backupConfig.createMany({
        data: backups.map((b, i) => ({ connectionProfileId: id, ...b, priority: b.priority || i + 1 })),
      })
    }
  }

  logger.info({ component: "connection-manager", profileId: id }, "Profile updated")
  return getProfileWithRelations(id)
}

export async function deleteProfile(id) {
  const profile = await prisma.connectionProfile.findUnique({ where: { id } })
  if (!profile) throw new Error("Profile not found")
  if (profile.status === "active") throw new Error("Cannot delete active profile. Deactivate first.")
  await prisma.connectionProfile.update({ where: { id }, data: { archivedAt: new Date(), active: false } })
  logger.info({ component: "connection-manager", profileId: id }, "Profile archived")
  return { ok: true }
}

export async function restoreProfile(id) {
  const profile = await prisma.connectionProfile.findUnique({ where: { id } })
  if (!profile || !profile.archivedAt) throw new Error("Archived profile not found")
  await prisma.connectionProfile.update({ where: { id }, data: { archivedAt: null } })
  return getProfileWithRelations(id)
}

export async function transitionProfile(id, targetStatus, reason) {
  const profile = await prisma.connectionProfile.findUnique({ where: { id } })
  if (!profile || profile.archivedAt) throw new Error("Profile not found")

  const allowed = VALID_TRANSITIONS[profile.status]
  if (!allowed || !allowed.includes(targetStatus)) {
    throw new Error(`Invalid transition: ${profile.status} → ${targetStatus}. Allowed: ${allowed?.join(", ") || "none"}`)
  }

  const updateData = { status: targetStatus }
  if (targetStatus === "active") { updateData.active = true; updateData.approvedAt = new Date() }
  if (targetStatus === "suspended" || targetStatus === "archived") updateData.active = false
  if (targetStatus === "tested") updateData.lastTestedAt = new Date()

  await prisma.connectionProfile.update({ where: { id }, data: updateData })
  logger.info({ profileId: id, from: profile.status, to: targetStatus, reason }, "Profile transitioned")
  return getProfileWithRelations(id)
}

export async function listProfiles(filters = {}) {
  const where = { archivedAt: null }
  if (filters.areaId) where.areaId = filters.areaId
  if (filters.status) where.status = filters.status
  if (filters.active !== undefined) where.active = filters.active
  const profiles = await prisma.connectionProfile.findMany({ where, orderBy: [{ priority: "asc" }, { name: "asc" }] })
  return profiles
}

export async function getProfileWithRelations(id) {
  const profile = await prisma.connectionProfile.findUnique({
    where: { id },
    include: { credentials: { select: { keyVersion: true, rotatedAt: true } }, backups: true, healthChecks: { take: 5, orderBy: { checkedAt: "desc" } } },
  })
  if (!profile) throw new Error("Profile not found")
  return profile
}

export async function testProfileConnection(id) {
  const profile = await prisma.connectionProfile.findUnique({ where: { id }, include: { credentials: true } })
  if (!profile) throw new Error("Profile not found")

  const start = Date.now()
  const stages = []
  let overallStatus = "passed"

  // Stage 1: TCP Connect
  try {
    const { createConnection } = await import("net")
    await new Promise((resolve, reject) => {
      const socket = createConnection({ host: profile.host, port: profile.port, timeout: profile.connTimeout * 1000 }, () => {
        socket.end(); resolve(true)
      })
      socket.on("error", (e) => { socket.destroy(); reject(e) })
      socket.on("timeout", () => { socket.destroy(); reject(new Error("Timed out")) })
    })
    stages.push({ stage: 1, name: "TCP Connect", status: "passed", latencyMs: Date.now() - start })
  } catch (e) {
    stages.push({ stage: 1, name: "TCP Connect", status: "failed", error: e.message })
    overallStatus = "failed"
  }

  // Stage 2: TLS Check (if enabled)
  if (overallStatus === "passed" && profile.tlsEnabled) {
    const tlsStart = Date.now()
    try {
      const { connect } = await import("tls")
      await new Promise((resolve, reject) => {
        const socket = connect({ host: profile.host, port: profile.port, rejectUnauthorized: true, timeout: 5000 }, () => {
          socket.end(); resolve(true)
        })
        socket.on("error", (e) => reject(e))
        socket.on("timeout", () => reject(new Error("TLS handshake timed out")))
      })
      stages.push({ stage: 2, name: "TLS Handshake", status: "passed", latencyMs: Date.now() - tlsStart })
    } catch (e) {
      stages.push({ stage: 2, name: "TLS Handshake", status: "failed", error: e.message })
      overallStatus = "failed"
    }
  }

  const result = await prisma.connectionTest.create({
    data: { connectionProfileId: id, testType: "full", status: overallStatus, latencyMs: Date.now() - start, details: JSON.stringify(stages) },
  })

  if (overallStatus === "passed") {
    await prisma.connectionProfile.update({ where: { id }, data: { lastTestedAt: new Date() } })
  }

  return { id, overallStatus, stages, latencyMs: Date.now() - start, testId: result.id }
}
