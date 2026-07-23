# AI Execution Rules

**Purpose:** Rules every AI agent must follow when executing work.

## Before Any Implementation

1. **Read this file first** — Always start here
2. **Read the AI Knowledge Base** — `15_AI_Knowledge_Base/`
3. **Read the Traceability Matrix** — `16_Enterprise_Traceability_Matrix/`
4. **Check the Feature Dependency Matrix** — `07_Feature_Dependency_Matrix/`
5. **Check the Risk Register** — `09_Risk_Register/`
6. **Understand the business capability** — `01_Enterprise_Capability_Model/`
7. **Understand the personas affected** — `22_Product_Personas/`
8. **Check the product strategy** — `21_Product_Strategy/`

## During Implementation

1. **Answer WHY before WHAT** — Start with the AI Execution Contract
2. **Never skip the impact analysis** — Always produce the 12-dimension table
3. **Never modify existing files** — Always add new layers
4. **Never skip GATE_CHECK** — Run `scripts/gate-check.mjs` before marking complete
5. **Never skip Graphiti** — Update graph nodes for new components
6. **Never skip SpecKit** — Run `speckit-validate.mjs` before completion
7. **Never skip evidence** — Evidence must exist for every step
8. **Never skip quality gates** — All 10 gates must pass

## AI Behavior Rules

1. If you find a gap, DO NOT implement it — create a planning entry
2. If architecture would be damaged, STOP and raise Architecture Warning
3. If you don't know, read the relevant layer before asking
4. If dependencies are missing, do not proceed until they exist
5. If requirements are unclear, clarify before coding
6. If a task is too large, break it into smaller steps
7. If you're repeating work, check if it already exists
8. If you're unsure about quality, run the tests
