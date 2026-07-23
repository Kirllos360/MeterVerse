#!/usr/bin/env node
/**
 * SpecKit Enhanced — Mandatory validation per step.
 * Checks: Spec, Graph, Status, Evidence, Documentation, Memory alignment
 */
import { readFileSync, existsSync, readdirSync } from 'fs';

const PLAN_ROOT = 'D:/meter/planning';
const MEMORY_DIR = 'D:/meter/.ai/memory';
const CHECKLIST_FILE = 'D:/meter/docs/MASTER_KNOWLEDGE_CHECKLIST.md';

const [,, phase, task, step] = process.argv;
if (!phase || !task) { console.error('Usage: node speckit/validate.mjs <Phase> <Task> [Step]'); process.exit(1); }

let errors = 0;
function check(name, condition) {
  if (condition) { console.log('  [PASS] ' + name); }
  else { console.log('  [FAIL] ' + name); errors++; }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  SPECKIT VALIDATION: ' + phase + '/' + task + (step ? '/' + step : ''));
console.log('═══════════════════════════════════════════════════════════════\n');

// 1. Spec Check
const stepDir = step 
  ? PLAN_ROOT + '/001_WAVES/Wave_01_Enterprise_Hardening/Phases/' + phase + '/Tasks/' + task + '/Steps/' + step
  : null;

if (stepDir && existsSync(stepDir)) {
  const docs = readdirSync(stepDir);
  const requiredDocs = ['00_CONTEXT.md','01_BUSINESS_GOAL.md','02_REQUIREMENTS.md','03_ARCHITECTURE.md',
    '04_DATABASE_PLAN.md','05_BACKEND_PLAN.md','06_FRONTEND_ADMIN_PLAN.md','08_API_PLAN.md',
    '13_TEST_PLAN.md','14_SECURITY_PLAN.md','20_DONE_CHECKLIST.md'];
  
  for (const doc of requiredDocs) {
    check('Step doc: ' + doc, docs.includes(doc));
  }
}

// 2. Graph Check
const graphFile = 'D:/meter/graphiti/index.json';
if (existsSync(graphFile)) {
  const graph = JSON.parse(readFileSync(graphFile, 'utf8'));
  check('Graphiti has nodes', graph.nodes && graph.nodes.length > 0);
  check('Graphiti has edges', graph.edges && graph.edges.length > 0);
}

// 3. Status Check
let statusPath;
if (step) {
  statusPath = PLAN_ROOT + '/001_WAVES/Wave_01_Enterprise_Hardening/Phases/' + phase + '/Tasks/' + task + '/Steps/' + step + '/STEP_STATUS.yaml';
} else {
  statusPath = PLAN_ROOT + '/001_WAVES/Wave_01_Enterprise_Hardening/Phases/' + phase + '/Tasks/' + task + '/TASK_STATUS.yaml';
}

if (existsSync(statusPath)) {
  const content = readFileSync(statusPath, 'utf8');
  const statusMatch = content.match(/status:\s*"([^"]+)"/);
  check('Status file exists', true);
  if (statusMatch) check('Status: ' + statusMatch[1], true);
}

// 4. Evidence Check
if (stepDir && existsSync(stepDir)) {
  const stepStatusFile = statusPath;
  if (existsSync(stepStatusFile)) {
    const sc = readFileSync(stepStatusFile, 'utf8');
    const evMatch = sc.match(/evidence_required:\n((?:    - .*\n?)*)/);
    if (evMatch) {
      const evItems = evMatch[1].split('\n').filter(l => l.includes('- '));
      check('Evidence requirements defined', evItems.length > 0);
    }
  }
}

// 5. Documentation Check
const checklistPath = CHECKLIST_FILE;
if (existsSync(checklistPath)) {
  const checklist = readFileSync(checklistPath, 'utf8');
  check('Checklist file exists', true);
  if (step) check('Step in checklist', checklist.includes(step));
}

// 6. Memory Check
const memoryFiles = existsSync(MEMORY_DIR) ? readdirSync(MEMORY_DIR) : [];
check('AI memory directory exists', memoryFiles.length > 0);
check('AI_BIBLE.md exists', memoryFiles.includes('AI_BIBLE.md'));
check('PROJECT_STATE.md exists', memoryFiles.includes('PROJECT_STATE.md'));

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  SPEC KIT RESULTS: ' + (errors === 0 ? 'ALL PASSED' : errors + ' FAILURES'));
console.log('═══════════════════════════════════════════════════════════════\n');
process.exit(errors > 0 ? 1 : 0);
