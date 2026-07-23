import { request } from "http"

const BASE = "http://localhost:3001"

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE)
    const opts = { method, hostname: url.hostname, port: url.port, path: url.pathname, headers: {} }
    if (body) opts.headers["Content-Type"] = "application/json"
    if (token) opts.headers["Authorization"] = `Bearer ${token}`
    const r = request(opts, (res) => {
      let data = ""
      res.on("data", c => data += c)
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }))
    })
    r.on("error", reject)
    if (body) r.write(JSON.stringify(body))
    r.end()
  })
}

async function main() {
  await new Promise(r => setTimeout(r, 1000))

  const login = await req("POST", "/api/auth/login", { email: "admin@meterverse.com", password: "Admin@123" })
  const token = JSON.parse(login.body).accessToken
  if (!token) { console.log("Login failed"); process.exit(1) }
  console.log("Login OK\n")

  const endpoints = ["/api/meters/export", "/api/invoices/export", "/api/readings/export", "/api/payments/export"]
  let passed = 0
  for (const ep of endpoints) {
    const res = await req("GET", ep, null, token)
    const lines = res.body.split("\n").length
    const isCSV = res.headers["content-type"]?.includes("csv")
    const hasHeader = res.body.includes(",")
    if (res.status === 200 && isCSV && hasHeader) {
      console.log(`  OK ${ep} → ${res.status}, ${lines} lines, CSV`)
      passed++
    } else {
      console.log(`  FAIL ${ep} → ${res.status}, content-type: ${res.headers["content-type"]}`)
    }
  }

  console.log(`\n${passed}/${endpoints.length} passed`)
  process.exit(passed === endpoints.length ? 0 : 1)
}

main().catch(e => { console.error(e); process.exit(1) })
