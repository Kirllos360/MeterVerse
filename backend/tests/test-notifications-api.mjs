import { createServer } from "http"
import { request } from "http"

const BASE = "http://localhost:3001"

function httpReq(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE)
    const opts = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: { "Content-Type": "application/json" },
    }
    if (token) opts.headers.Authorization = `Bearer ${token}`
    
    const req = request(opts, (res) => {
      let data = ""
      res.on("data", (chunk) => data += chunk)
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch { resolve({ status: res.statusCode, body: data }) }
      })
    })
    req.on("error", reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function main() {
  console.log("═══ Notification API Tests ═══\n")

  // Wait for server
  await new Promise(r => setTimeout(r, 1000))

  // Login
  const login = await httpReq("POST", "/api/auth/login", { email: "admin@meterverse.com", password: "Admin@123" })
  if (login.status !== 200) {
    console.log("❌ Login failed:", login.status, login.body)
    process.exit(1)
  }
  const token = login.body.accessToken
  if (!token) { console.log("❌ No token in response:", JSON.stringify(login.body).slice(0,200)); process.exit(1) }
  console.log("✅ Login successful\n")

  // Test GET /api/notifications
  const n1 = await httpReq("GET", "/api/notifications", null, token)
  console.log(`GET /api/notifications → ${n1.status}: ${n1.body.total || 0} notifications`)

  // Test GET /api/notifications/unread-count
  const n2 = await httpReq("GET", "/api/notifications/unread-count", null, token)
  console.log(`GET /api/notifications/unread-count → ${n2.status}: ${n2.body.count} unread`)

  // Test GET /api/notifications/templates
  const n3 = await httpReq("GET", "/api/notifications/templates", null, token)
  console.log(`GET /api/notifications/templates → ${n3.status}: ${n3.body.templates?.length || 0} templates`)

  // Test POST /api/notifications/templates
  const n4 = await httpReq("POST", "/api/notifications/templates", {
    key: "test.route.event", name: "Route Test", type: "in_app", subject: "Test", body: "Route test body", variables: "[]"
  }, token)
  console.log(`POST /api/notifications/templates → ${n4.status}: ${n4.body.template?.key || "FAIL"}`)

  if (n4.status === 201) {
    const tplId = n4.body.template.id
    
    // Test PUT /api/notifications/templates/:id
    const n5 = await httpReq("PUT", `/api/notifications/templates/${tplId}`, { name: "Route Test Updated" }, token)
    console.log(`PUT /api/notifications/templates/:id → ${n5.status}: ${n5.body.template?.name}`)

    // Test DELETE /api/notifications/templates/:id
    const n6 = await httpReq("DELETE", `/api/notifications/templates/${tplId}`, null, token)
    console.log(`DELETE /api/notifications/templates/:id → ${n6.status}: ${n6.body.success}`)
  }

  // Mark first notification as read if exists
  if (n1.body.notifications?.length > 0) {
    const firstId = n1.body.notifications[0].id
    const n7 = await httpReq("PUT", `/api/notifications/${firstId}/read`, null, token)
    console.log(`PUT /api/notifications/:id/read → ${n7.status}: ${n7.body.notification?.status}`)
  }

  console.log("\n═══ Tests Complete ═══")
}

main().catch(console.error)
