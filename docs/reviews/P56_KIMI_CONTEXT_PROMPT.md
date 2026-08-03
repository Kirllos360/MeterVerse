# METERVERSE OS — FULL CONTEXT PROMPT FOR KIMI

**Version:** 1.0 · **Date:** 2026-08-03 · **Purpose:** Give you (Kimi) complete understanding of the MeterVerse OS project so you can independently evaluate the same open questions and cross-check the decisions proposed to ChatGPT. This ensures both AI systems stay aligned.

## HOW TO USE THIS
Read this prompt fully. Then read the evidence files listed in Section 9 (they give the full repository + runtime + governance picture). Your role is **independent reviewer**: confirm or challenge the recommendations, propose the best architecture for the open questions, and flag risks the other reviewer (ChatGPT) might miss.

## 1. PROJECT IN 30 SECONDS
MeterVerse OS = enterprise utility metering + billing platform (meters, customers, readings, invoices, payments, collections, finance, AI). Built as an enterprise monorepo: ONE Next.js frontend source, ONE Express backend source, ONE PostgreSQL, but **two standalone runtime profiles** (Admin console + Customer portal) that run simultaneously on separate ports with separate build dirs.

## 2. ARCHITECTURE
- Admin profile → `localhost:3535` (console at root `/`) + Admin API `:3131`
- Portal profile → `localhost:3030` (user version at `/`) + Portal API `:3003`
- Profile controlled by env: `PORTAL_MODE=1` (+ `NEXT_PUBLIC_PORTAL_MODE=1` for client components). Separate distDirs `.next` / `.next-portal`.
- Shared packages: `packages/{shared-types, auth, api-client, runtime}`. `apps/` = deployable profiles.
- RBAC: role→permission mapping; portal backend **gates** admin routes (verified 404).

## 3. RECENT CRITICAL FIXES (P56 zero-trust audit)
1. Portal :3030 was rendering the ADMIN console → fixed by using `NEXT_PUBLIC_PORTAL_MODE` (client-visible) instead of server-only `PORTAL_MODE` for the client root gate.
2. Admin :3535/ was redirecting → now serves console at root (200).
3. Portal BE had been started without PORTAL_MODE (admin routes exposed) → restarted correctly, admin routes now gated (404).
4. UTF-8 BOM had crept into package.json files (broke `next` parsing) → removed.

## 4. SECURITY / DATA STATE
- Auth: bcrypt + JWT (15m + refresh) + MFA (TOTP) + lockout + rate-limit + prod JWT fail-fast.
- RBAC verified live (admin 200 / billing 403 / ops 403). Portal gates admin API.
- DB: 7 users, 5 roles, 30 permissions, 4 areas, 23 projects, 1368 customers, 1721 meters, 1839 readings, 589 invoices, 272 payments. 0 broken FKs.
- No secrets in repo. `.env` gitignored; `.env.example` committed.

## 5. OPEN QUESTIONS (the decisions needed)
- **Q1 DB separation:** Owner wants separate DB connectivity per profile (no cross-profile backdoor) but a shared login UI. Options: (A) two DBs same schema, (B) one DB two schemas, (C) one DB two roles, (D) current single. **KEY: is admin + portal the SAME business data (customers/meters/invoices) viewed differently, or SEPARATE tenancies?** This determines whether separation is safe. Give your verdict.
- **Q2 Shared login:** same login UI, POSTs to current profile's backend. Confirm.
- **Q3 Two super-admin accounts** (`kirllos` / `kirllos.hany@epower.com.eg` / `K14455`, full permissions) — one per system. Define modeling (role vs permission list; one record vs two).
- **Q4 Sign-out gap:** currently broken; needs shared `/login` + profile-aware POST + proper sign-out redirect.
- **Q5 Area/Project/User wiring:** create area + project, wire to user via roles + permissions. Define the model (user→area/project scoping; is PermissionOnRole the source of truth?).
- **Q6 Tooling:** recommend standardization (prisma migrate vs db push, Playwright E2E + Lighthouse in CI, etc.).

## 6. RISKS I SEE (cross-check these)
- DB split breaks data consistency IF admin/portal share business data.
- Shared-login must not allow cross-profile auth (enforce system_type on BE + NEXT_PUBLIC_PORTAL_MODE on FE).
- Migration debt (db push; only 2 of 15 migrations recorded).
- Turbopack dev-cache fragility (CSS/routes corruption — needs cache-clean in launchers).
- JWT secret default must change in prod.
- ~13 pages reachable only via pageMap (not in nav); some mock-data pages.

## 7. WHAT I WANT FROM YOU
1. Decide Q1–Q6 with rationale (agree or disagree with ChatGPT's eventual answers).
2. Flag anything the other reviewer might miss.
3. Propose the Wave-4 order (C15 → C26 → C17) + prerequisites.

## 8. EVIDENCE TO READ
`docs/reviews/P56_CHATGPT_BRAIN_PROMPT.md`, `P55_FORENSIC_GAP_ANALYSIS.md`, `P55_CHATGPT_HANDOVER.md`, `P54_RUNTIME_SEPARATION_CERTIFICATION.md`, `.ai/memory/PROJECT_STATE.md`, `P40_EXECUTION_TRACKER.md`, `backend/prisma/schema.prisma`, `Frontend/src/app/page.tsx`, `Frontend/next.config.ts`, `_tools/config.cmd`.

## 9. COMMITS
`a0cfdf2c` (P56 portal fix) · `61b49787` (admin root) · `a5909677` (standalone split) · `ed02477a` (P54) · `0b95d390` (P55).
