const fs = require('fs');
let c = fs.readFileSync('D:/meter/Frontend/src/app/admin/layout.tsx', 'utf8');

// Add tariffs and sim after payments
const search = `{ id: "payments", label: "Payments", labelAr: "\u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0627\u062a", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },`;
const replace = search + `\n  { id: "tariffs", label: "Tariffs", labelAr: "\u0627\u0644\u062a\u0639\u0631\u0641\u0629", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
  { id: "sim", label: "SIM Cards", labelAr: "\u0628\u0637\u0627\u0642\u0627\u062a SIM", icon: "M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },`;
c = c.replace(search, replace);

// Create tariffs page if missing
const tariffsPage = `"use client"\n\nimport { GenericAdminPage } from "@/admin/tables/GenericAdminPage"\nimport { pageConfigs } from "@/admin/tables/page-configs"\n\nexport default function AdminTariffsPage() {\n  return <GenericAdminPage config={pageConfigs.tariffs} />\n}\n`;
fs.writeFileSync('D:/meter/Frontend/src/app/admin/tariffs/page.tsx', tariffsPage, 'utf8');

// Create sim page if missing
const simPage = `"use client"\n\nimport { GenericAdminPage } from "@/admin/tables/GenericAdminPage"\nimport { pageConfigs } from "@/admin/tables/page-configs"\n\nexport default function AdminSimPage() {\n  return <GenericAdminPage config={pageConfigs.sim} />\n}\n`;
fs.writeFileSync('D:/meter/Frontend/src/app/admin/sim/page.tsx', simPage, 'utf8');

fs.writeFileSync('D:/meter/Frontend/src/app/admin/layout.tsx', c, 'utf8');
console.log('Done: added tariffs + sim to sidebar + created page files');
