#!/usr/bin/env node
// Pre-commit hook: TypeScript check + vitest run
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND = path.join(ROOT, 'Frontend');
const BACKEND = path.join(ROOT, 'Backend');

let exitCode = 0;

function run(label, cmd, cwd) {
  try {
    console.log(`\n[pre-commit] ${label}...`);
    execSync(cmd, { cwd, stdio: 'pipe', timeout: 120000 });
    console.log(`[pre-commit] ✅ ${label} passed`);
  } catch (e) {
    console.log(`[pre-commit] ❌ ${label} FAILED`);
    console.log(e.stdout?.toString() || e.message);
    exitCode = 1;
  }
}

run('TypeScript check (frontend)', 'npx tsc --noEmit', FRONTEND);
run('Vitest (backend)', 'npx vitest run --reporter=verbose 2>&1', BACKEND);

if (exitCode === 0) {
  console.log('\n[pre-commit] ✅ All checks passed. Proceeding with commit.');
} else {
  console.log('\n[pre-commit] ❌ Some checks failed. Commit blocked.');
}
process.exit(exitCode);
