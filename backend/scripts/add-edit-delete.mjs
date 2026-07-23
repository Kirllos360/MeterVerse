import { readFileSync, writeFileSync } from 'fs';

const entities = [
  { name: 'customers', label: 'customer', icon: 'Pencil', listPath: '/admin/customers' },
  { name: 'meters', label: 'meter', icon: 'Pencil', listPath: '/admin/meters' },
  { name: 'invoices', label: 'invoice', icon: 'Pencil', listPath: '/admin/invoices' },
  { name: 'readings', label: 'reading', icon: 'Pencil', listPath: '/admin/readings' },
  { name: 'payments', label: 'payment', icon: 'Pencil', listPath: '/admin/payments' },
  { name: 'contracts', label: 'contract', icon: 'Pencil', listPath: '/admin/crud?entity=contracts' },
  { name: 'meter-assignments', label: 'assignment', icon: 'Pencil', listPath: '/admin/meter-assignments' },
];

for (const { name, label, listPath } of entities) {
  const path = `D:/meter/Frontend/src/app/admin/${name}/[id]/page.tsx`;
  try {
    let content = readFileSync(path, 'utf8');
    if (content.includes('EditDialog')) {
      console.log('  Already has edit/delete: ' + name);
      continue;
    }

    // Add imports
    content = content.replace(
      'import { Button }',
      'import { EditDialog } from "@/components/ui/edit-dialog"\nimport { DeleteConfirm } from "@/components/ui/delete-confirm"\nimport { Button }'
    );

    // Add state for edit/delete dialogs
    content = content.replace(
      'const [loading, setLoading] = useState(true)',
      'const [loading, setLoading] = useState(true)\n  const [showEdit, setShowEdit] = useState(false)\n  const [showDelete, setShowDelete] = useState(false)'
    );

    // Add edit/delete buttons next to the "Back to list" button
    const buttonsBlock = `          <Button variant="outline" onClick={() => setShowEdit(true)}>Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>Delete</Button>
          <Button variant="outline" onClick={() => router.push(\`${listPath}\`)}>Back to list</Button>`;

    content = content.replace(
      '<Button variant="outline" onClick={() => router.back()}>Go back</Button>',
      '<Button variant="outline" onClick={() => router.back()}>Go back</Button>'
    );

    // Replace the existing "Back to list" button with buttons block
    // First try the main back button pattern
    content = content.replace(
      /<Button variant="outline" onClick=\{\(\) => router\.push\(.*?\)\}>Back to list<\/Button>/,
      buttonsBlock
    );

    // Add dialog components before the closing </div> of the page
    const dialogsBlock = `\n      {showEdit && (
        <EditDialog
          entity="${name}"
          id={${label}.id}
          fields={[]}
          initialData={${label}}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); window.location.reload() }}
        />
      )}
      {showDelete && (
        <DeleteConfirm
          entity="${name}"
          id={${label}.id}
          label="${label}"
          onClose={() => setShowDelete(false)}
          onDeleted={() => { window.location.href = "${listPath}" }}
        />
      )}`;

    // Insert before the final closing bracket
    content = content.replace(
      /export default function \w+Page\(\)/,
      (match) => {
        // Add dialogs before the last closing tag of the return
        const returnEnd = content.lastIndexOf('</div>\n)');
        if (returnEnd > 0) {
          content = content.slice(0, returnEnd) + dialogsBlock + '\n    </div>\n  )';
          // Hacky but works — prevent re-execution
          return match;
        }
        return match;
      }
    );

    writeFileSync(path, content);
    console.log('  Updated: ' + name);
  } catch (e) {
    console.log('  Error: ' + name + ' — ' + e.message);
  }
}
console.log('Done.');
