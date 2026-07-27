import fs from "fs"

let c = fs.readFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", "utf-8")

// Revert ALL dropdowns from fixed back to absolute
c = c.replace('className="fixed right-4 top-14 w-56 rounded-xl z-[9999] overflow-visible shadow-lg"', 'className="absolute right-0 top-full mt-2 w-56 rounded-xl z-[9999] overflow-visible shadow-lg"')

c = c.replace('className="fixed right-20 top-14 w-56 rounded-xl z-[9999] overflow-visible shadow-lg"', 'className="absolute right-0 top-full mt-2 w-56 rounded-xl z-[9999] overflow-visible shadow-lg"')

c = c.replace('className="fixed right-36 top-14 w-56 rounded-xl z-[9999] overflow-visible shadow-lg"', 'className="absolute right-0 top-full mt-2 w-56 rounded-xl z-[9999] overflow-visible shadow-lg"')

c = c.replace('className="fixed right-52 top-14 w-80 rounded-xl z-[9999] overflow-visible shadow-lg"', 'className="absolute right-0 top-full mt-2 w-80 rounded-xl z-[9999] overflow-visible shadow-lg"')

c = c.replace('className="fixed left-1/3 top-14 w-96 rounded-xl overflow-visible z-[9999] shadow-lg"', 'className="absolute top-full mt-1.5 left-0 right-0 rounded-xl overflow-visible z-[9999] shadow-lg"')

fs.writeFileSync("D:/meter/Frontend/src/admin/layout/AdminToolbar.tsx", c)
console.log("✅ All dropdowns reverted to absolute positioning (root cause fixed)")
