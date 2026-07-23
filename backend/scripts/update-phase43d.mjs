import { readFileSync, writeFileSync } from 'fs';

const path = 'D:/meter/planning/001_WAVES/Wave_02_User_Experience_Communication/Phases/Phase_43d_UX_Accessibility/PHASE_STATUS.yaml';
let content = readFileSync(path, 'utf8');

const newTasks = {
  T15_Admin_AlertRules_Page: 'Build admin page for managing alert rules',
  T16_Contracts_Admin_UI: 'Build dedicated admin management page for contracts',
  T17_Full_Permission_Enforcement: 'Replace requireRole with requirePermission on all remaining route files',
  T18_ActivityStream_Monitoring_Dashboard: 'Build monitoring dashboard using ActivityStream data',
  T19_Admin_Backup_Management_UI: 'Build admin backup management page with schedule and restore',
  T20_Admin_Queue_Management_UI: 'Build admin queue management page with retry and cancel',
  T21_Admin_Cache_Management_UI: 'Build admin cache management page with invalidation',
};

for (const [key, desc] of Object.entries(newTasks)) {
  const indent = '\n    ';
  const entry = indent + key + ':\n      name: "' + desc + '"\n      status: PLANNING\n      steps:\n        S01: "Implement"';
  if (!content.includes(key)) {
    const tasksIdx = content.indexOf('tasks:');
    const insertPoint = content.indexOf('\n', tasksIdx) + 1;
    content = content.slice(0, insertPoint) + entry + content.slice(insertPoint);
  }
}

writeFileSync(path, content);
console.log('Updated Phase 43d with ' + Object.keys(newTasks).length + ' new tasks');
