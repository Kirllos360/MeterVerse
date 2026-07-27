import fs from "fs"

let c = fs.readFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", "utf-8")

// Fix the user dropdown first (already changed to fixed)
c = c.replace(
  'className="absolute right-0 top-full mt-2 w-56 rounded-xl z-[9999] overflow-visible shadow-lg"',
  'className="fixed right-4 top-14 w-56 rounded-xl z-[9999] overflow-visible shadow-lg"'
)

// Find and fix all other dropdowns that use absolute positioning
// Tasks dropdown 
c = c.replace(
  'className="absolute right-0 top-full mt-2 w-56 rounded-xl z-[9999] overflow-hidden shadow-lg" style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }} onClick={() => setShowTasks(false)}',
  'className="fixed right-20 top-14 w-56 rounded-xl z-[9999] overflow-visible shadow-lg" style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }} onClick={() => setShowTasks(false)}'
)

// Reminders dropdown
const remindIdx = c.indexOf('className="absolute right-0 top-full mt-2 w-56 rounded-xl z-[9999] overflow-hidden shadow-lg"')
if (remindIdx !== -1 && remindIdx > c.indexOf("Reminders")) {
  c = c.substring(0, remindIdx) + 
    'className="fixed right-36 top-14 w-56 rounded-xl z-[9999] overflow-visible shadow-lg"' + 
    c.substring(remindIdx + 84)
}

// Notifications dropdown
c = c.replace(
  'className="absolute right-0 top-full mt-2 w-80 rounded-xl z-[9999] overflow-hidden shadow-lg"',
  'className="fixed right-52 top-14 w-80 rounded-xl z-[9999] overflow-visible shadow-lg"'
)

// Search results dropdown
c = c.replace(
  'className="absolute top-full mt-1.5 left-0 right-0 rounded-xl overflow-hidden z-50 shadow-lg"',
  'className="fixed left-1/3 top-14 w-96 rounded-xl overflow-visible z-[9999] shadow-lg"'
)

fs.writeFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", c)
console.log("✅ All dropdowns changed to fixed positioning")
