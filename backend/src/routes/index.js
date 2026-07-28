import { Router } from "express"
import { rootRouter } from "./root.js"
import { authRouter } from "./auth.js"
import { customerRouter } from "./customer.js"
import { meterRouter } from "./meter.js"
import { invoiceRouter } from "./invoice.js"
import { paymentRouter } from "./payment.js"
import { accountingRouter } from "./accounting.js"
import { tariffRouter } from "./tariff.js"
import { userRouter } from "./user.js"
import { adminSettingsRouter } from "./admin-settings.js"
import { dataGateRouter } from "./data-gate.js"
import { rcaRouter } from "./rca.js"
import { uploadRouter } from "./upload.js"

const router = Router()

router.use("/", rootRouter)
router.use("/auth", authRouter)
router.use("/customers", customerRouter)
router.use("/meters", meterRouter)
router.use("/invoices", invoiceRouter)
router.use("/payments", paymentRouter)
router.use("/accounting", accountingRouter)
router.use("/tariffs", tariffRouter)
router.use("/users", userRouter)
router.use("/admin-settings", adminSettingsRouter)
router.use("/data-gate", dataGateRouter)
router.use("/rca", rcaRouter)
router.use("/upload", uploadRouter)

export { router as mainRouter }
