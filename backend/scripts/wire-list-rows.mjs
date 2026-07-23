import { readFileSync, writeFileSync } from 'fs';

const path = 'D:/meter/Frontend/src/admin/tables/GenericAdminPage.tsx';
let content = readFileSync(path, 'utf8');

// Add useRouter import if not present
if (!content.includes('useRouter')) {
  content = content.replace(
    'import { useCallback, useMemo, useState, useEffect } from "react"',
    'import { useCallback, useMemo, useState, useEffect } from "react"\nimport { useRouter } from "next/navigation"'
  );
  console.log('Added useRouter import');
}

// Add router initialization
if (!content.includes('const router = useRouter()')) {
  content = content.replace(
    'const queryClient = useQueryClient()',
    'const router = useRouter()\n  const queryClient = useQueryClient()'
  );
  console.log('Added router initialization');
}

// Add onClick handler to the motion.tr that renders data rows
// The pattern is: <motion.tr key={rid} ... className="hover:bg-muted/50...">
const oldRow = `<motion.tr key={rid}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.15 }}
                        className="hover:bg-muted/50 transition-colors border-b"
                      >`;

const newRow = `<motion.tr key={rid}
                        onClick={() => {
                          const entityPath = config.resource || (config.title ? config.title.toLowerCase() : "");
                          const id = row.id || row[config.rowKey || "id"];
                          if (entityPath && id) {
                            router.push("/admin/" + entityPath + "/" + id);
                          }
                        }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.15 }}
                        className="cursor-pointer hover:bg-muted/50 transition-colors border-b"
                      >`;

if (content.includes(oldRow)) {
  content = content.replace(oldRow, newRow);
  console.log('Added onClick handler to motion.tr');
} else {
  console.log('Could not find the exact row pattern — trying alternative...');
  // Try without exact whitespace match
  if (content.includes('motion.tr key={rid}')) {
    content = content.replace(
      'motion.tr key={rid}',
      'motion.tr key={rid} onClick={() => { const entityPath = config.resource || (config.title ? config.title.toLowerCase() : ""); const id = row.id || row[config.rowKey || "id"]; if (entityPath && id) { router.push("/admin/" + entityPath + "/" + id); } } }'
    );
    console.log('Added onClick via fallback method');
  }
}

writeFileSync(path, content);
console.log('Done.');
