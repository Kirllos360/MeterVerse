const fs = require('fs');
const dirs = ['contracts','customers','invoices','meter-assignments','meters','payments','readings'];
const labels = ['Contracts','Customers','Invoices','Meter Assignments','Meters','Payments','Readings'];

for (let i = 0; i < dirs.length; i++) {
  const d = dirs[i];
  const lbl = labels[i];
  const fp = 'D:/meter/Frontend/src/app/admin/' + d + '/[id]/page.tsx';
  let c = fs.readFileSync(fp, 'utf8');
  
  // Remove Breadcrumb import
  c = c.replace('import { Breadcrumb } from "@/components/ui/breadcrumb"\n', '');
  
  // Remove Breadcrumb usage
  const breadcrumbBlock = `      <Breadcrumb items={[\n        { label: "Admin", href: "/admin" },\n        { label: "${lbl}", href: "/admin/${d}" },\n        { label: "Detail", href: "" },\n      ]} />\n`;
  c = c.replace(breadcrumbBlock, '');
  
  fs.writeFileSync(fp, c, 'utf8');
  console.log('FIXED: ' + d);
}
console.log('Done');
