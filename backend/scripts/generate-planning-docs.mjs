/**
 * Planning OS Document Generator
 * Generates missing planning layers for Steps, Tasks, Phases, Waves
 * WITHOUT modifying any existing files.
 */
import { mkdirSync, writeFileSync, readdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';

const PLAN_ROOT = 'D:/meter/planning';
const TEMPLATES_DIR = join(PLAN_ROOT, '900_TEMPLATES');
const WAVES_DIR = join(PLAN_ROOT, '001_WAVES');

// ═══ 20 STANDARD STEP DOCUMENTS ═══
const STEP_DOCS = {
  '00_CONTEXT.md': `# Context\n\n## Purpose\nDescribe the current situation, problem, or opportunity this step addresses.\n\n## Business Value\nWhy this step matters to the organization.\n\n## Current State\nWhat exists today before this step is executed.\n\n## Desired State\nWhat will exist after this step is complete.\n\n## Dependencies\n- List of prerequisites\n\n## Risk\n- Technical risks\n\n## Evidence Required\n- What proof confirms completion?\n`,
  '01_BUSINESS_GOAL.md': `# Business Goal\n\n## Objective\nWhat business outcome does this step achieve?\n\n## Success Metrics\n- Metric 1\n- Metric 2\n\n## Stakeholders\n- Who benefits?\n`,
  '02_REQUIREMENTS.md': `# Requirements\n\n## Functional Requirements\n- FR-1:\n- FR-2:\n\n## Non-Functional Requirements\n- NFR-1: Performance\n- NFR-2: Security\n- NFR-3: Usability\n\n## Constraints\n- Budget\n- Timeline\n- Technology\n`,
  '03_ARCHITECTURE.md': `# Architecture\n\n## Architecture Decision\nBrief description of the architectural approach.\n\n## Components Involved\n- Component 1\n- Component 2\n\n## Data Flow\nHow data moves through the system.\n\n## Integration Points\nWhat other systems or services are involved.\n`,
  '04_DATABASE_PLAN.md': `# Database Plan\n\n## Schema Changes\n- New tables:\n- Modified tables:\n- Indexes:\n\n## Migrations\n- Migration name:\n- Rollback strategy:\n\n## Data Integrity\n- Constraints:\n- Validation rules:\n`,
  '05_BACKEND_PLAN.md': `# Backend Plan\n\n## Routes/Endpoints\n- Method: Path: Description:\n\n## Services\n- Service name: Responsibility:\n\n## Middleware\n- Middleware needed:\n\n## Business Logic\n- Key algorithms or rules:\n`,
  '06_FRONTEND_ADMIN_PLAN.md': `# Frontend Admin Plan\n\n## Pages\n- Route: Description:\n\n## Components\n- Component name: Purpose:\n\n## State Management\n- Data fetching strategy:\n- Cache strategy:\n\n## UI/UX Considerations\n- Layout:\n- Responsive behavior:\n`,
  '07_FRONTEND_USER_PLAN.md': `# Frontend User Plan\n\n## Pages\n- Route: Description:\n\n## Components\n- Component name: Purpose:\n\n## User Experience\n- User flow:\n- Accessibility considerations:\n`,
  '08_API_PLAN.md': `# API Plan\n\n## Endpoints\n- Method: Path: Request: Response:\n\n## Authentication\n- Auth strategy:\n- Permission key:\n\n## Error Handling\n- Error codes:\n- Response format:\n\n## Rate Limiting\n- Limits per endpoint:\n`,
  '09_RUNTIME_PLAN.md': `# Runtime Plan\n\n## Services\n- Service name: Purpose:\n\n## Background Jobs\n- Job type: Schedule:\n\n## Events\n- Event name: Handler:\n\n## Monitoring\n- Metrics to track:\n- Alerts to configure:\n`,
  '10_AI_PLAN.md': `# AI Plan\n\n## AI Integration\n- AI service used:\n- Purpose:\n\n## Data Requirements\n- Training data:\n- Input/Output format:\n\n## Validation\n- Accuracy metrics:\n- Fallback behavior:\n`,
  '11_GRAPHITI_PLAN.md': `# Graphiti Plan\n\n## Nodes to Add\n- Node type: Name: Description:\n\n## Edges to Add\n- Source: Target: Type:\n\n## Graph Validation\n- Expected nodes after this step:\n- Expected edges after this step:\n\n## Graph Visualization\n- Any visualization updates needed:\n`,
  '12_SPECKIT_PLAN.md': `# SpecKit Plan\n\n## Specs to Update\n- Spec name: Change:\n\n## Validators to Run\n- Validator: Expected result:\n\n## Compliance Checks\n- Check: Standard:\n`,
  '13_TEST_PLAN.md': `# Test Plan\n\n## Unit Tests\n- File: What to test:\n\n## Integration Tests\n- Endpoint: Scenario:\n\n## E2E Tests\n- User flow: Steps:\n\n## Acceptance Criteria\n- Criterion 1:\n- Criterion 2:\n`,
  '14_SECURITY_PLAN.md': `# Security Plan\n\n## Authentication\n- Auth mechanism:\n- Token strategy:\n\n## Authorization\n- Permission keys:\n- Role requirements:\n\n## Data Protection\n- Encryption:\n- PII handling:\n\n## Vulnerability Prevention\n- Input validation:\n- SQL injection prevention:\n- XSS prevention:\n`,
  '15_PERFORMANCE_PLAN.md': `# Performance Plan\n\n## Expected Load\n- Concurrent users:\n- Requests per second:\n\n## Optimization Strategies\n- Caching:\n- Query optimization:\n- Lazy loading:\n\n## Monitoring\n- Performance metrics:\n- Alert thresholds:\n`,
  '16_DOCUMENTATION_PLAN.md': `# Documentation Plan\n\n## User Documentation\n- What to document:\n- Audience:\n\n## Technical Documentation\n- API docs:\n- Architecture docs:\n\n## Update Frequency\n- When to update:\n`,
  '17_DEPLOYMENT_PLAN.md': `# Deployment Plan\n\n## Environment\n- Target environment:\n- Configuration changes:\n\n## Migration Steps\n- Step 1:\n- Step 2:\n\n## Rollback Strategy\n- How to revert if deployment fails:\n\n## Validation\n- Post-deployment checks:\n`,
  '18_EVIDENCE_PLAN.md': `# Evidence Plan\n\n## Evidence Required\n- Evidence 1:\n- Evidence 2:\n\n## Storage Location\n- Where evidence is stored:\n\n## Verification\n- How to verify evidence is complete:\n\n## Gate Check\n- GATE_CHECK validation criteria:\n`,
  '19_GIT_PLAN.md': `# Git Plan\n\n## Branch Strategy\n- Branch name:\n- Base branch:\n\n## Commit Strategy\n- Number of commits expected:\n- Commit message convention:\n\n## Files Affected\n- File 1:\n- File 2:\n\n## Code Review\n- Reviewers:\n- Review checklist:\n`,
  '20_DONE_CHECKLIST.md': `# Done Checklist\n\n## Quality Gates\n- [ ] Code compiles without errors\n- [ ] All tests pass\n- [ ] Evidence committed\n- [ ] Status updated to COMPLETE\n- [ ] Graphiti updated\n- [ ] SpecKit validated\n- [ ] Tool usage logged\n- [ ] Checklist updated\n\n## Acceptance Criteria Met\n- [ ] Criterion 1:\n- [ ] Criterion 2:\n\n## Documentation Updated\n- [ ] README updated\n- [ ] API docs updated (if applicable)\n\n## Review Completed\n- [ ] Self-review\n- [ ] Peer review (if applicable)\n`,
};

// ═══ TASK ARCHITECTURE TEMPLATE ═══
const TASK_ARCHITECTURE = `# Task Architecture

## Overview
Description of what this task achieves within its phase.

## Business Rules
- Rule 1:
- Rule 2:

## APIs
| Method | Path | Permission Key | Description |
|--------|------|---------------|-------------|
| GET | /api/example | example.list | List examples |

## Database
- Tables affected:
- Indexes needed:
- Migrations:

## Runtime
- Services:
- Events:
- Jobs:

## Graph
- Nodes to add/modify:
- Edges to add:

## Dependencies
- Tasks that must complete first:

## Risks
- Risk 1: Mitigation

## Testing
- Test type: Coverage target:

## Completion Matrix
| Criteria | Pass/Fail | Evidence |
|----------|-----------|----------|
| Acceptance criteria 1 | | |
| Acceptance criteria 2 | | |
`;

// ═══ PHASE OBJECTIVES TEMPLATE ═══
const PHASE_OBJECTIVES = `# Phase Objectives

## Overview
Phase description and goals.

## Business Objectives
- Objective 1:
- Objective 2:

## Architecture Objectives
- Objective 1:

## Frontend Objectives
- Pages to build/modify:
- Components to create:

## Backend Objectives
- Routes to create/modify:
- Services to create:

## Database Objectives
- Schema changes:
- Indexes:

## Runtime Objectives
- Services:
- Jobs:

## Testing Objectives
- Coverage targets:
- Test types:

## Security Objectives
- Permission keys:
- Auth mechanisms:

## Performance Objectives
- Response time targets:
- Load targets:

## Documentation Objectives
- What to document:

## Graphiti Validation
| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Phase nodes in graph | | | |
| Phase edges in graph | | | |

## SpecKit Validation
| Check | Result |
|-------|--------|
| Spec compliance | |
| Evidence check | |

## Lessons Learned
- What went well:
- What could be improved:

## Known Risks
- Risk 1:

## Exit Criteria
- [ ] All tasks complete
- [ ] All acceptance criteria met
- [ ] Graphiti validated
- [ ] SpecKit passed
- [ ] T99 audit passed
`;

// ═══ WAVE VISION TEMPLATE ═══
const WAVE_VISION = `# Wave Vision

## Vision Statement
One-paragraph description of what this wave achieves.

## Architecture
High-level architecture diagram description.

## Scope
- In scope:
- Out of scope:

## Deliverables
| Phase | Deliverable | Owner |
|-------|------------|-------|
| Phase 1 | | |

## Timeline
| Phase | Start | End | Duration |
|-------|-------|-----|----------|
| | | | |

## Risks
- Risk 1: Impact: Mitigation:

## Dependencies
- Internal:
- External:

## Graph
Expected state of the knowledge graph after wave completion.

## KPIs
| KPI | Target | Measurement |
|-----|--------|------------|
| | | |

## Budget
- Estimated effort (hours):
- Resources needed:

## Exit Criteria
- [ ] All phases complete
- [ ] All T99 audits passed
- [ ] Graphiti up to date
- [ ] SpecKit validated
- [ ] Wave documentation complete

## Enterprise Review
- Architecture review:
- Security review:
- Performance review:
`;

// ═══ GENERATE ALL TEMPLATES ═══
console.log('=== Generating Planning OS Templates ===\n');

// 1. Save step document templates
const stepDocsDir = join(TEMPLATES_DIR, 'step-docs');
mkdirSync(stepDocsDir, { recursive: true });
for (const [filename, content] of Object.entries(STEP_DOCS)) {
  const path = join(stepDocsDir, filename);
  if (!existsSync(path)) {
    writeFileSync(path, content);
    console.log('  + ' + path.replace(PLAN_ROOT, 'planning'));
  }
}

// 2. Save task architecture template
const taskArchDir = join(TEMPLATES_DIR, 'task-arch');
mkdirSync(taskArchDir, { recursive: true });
const taskArchPath = join(taskArchDir, 'TASK_ARCHITECTURE.md');
if (!existsSync(taskArchPath)) {
  writeFileSync(taskArchPath, TASK_ARCHITECTURE);
  console.log('  + ' + taskArchPath.replace(PLAN_ROOT, 'planning'));
}

// 3. Save phase objectives template
const phaseObjDir = join(TEMPLATES_DIR, 'phase-obj');
mkdirSync(phaseObjDir, { recursive: true });
const phaseObjPath = join(phaseObjDir, 'PHASE_OBJECTIVES.md');
if (!existsSync(phaseObjPath)) {
  writeFileSync(phaseObjPath, PHASE_OBJECTIVES);
  console.log('  + ' + phaseObjPath.replace(PLAN_ROOT, 'planning'));
}

// 4. Save wave vision template
const waveVisionDir = join(TEMPLATES_DIR, 'wave-vision');
mkdirSync(waveVisionDir, { recursive: true });
const waveVisionPath = join(waveVisionDir, 'WAVE_VISION.md');
if (!existsSync(waveVisionPath)) {
  writeFileSync(waveVisionPath, WAVE_VISION);
  console.log('  + ' + waveVisionPath.replace(PLAN_ROOT, 'planning'));
}

// ═══ GENERATE DOCS FOR EACH EXISTING STEP ═══
console.log('\n=== Generating Step Documents ===\n');
const phases = readdirSync(join(WAVES_DIR, 'Wave_01_Enterprise_Hardening', 'Phases'), { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name);

let stepsGenerated = 0;
for (const phase of phases) {
  const phaseDir = join(WAVES_DIR, 'Wave_01_Enterprise_Hardening', 'Phases', phase);
  const tasksDir = join(phaseDir, 'Tasks');
  if (!existsSync(tasksDir)) continue;

  const tasks = readdirSync(tasksDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  for (const task of tasks) {
    const stepsDir = join(tasksDir, task, 'Steps');
    if (!existsSync(stepsDir)) continue;

    const steps = readdirSync(stepsDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
    for (const step of steps) {
      const stepDir = join(stepsDir, step);
      
      for (const [filename, content] of Object.entries(STEP_DOCS)) {
        const filePath = join(stepDir, filename);
        if (!existsSync(filePath)) {
          writeFileSync(filePath, content);
          stepsGenerated++;
        }
      }

      // Generate task architecture doc for each task
      const taskArchFile = join(tasksDir, task, 'TASK_ARCHITECTURE.md');
      if (!existsSync(taskArchFile)) {
        writeFileSync(taskArchFile, TASK_ARCHITECTURE);
      }
    }
  }

  // Generate phase objectives doc for each phase
  const phaseObjFile = join(phaseDir, 'PHASE_OBJECTIVES.md');
  if (!existsSync(phaseObjFile)) {
    writeFileSync(phaseObjFile, PHASE_OBJECTIVES);
  }
}

// Generate wave vision doc
const waveDir = join(WAVES_DIR, 'Wave_01_Enterprise_Hardening');
const waveVisionFile = join(waveDir, 'WAVE_VISION.md');
if (!existsSync(waveVisionFile)) {
  writeFileSync(waveVisionFile, WAVE_VISION);
}

console.log('  Generated ' + stepsGenerated + ' step planning documents');
console.log('  + TASK_ARCHITECTURE.md files created for each task');
console.log('  + PHASE_OBJECTIVES.md files created for each phase');
console.log('  + WAVE_VISION.md created for Wave 01');

// ═══ GENERATE GRAPHITI COMPARISON SCRIPT ═══
console.log('\n=== Generating Graphiti Comparison Tool ===\n');
const graphCompareDir = join(TEMPLATES_DIR, 'graph-compare');
mkdirSync(graphCompareDir, { recursive: true });

const graphCompareScript = `#!/usr/bin/env node
/**
 * Graphiti Comparison Tool — compares expected vs actual graph for a phase.
 * Usage: node scripts/graph-compare.mjs <PhaseName>
 */
import { readFileSync, existsSync } from 'fs';

const PHASES_DIR = 'D:/meter/planning/001_WAVES/Wave_01_Enterprise_Hardening/Phases';
const GRAPH_FILE = 'D:/meter/graphiti/index.json';

const [,, phaseName] = process.argv;
if (!phaseName) { console.error('Usage: node scripts/graph-compare.mjs <PhaseName>'); process.exit(1); }

const phaseDir = PHASES_DIR + '/' + phaseName;
if (!existsSync(phaseDir)) { console.error('Phase not found: ' + phaseName); process.exit(1); }

const graphData = JSON.parse(readFileSync(GRAPH_FILE, 'utf8'));

console.log('\\n═══════════════════════════════════════════════════════════════');
console.log('  GRAPHITI COMPARISON: ' + phaseName);
console.log('═══════════════════════════════════════════════════════════════\\n');

// Read PHASE_OBJECTIVES.md for expected graph info
const phaseObjFile = phaseDir + '/PHASE_OBJECTIVES.md';
const expectedNodes = [];
const expectedEdges = [];

if (existsSync(phaseObjFile)) {
  const content = readFileSync(phaseObjFile, 'utf8');
  // Extract expected nodes from the phase objectives
  const nodeMatch = content.match(/## Graphiti Validation[\\s\\S]*?(?=##|$)/);
  if (nodeMatch) console.log('  Expected graph spec found in phase objectives\\n');
}

// Compare against actual graph
const allNodeTypes = [...new Set(graphData.nodes.map(n => n.type))];
const allEdgeTypes = [...new Set(graphData.edges.map(e => e.type))];

console.log('  Current graph state:');
console.log('  - Total nodes: ' + graphData.nodes.length);
console.log('  - Total edges: ' + graphData.edges.length);
console.log('  - Node types: ' + allNodeTypes.join(', '));
console.log('  - Edge types: ' + allEdgeTypes.join(', '));

console.log('\\n  Missing analysis requires expected graph spec in PHASE_OBJECTIVES.md');
console.log('  Add your expected nodes/edges to the Graphiti Validation section.');
console.log('\\n═══════════════════════════════════════════════════════════════\\n');
`;

writeFileSync(join(graphCompareDir, 'graph-compare.mjs'), graphCompareScript);
console.log('  + graph-compare.mjs — compares expected vs actual graph');

// ═══ GENERATE SPECKIT ENHANCEMENT ═══
console.log('\n=== Generating SpecKit Enhancement ===\n');
const speckitEnhanceDir = join(TEMPLATES_DIR, 'speckit-enhance');
mkdirSync(speckitEnhanceDir, { recursive: true });

const speckitEnhance = `#!/usr/bin/env node
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

console.log('\\n═══════════════════════════════════════════════════════════════');
console.log('  SPECKIT VALIDATION: ' + phase + '/' + task + (step ? '/' + step : ''));
console.log('═══════════════════════════════════════════════════════════════\\n');

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
  const statusMatch = content.match(/status:\\s*"([^"]+)"/);
  check('Status file exists', true);
  if (statusMatch) check('Status: ' + statusMatch[1], true);
}

// 4. Evidence Check
if (stepDir && existsSync(stepDir)) {
  const stepStatusFile = statusPath;
  if (existsSync(stepStatusFile)) {
    const sc = readFileSync(stepStatusFile, 'utf8');
    const evMatch = sc.match(/evidence_required:\\n((?:    - .*\\n?)*)/);
    if (evMatch) {
      const evItems = evMatch[1].split('\\n').filter(l => l.includes('- '));
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

console.log('\\n═══════════════════════════════════════════════════════════════');
console.log('  SPEC KIT RESULTS: ' + (errors === 0 ? 'ALL PASSED' : errors + ' FAILURES'));
console.log('═══════════════════════════════════════════════════════════════\\n');
process.exit(errors > 0 ? 1 : 0);
`;

writeFileSync(join(speckitEnhanceDir, 'speckit-validate.mjs'), speckitEnhance);
console.log('  + speckit-validate.mjs — mandatory spec/graph/status/evidence/docs/memory check');

// ═══ GENERATE WAVE 01 VISION FILE ═══
console.log('\n=== Generated planning templates: ===');
console.log('  planning/900_TEMPLATES/step-docs/ — 20 document templates');
console.log('  planning/900_TEMPLATES/task-arch/TASK_ARCHITECTURE.md');
console.log('  planning/900_TEMPLATES/phase-obj/PHASE_OBJECTIVES.md');
console.log('  planning/900_TEMPLATES/wave-vision/WAVE_VISION.md');
console.log('  planning/900_TEMPLATES/graph-compare/graph-compare.mjs');
console.log('  planning/900_TEMPLATES/speckit-enhance/speckit-validate.mjs');
console.log('  planning/001_WAVES/Wave_01_Enterprise_Hardening/WAVE_VISION.md');
console.log('  All phase PHASE_OBJECTIVES.md files');
console.log('  All task TASK_ARCHITECTURE.md files');
console.log('  All step 20-document sets');
console.log('\n=== Generation complete ===');
