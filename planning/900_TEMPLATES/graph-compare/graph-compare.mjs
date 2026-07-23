#!/usr/bin/env node
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

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  GRAPHITI COMPARISON: ' + phaseName);
console.log('═══════════════════════════════════════════════════════════════\n');

// Read PHASE_OBJECTIVES.md for expected graph info
const phaseObjFile = phaseDir + '/PHASE_OBJECTIVES.md';
const expectedNodes = [];
const expectedEdges = [];

if (existsSync(phaseObjFile)) {
  const content = readFileSync(phaseObjFile, 'utf8');
  // Extract expected nodes from the phase objectives
  const nodeMatch = content.match(/## Graphiti Validation[\s\S]*?(?=##|$)/);
  if (nodeMatch) console.log('  Expected graph spec found in phase objectives\n');
}

// Compare against actual graph
const allNodeTypes = [...new Set(graphData.nodes.map(n => n.type))];
const allEdgeTypes = [...new Set(graphData.edges.map(e => e.type))];

console.log('  Current graph state:');
console.log('  - Total nodes: ' + graphData.nodes.length);
console.log('  - Total edges: ' + graphData.edges.length);
console.log('  - Node types: ' + allNodeTypes.join(', '));
console.log('  - Edge types: ' + allEdgeTypes.join(', '));

console.log('\n  Missing analysis requires expected graph spec in PHASE_OBJECTIVES.md');
console.log('  Add your expected nodes/edges to the Graphiti Validation section.');
console.log('\n═══════════════════════════════════════════════════════════════\n');
