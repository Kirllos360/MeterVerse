import { readFileSync, writeFileSync } from 'fs';

const entities = [
  { name: 'customers', label: 'Customers' },
  { name: 'meters', label: 'Meters' },
  { name: 'invoices', label: 'Invoices' },
  { name: 'readings', label: 'Readings' },
  { name: 'payments', label: 'Payments' },
  { name: 'contracts', label: 'Contracts' },
  { name: 'meter-assignments', label: 'Meter Assignments' },
];

const breadcrumbImport = 'import { Breadcrumb } from "@/components/ui/breadcrumb"';

for (const { name, label } of entities) {
  const path = `D:/meter/Frontend/src/app/admin/${name}/[id]/page.tsx`;
  try {
    let content = readFileSync(path, 'utf8');
    // Add import if not present
    if (!content.includes(breadcrumbImport)) {
      content = content.replace('import { Button }', breadcrumbImport + '\nimport { Button }');
    }

    // Add breadcrumb JSX before the loading check if not already there
    const breadcrumbBlock = `\n      <Breadcrumb items={[
        { label: "Admin", href: "/admin" },
        { label: "${label}", href: "/admin/${name}" },
      ]} />\n`;

    if (!content.includes('Breadcrumb items')) {
      content = content.replace('if (loading)', breadcrumbBlock + '      if (loading)');
    }

    writeFileSync(path, content);
    console.log('  Updated: ' + name);
  } catch (e) {
    console.log('  Error: ' + name + ' — ' + e.message);
  }
}
console.log('Done.');
