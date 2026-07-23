import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission } from "../middleware/security.js"

const router = Router()
router.use(authenticate)
router.use(requirePermission("preferences.*"))

router.get("/", async (req, res, next) => {
  try {
    const userId = req.user.sub
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { theme: true, language: true, area: true, project: true, tenant: true, mfaEnabled: true } })
    if (!user) return res.status(404).json({ error: "User not found" })
    const notificationPrefsRaw = await prisma.systemSetting.findUnique({ where: { key: "notification_prefs_" + userId } })
    const notificationPrefs = notificationPrefsRaw ? JSON.parse(notificationPrefsRaw.value) : { email: true, sms: false, inApp: true, push: false }
    res.json({ preferences: { ...user, notificationPrefs, timezone: "UTC", dateFormat: "DD/MM/YYYY" } })
  } catch (err) { next(err) }
})

router.put("/", async (req, res, next) => {
  try {
    const userId = req.user.sub
    const { theme, language, area, project, notificationPrefs } = req.body
    const updateData = {}
    if (theme) updateData.theme = theme
    if (language) updateData.language = language
    if (area !== undefined) updateData.area = area
    if (project !== undefined) updateData.project = project
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({ where: { id: userId }, data: updateData })
    }
    if (notificationPrefs) {
      await prisma.systemSetting.upsert({ where: { key: "notification_prefs_" + userId }, update: { value: JSON.stringify(notificationPrefs) }, create: { key: "notification_prefs_" + userId, value: JSON.stringify(notificationPrefs), category: "user_preferences" } })
    }
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as preferencesRouter }
