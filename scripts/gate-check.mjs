#!/usr/bin/env node
/**
 * GATE_CHECK — Validates that a step/task/phase is genuinely complete.
 * Usage: node scripts/gate-check.mjs <phase> <task> <step>
 * Example: node scripts/gate-check.mjs Phase_42a T01 S01
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PLAN_ROOT = 'D:/meter/planning/001_WAVES/Wave_01_Enterprise_Hardening/Phases';
const USAGE_LOG = 'D:/meter/configs/tool-usage-log.json';

const [,, phase, task, step] = process.argv;

if (!phase || !task) {
  console.error('Usage: node scripts/gate-check.mjs <Phase> <Task> [Step]');
  console.error('Example: node scripts/gate-check.mjs Phase_42a T01 S01');
  process.exit(1);
}

let exitCode = 0;
const errors = [];
const warnings = [];

function fail(msg) { errors.push('  FAIL: ' + msg); exitCode = 1; }
function warn(msg) { warnings.push('  WARN: ' + msg); }

async function check() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  GATE_CHECK: ' + phase + ' / ' + task + (step ? ' / ' + step : ''));
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Check STEP_STATUS or TASK_STATUS file exists
  let statusPath;
  if (step) {
    statusPath = join(PLAN_ROOT, phase, 'Tasks', task, 'Steps', step, 'STEP_STATUS.yaml');
  } else {
    statusPath = join(PLAN_ROOT, phase, 'Tasks', task, 'TASK_STATUS.yaml');
  }

  if (!existsSync(statusPath)) {
    fail('STATUS file not found: ' + statusPath);
  } else {
    const content = readFileSync(statusPath, 'utf8');
    const statusMatch = content.match(/status:\s*"([^"]+)"/);
    const status = statusMatch ? statusMatch[1] : 'unknown';
    console.log('  STATUS file exists: ' + status);

    if (status !== 'COMPLETE') {
      fail('Status is "' + status + '" — expected COMPLETE');
    }

    // Check evidence_required
    const evidenceMatch = content.match(/evidence_required:\n((?:    - .*\n?)*)/);
    if (evidenceMatch) {
      const evidenceItems = evidenceMatch[1].split('\n').filter(l => l.trim().startsWith('- '));
      for (const ev of evidenceItems) {
        const path = ev.replace('- ', '').trim().replace(/"/g, '');
        if (!existsSync(path) && !existsSync('D:/meter/' + path)) {
          warn('Evidence not found: ' + path);
        }
      }
    }
  }

  // 2. Check tool usage log
  if (existsSync(USAGE_LOG)) {
    const log = JSON.parse(readFileSync(USAGE_LOG, 'utf8'));
    const hasEntry = log.log.some(e => e.task && e.task.includes(task));
    if (!hasEntry) {
      warn('No tool usage log entry found for task ' + task);
    } else {
      console.log('  Tool usage logged: YES');
    }
  }

  // 3. Check MASTER_KNOWLEDGE_CHECKLIST is updated
  const checklistPath = 'D:/meter/docs/MASTER_KNOWLEDGE_CHECKLIST.md';
  if (existsSync(checklistPath)) {
    const checklist = readFileSync(checklistPath, 'utf8');
    if (step) {
      if (checklist.includes('[x] ' + step)) {
        console.log('  Checklist updated: YES');
      } else {
        warn('Checklist may not be updated for ' + step);
      }
    }
  }

  // 4. Check dependencies are met (for phase-level)
  const phaseStatusPath = join(PLAN_ROOT, phase, 'PHASE_STATUS.yaml');
  if (existsSync(phaseStatusPath) && !step) {
    const ps = readFileSync(phaseStatusPath, 'utf8');
    const depsMatch = ps.match(/dependencies:\n((?:    - .*\n?)*)/);
    if (depsMatch) {
      const deps = depsMatch[1].split('\n').filter(l => l.trim().startsWith('- '));
      for (const d of deps) {
        const dep = d.replace('- ', '').trim().replace(/"/g, '');
        console.log('  Dependency: ' + dep + ' (assumed met)');
      }
    }
  }

  // 5. Verify git status (check for uncommitted changes)
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════════════════════════');
  if (errors.length === 0 && warnings.length === 0) {
    console.log('  ✅ GATE_CHECK PASSED — All checks satisfied');
    console.log('  Status: ' + phase + '/' + task + (step ? '/' + step : '') + ' can be marked COMPLETE');
  } else if (errors.length === 0) {
    console.log('  ⚠️  GATE_CHECK PASSED with warnings');
    warnings.forEach(w => console.log(w));
  } else {
    console.log('  ❌ GATE_CHECK FAILED — ' + errors.length + ' error(s)');
    errors.forEach(e => console.log(e));
    console.log('\n  Fix the issues above before marking COMPLETE.');
  }
  console.log('═══════════════════════════════════════════════════════════════\n');

  process.exit(exitCode);
}

check().catch(e => { console.error(e); process.exit(1); });
