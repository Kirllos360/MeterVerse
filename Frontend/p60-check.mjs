import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })

async function site(name, base, expectTitle) {
  const ctx = await browser.newContext({ viewport:{width:1360,height:900} })
  const page = await ctx.newPage()
  const calls = []
  page.on('response', r => { if (r.url().includes('/api/')) calls.push(`${r.status()} ${r.url().split('http://')[1]}`) })
  await page.goto(`${base}/login`, { timeout:30000, waitUntil:'networkidle' }).catch(()=>{})
  await page.waitForTimeout(1500)
  const has = await page.getByPlaceholder('Enter your password').count()
  if (has>0){ await page.getByPlaceholder('Enter your password').fill('Admin@123'); await page.getByRole('button',{name:/Sign in/i}).click(); await page.waitForTimeout(9000) }
  await page.goto(base, { timeout:30000, waitUntil:'networkidle' }).catch(()=>{})
  await page.waitForTimeout(7000)
  const body = (await page.locator('body').innerText().catch(()=>'')).slice(0,300).replace(/\n+/g,' | ')
  const errs = calls.filter(c=>c.startsWith('4')||c.startsWith('5'))
  const oks = calls.filter(c=>c.startsWith('2'))
  console.log(`\n===== ${name} =====`)
  console.log(`URL: ${page.url()}`)
  console.log(`BODY: ${body}`)
  console.log(`API OK:${oks.length} ERR:${errs.length}`)
  if (errs.length) errs.slice(0,4).forEach(c=>console.log(`  ERR ${c}`))
  const ok = body.includes('MeterVerse OS') && errs.length===0
  console.log(`SITE OK: ${ok}`)
  await ctx.close()
}

await site('Admin', 'http://localhost:3535')
await site('Portal', 'http://localhost:3030')
await browser.close()
