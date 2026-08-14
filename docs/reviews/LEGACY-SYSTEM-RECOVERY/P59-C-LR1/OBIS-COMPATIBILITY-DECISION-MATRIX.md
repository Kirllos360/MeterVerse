# OBIS COMPATIBILITY DECISION MATRIX — P59-C/LR-1

**Context:** legacy Collection System reads OBIS 1.8.0 + 2.8.0 registers for solar net metering. AGENTS.md documents MeterVerse-area legacy systems using MPRTFk Result with 5.8.0 combined channels. MeterVerse core Prisma schema has a single `Reading.value`.

## 1. What Each OBIS Code Represents (evidence)

| OBIS | Meaning | Evidence |
|------|---------|----------|
| **1.8.0** | Active energy import — consumption (delivered to customer) | Collection `routes_admin.py:659` (`reading_180`); meter registers |
| **2.8.0** | Active energy export — production (delivered back to grid / generated) | Collection `routes_admin.py:660` (`reading_280`) |
| **5.8.0** | Combined energy channel = Import + Export (both directions summed) | AGENTS.md: "5.8.0 = RT=10 = RT=8 + RT=7 (Import + Export)" for legacy area systems (PalmHills October/NewCairo/SODIC) |

## 2. System Usage Matrix

| System | Register Model | Solar? | Measurement Concept |
|--------|---------------|--------|---------------------|
| Collection System (Flask) | 1.8.0 + 2.8.0 (per solar meter) | YES — net metering | Separate import/export |
| SBill/legacy area (SQL Server) | MPRTFk Result + ResultType 5.8.0 (combined) | (per AGENTS.md combined channels) | Combined Import+Export |
| MeterVerse core (Prisma) | `Reading.value` single Float | no register fields | Single value per reading |

## 3. Key Finding

The two register models are **different measurement concepts**:
- **1.8.0/2.8.0** = directional (import vs export) — REQUIRED for net metering (surplus = export − import).
- **5.8.0** = combined sum — appropriate for a single energy channel, but **insufficient alone** to compute solar surplus (needs the directional split).

MeterVerse core currently represents **neither** explicitly (single `value`).

## 4. Decision Matrix

| Option | Description | Pros | Cons | Verdict |
|--------|-------------|------|------|---------|
| A | Add `obis180` + `obis280` fields to `Reading` | Enables solar wallet directly; matches legacy semantics | Extends core model | **RECOMMENDED** for solar module |
| B | Add generic `ReadingRegister`/`Reading.register` map (register→value) | Flexible for all OBIS (1.8.0/2.8.0/5.8.0/…) | More complex | Recommended as forward-looking alternative |
| C | Store only 5.8.0 combined; infer surplus | Simple | **Cannot compute net metering surplus** | REJECTED |
| D | Compute surplus at ingestion, store only wallet result | Simple model | Loses register auditability | Acceptable fallback, loses detail |
| E | Keep 5.8.0 combined AND add directional registers | Full fidelity (both concepts) | More columns | Best long-term; combines A+C |

## 5. Recommendation (NOT authorized to implement in this gate)

- **Short term (solar module):** Option A — add `obis180`/`obis280` to `Reading` (nullable), OR Option D if minimal schema change is desired.
- **Long term:** Option E — support both combined (5.8.0) and directional (1.8.0/2.8.0) registers, mapping 5.8.0 = 1.8.0 + 2.8.0 as an aggregate.
- **Do NOT** drop the directional registers; net metering requires them.
- The MeterVerse core Reading model change is a **separate authorized implementation decision** — not performed in this discovery gate.

## 6. Conflict Status

**CONFLICT EXISTS:** legacy Collection (1.8.0/2.8.0) vs AGENTS.md-documented area systems (5.8.0 combined) vs MeterVerse core (single value). Not resolved silently. Requires: (a) explicit model decision, (b) migration mapping if SBill data imported, (c) business confirmation of solar scope (CR 2047 legacy used 2.23 EGP/kWh; runtime uses tiered — historical vs as-built).
