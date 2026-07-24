const fs = require('fs');
const dirs = ['contracts','customers','invoices','meter-assignments','meters','payments','readings'];
let count = 0;
for (const d of dirs) {
  const path = 'D:/meter/Frontend/src/app/admin/' + d + '/[id]/page.tsx';
  if (!fs.existsSync(path)) { console.log('SKIP ' + d); continue; }
  let content = fs.readFileSync(path, 'utf8');
  const original = content;
  const oldImport = 'import { Breadcrumb } from "@/components/ui/breadcrumb" from "@/components/ui/button"';
  const newImport = 'import { Breadcrumb } from "@/components/ui/breadcrumb"\nimport { Button } from "@/components/ui/button"';
  content = content.split(oldImport).join(newImport);
  if (content !== original) {
    fs.writeFileSync(path, content, 'utf8');
    console.log('FIXED: ' + d);
    count++;
  } else {
    console.log('NO MATCH in ' + d + ' — checking manually');
    const lines = content.split('\n');
    console.log('  Line 8: ' + (lines[7] || '(empty)'));
  }
}
console.log('Total fixed: ' + count);
