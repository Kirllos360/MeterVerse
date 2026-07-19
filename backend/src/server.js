import express from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client"
import { authRouter } from "./routes/auth.js"
import { customersRouter } from "./routes/customers.js"
import { metersRouter } from "./routes/meters.js"
import { readingsRouter } from "./routes/readings.js"
import { invoicesRouter } from "./routes/invoices.js"
import { paymentsRouter } from "./routes/payments.js"
import { errorHandler } from "./middleware/errorHandler.js"

const app = express()
const PORT = process.env.PORT || 3001

export const prisma = new PrismaClient()

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:7400", credentials: true }))
app.use(express.json())

// Health
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }))

// Routes
app.use("/api/auth", authRouter)
app.use("/api/customers", customersRouter)
app.use("/api/meters", metersRouter)
app.use("/api/readings", readingsRouter)
app.use("/api/invoices", invoicesRouter)
app.use("/api/payments", paymentsRouter)

app.use(errorHandler)

app.listen(PORT, () => console.log(`MeterVerse API running on port ${PORT}`))
