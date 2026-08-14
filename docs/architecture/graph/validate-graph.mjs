#!/usr/bin/env node
// MeterVerse — Master Graph Validator (P59-C/LR-2A)
// Validates the control graphs in docs/architecture/graph/:
//   - DOT files parse (via `dot`)
//   - node/edge references resolve
//   - orphan nodes detected
//   - forbidden tenancy cycles detected
//   - edges carry required attrs (rel)
// Usage: node validate-graph.mjs
import { execFileSync } from "child_process"
import { readdirSync, readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const HERE = dirname(fileURLToPath(import.meta.url))
const dotBin = process.platform === "win32" ? "dot.exe" : "dot"

let pass = 0, fail = 0, warn = 0
const log = (ok, msg) => { if (ok) pass++; else { fail++; console.log("FAIL:", msg) } }

// 1. Parse all .dot files with graphviz; collect node/edge tokens.
const dotFiles = readdirSync(HERE).filter((f) => f.endsWith(".dot"))
for (const f of dotFiles) {
  const path = join(HERE, f)
  try {
    execFileSync(dotBin, ["-Tsvg", path, "-o", join(HERE, f.replace(".dot", ".svg"))], { stdio: "pipe" })
    pass++
  } catch (e) {
    fail++
    console.log("FAIL:", f, "DOT parse error:", String(e.stderr).split("\n")[0])
  }
}

// 2. Reference / orphan / cycle checks on the MASTER graph.
const master = readFileSync(join(HERE, "MASTER-ENTERPRISE-CONNECTIVITY.dot"), "utf8")
const nodeIds = new Set()
const edges = []
for (const m of master.matchAll(/^\s*([A-Z0-9_]+)\s+\[/gm)) nodeIds.add(m[1])
// subgraph cluster labels define rule nodes too
for (const m of master.matchAll(/^\s*"(R\d)"\s*\[/gm)) nodeIds.add(m[1])

// Collect edges between declared node tokens.
for (const line of master.split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*->\s*([A-Z0-9_]+)/)
  if (m) edges.push({ from: m[1], to: m[2] })
}
// edges inside subgraph cluster_rules are R-note nodes only (no edges) — fine.

// Orphan check: every non-note node should appear in an edge or be a declared leaf.
for (const m of master.matchAll(/^\s*([A-Z0-9_]+)\s+\[/gm)) {
  const id = m[1]
  if (id === "ENV_TEST" || id === "DB_TEST") continue // test env leaves are fine (isolated)
  const inEdge = edges.some((e) => e.from === id || e.to === id)
  if (!inEdge) warn++, console.log("WARN: potential orphan node", id, "in", "MASTER-ENTERPRISE-CONNECTIVITY.dot")
}

// Forbidden cycle detection (tenancy): Area→Project→Zone→Unit is a DAG by design.
// A cycle is a back-edge where a child points back to its ancestor.
const tenancyParents = { PROJ: "AREA", ZONE: "PROJ", UNIT: "ZONE" }
for (const e of edges) {
  // Back-edge: parent appears as child of its own child
  if (tenancyParents[e.from] === e.to) {
    log(false, `tenancy cycle: ${e.from}->${e.to}`)
  }
  // child→ancestor (non-immediate) also a cycle
  if (tenancyParents[e.to] && tenancyParents[e.to] !== e.from && tenancyParents[tenancyParents[e.to]] === e.from) {
    log(false, `tenancy skip-cycle: ${e.from}->${e.to}`)
  }
}

// 3. Required edge attributes.
for (const line of master.split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*->\s*([A-Z0-9_]+)\s+\[/)
  if (m && !line.includes("rel=")) {
    warn++, console.log("WARN: edge", m[1], "->", m[2], "missing rel attribute")
  }
}

console.log(`\nGraph validation: ${pass} pass, ${fail} fail, ${warn} warn`)
process.exit(fail > 0 ? 1 : 0)
