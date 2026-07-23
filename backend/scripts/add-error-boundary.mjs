import { readFileSync, writeFileSync } from 'fs';

const entities = ['customers','meters','invoices','readings','payments','contracts','meter-assignments'];
const importLine = 'import { ErrorBoundary } from "@/components/ui/error-boundary"';

for (const name of entities) {
  const path = `D:/meter/Frontend/src/app/admin/${name}/[id]/page.tsx`;
  try {
    let content = readFileSync(path, 'utf8');
    if (content.includes('ErrorBoundary')) {
      console.log('  Already wrapped: ' + name);
      continue;
    }

    // Add import
    if (!content.includes(importLine)) {
      content = content.replace(
        'import { EditDialog }',
        importLine + '\nimport { EditDialog }'
      );
    }

    // Wrap the return JSX with ErrorBoundary
    // Find the "return (" pattern that starts the JSX
    content = content.replace(
      'return (',
      'return (\n    <ErrorBoundary>'
    );

    // Find the closing ")" of the return and add ErrorBoundary end
    // The last occurrence of "</div>\n  )" is the page wrapper
    const lastDiv = content.lastIndexOf('</div>\n  )');
    if (lastDiv > 0) {
      content = content.slice(0, lastDiv + 7) + '\n    </ErrorBoundary>' + content.slice(lastDiv + 7);
    }

    writeFileSync(path, content);
    console.log('  Wrapped: ' + name);
  } catch (e) {
    console.log('  Error: ' + name + ' — ' + e.message);
  }
}
console.log('Done.');
