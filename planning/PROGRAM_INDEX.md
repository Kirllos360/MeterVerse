# MeterVerse — Enterprise Program Index

```
000_ENTERPRISE_PROGRAM/           ← NEW: Program layer above Waves
├── PROGRAM_VISION.md             ← Enterprise vision, strategic objectives
├── Enterprise_Architecture/      ← Cross-product architecture, shared components
├── Global_Roadmap/               ← Wave sequencing, timing, release criteria
├── Shared_Runtime/               ← Runtime services shared by all products
├── Shared_Database/              ← Database schema, access rules, multi-tenancy
├── Shared_Components/            ← Frontend + backend shared component catalog
├── Shared_AI/                    ← AI architecture, principles, data sources
└── Shared_Standards/             ← API, DB, frontend, code, documentation standards

000_MASTER_CONTROL/               ← Existing — unchanged
├── Vision/                       ← Project vision
├── Rules/                        ← Enterprise rules (1-8)
├── Graphs/                       ← Master dependency graph
├── Status/                       ← PROJECT_STATUS.yaml
├── Protocols/                    ← Execution protocol
├── Timeline/                     ← Master timeline
├── Risks/                        ← Risk register
└── ...

001_WAVES/                        ← Existing — unchanged
├── Wave_01_Enterprise_Hardening  ← ✅ Complete (8 phases)
├── Wave_02_User_Experience_Comms ← 📋 Planned (4 phases)
├── Wave_03_Enterprise_Billing    ← 📋 Planned (4 phases)
├── Wave_04_Platform_Hardening    ← 📋 Planned (5 phases)
├── Wave_05_AI_Intelligence       ← 📋 Planned (4 phases)
└── Wave_06_Mobile_Release        ← 📋 Planned (3 phases)

900_TEMPLATES/                    ← Existing — enhanced with new layers
├── PROMPTS/                      ← 17 prompt templates
├── step-docs/                    ← 20 document templates per step
├── task-arch/                    ← Task architecture template
├── phase-obj/                    ← Phase objectives template
├── wave-vision/                  ← Wave vision template
├── graph-compare/                ← Graphiti comparison tool
└── speckit-enhance/              ← SpecKit enhanced validation
```

**Structure:** Enterprise Program → Waves → Phases → Tasks → Steps
**Products:** System A (Admin) + System B (User Workspace) under one program
**Status:** Wave 01 Complete | Waves 02-06 Planned | Enterprise Release target: Wave 06


30 Enterprise Governance Layers:
+-- 01_Enterprise_Capability_Model     ? What capabilities exist
+-- 02_Business_Process_Catalog        ? How business processes flow
+-- 03_Enterprise_Data_Dictionary      ? What data means
+-- 04_API_Contract_Library           ? API contracts and rules
+-- 05_Component_Catalog              ? Shared UI components
+-- 06_Runtime_Dependency_Map         ? Service dependencies
+-- 07_Feature_Dependency_Matrix      ? Feature prerequisites
+-- 08_CrossWave_Dependency_Matrix    ? Wave-to-wave dependencies
+-- 09_Risk_Register                  ? Identified risks
+-- 10_Architecture_Decision_Records  ? ADR index
+-- 11_Technical_Debt_Register        ? Known technical debt
+-- 12_Enterprise_Testing_Pyramid     ? Test type coverage
+-- 13_Migration_Catalog              ? Database migration history
+-- 14_Release_Train                  ? Release stages
+-- 15_AI_Knowledge_Base              ? Rules, standards, prompts
+-- 16_Enterprise_Traceability_Matrix ? Full traceability chain
+-- 17_Enterprise_State_Machine       ? Entity state machines
+-- 18_Data_Flow_Catalog              ? Data movement through system
+-- 19_Enterprise_Workflows           ? Cross-cutting workflows
+-- 20_Feature_Catalog                ? Features grouped by capability
+-- 21_Product_Strategy               ? WHY we build
+-- 22_Product_Personas               ? WHO we build for
+-- 23_Quality_Gates                  ? 10 gates per phase
+-- 24_Enterprise_Verification        ? Verification chain
+-- 25_Release_Governance             ? Release approval process
+-- 26_Operation_Runbook              ? Daily operations
+-- 27_PostRelease_Monitoring         ? Post-release checks
+-- 28_AI_Execution_Rules             ? AI behavior rules
+-- 29_AI_Self_Review                 ? AI self-review checklist
+-- 30_AI_Stop_Conditions             ? When AI must stop
+-- AI_EXECUTION_CONTRACT.md          ? Mandatory before any work
