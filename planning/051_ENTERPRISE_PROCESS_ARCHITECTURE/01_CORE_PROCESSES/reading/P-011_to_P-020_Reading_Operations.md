# Reading Process Specifications (P-011 to P-020)

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/01_CORE_PROCESSES/reading/P-011_to_P-020_Reading_Operations.md`

---

## P-011: Reading Import

**Business Purpose:** Ingest meter readings from external sources (AMI/MDM, gateway, manual entry, bulk file upload).  
**Business Goal:** Capture every reading without data loss.  
**Business Owner:** Meter Data Management Director  
**Priority:** P0 — Critical | **Criticality:** Revenue — no readings = no billing  
**Trigger:** AMI push, Gateway relay, File upload, Manual entry  
**Preconditions:** Meter must exist and be in ACTIVE state  
**Inputs:** Meter ID, Reading value, Timestamp, Source (AMI/manual/bulk), Unit  
**Outputs:** Reading record created, Validation triggered  
**Primary Actor:** System (AMI/Gateway) | **Secondary Actors:** Field Technician, Data Entry Clerk  
**Roles:** System (auto), readings.create (manual)  
**Permissions:** `readings.create`  
**Validation Rules:** Value must be non-negative. Timestamp must be within acceptable range. Meter must be active.  
**Decision Points:** Auto-import passes validation? → Approve automatically. Fails validation? → Flag for review.  
**Exception Paths:** Meter not found → Dead letter queue. Duplicate reading → Reject. Gateway offline → Queue for retry.  
**Retry Strategy:** Exponential backoff: 1min, 5min, 15min, 1hr, 4hrs. Max 5 retries.  
**Rollback Strategy:** N/A (read-only after creation)  
**SLA:** Reading imported within 5 seconds of transmission | **KPI:** Reading capture rate > 99.99%  
**Business Rules:** Readings received after billing cutoff are applied to next period. Duplicate detection by (meterId + timestamp).  
**Dependencies:** P-001 (Meter must exist), P-014 (Reading Validation downstream)  
**Related APIs:** POST /api/readings, POST /api/readings/bulk  
**DB Tables:** Reading, Meter  
**Events:** ReadingReceived, ReadingImported  
**Risks:** Data loss on gateway failure, Duplicate readings  
**Performance:** 10,000 readings/minute throughput | **Availability:** 99.99%  
**Implementation Priority:** P0 | **Wave:** 01 | **Sessions:** 3

---

## P-012: Manual Reading

**Business Purpose:** Record a meter reading taken manually by a field technician or customer.  
**Business Owner:** Field Operations Manager  
**Priority:** P0 — Critical  
**Preconditions:** Meter accessible. Field technician authenticated.  
**Inputs:** Meter serial (scan or enter), Reading value, GPS location, Photo (optional)  
**Outputs:** Reading created in PENDING status awaiting validation  
**Primary Actor:** Field Technician | **Secondary Actors:** Customer (self-read)  
**SLA:** Reading recorded within 5 minutes of field visit | **Sessions:** 2

---

## P-013: Bulk Reading Upload

**Business Purpose:** Import a large batch of readings from a file (CSV, Excel) for multiple meters.  
**Business Owner:** Meter Data Management  
**Priority:** P0 — Critical  
**Trigger:** Monthly reading cycle, Area-wide collection, Third-party data handoff  
**Inputs:** File (CSV/Excel), File format template, Batch metadata  
**Outputs:** ImportJob created, Readings processed, Validation report generated  
**Primary Actor:** Meter Operations (admin) | **Secondary Actors:** System (auto-process)  
**Permissions:** `readings.create`  
**Validation:** File format validation, Row-by-row validation with error report  
**Exception Paths:** File format invalid → Reject with format guide. Partial failures → Process valid rows, report errors.  
**SLA:** 10,000 readings processed within 30 minutes | **KPI:** Bulk success rate > 98%  
**Sessions:** 3

---

## P-014: Reading Validation

**Business Purpose:** Automatically validate every reading against business rules (spike, drop, zero, threshold, sequence checks).  
**Business Owner:** Meter Data Management Director  
**Priority:** P0 — Critical | **Criticality:** Billing accuracy — invalid readings cause billing errors  
**Trigger:** Reading created (P-011, P-012, P-013)  
**Inputs:** Reading record, Previous readings (for comparison), Validation rules, Meter configuration (CT/PT ratios)  
**Outputs:** Reading status: APPROVED, FLAGGED, or REJECTED. ValidationResult record.  
**Primary Actor:** System (Validation Engine) | **Secondary Actors:** Data Analyst (manual review)  
**Roles:** System (auto), readings.edit (manual override)  
**Permissions:** `readings.list`, `readings.edit`  
**Validation Rules Applied:** Spike (> 3x previous), Drop (< 0.1x previous), Zero (value = 0), Negative, Threshold (outside expected range), Sequence gap (missing previous), Duplicate timestamp  
**Decision Points:** All checks pass? → Auto-approve. Any check fails? → Flag for review. Critical failure → Reject.  
**Exception Paths:** Validation engine down → Queue readings, process when available. Missing previous reading → Use estimated reading for comparison.  
**Retry Strategy:** N/A (stateless validation)  
**Rollback Strategy:** N/A (readings can be re-validated)  
**SLA:** < 1 second per reading | **KPI:** Auto-approval rate > 95%  
**Business Rules:** Spike threshold configurable per meter type. Drop threshold configurable per area. Zero consumption valid if meter in maintenance.  
**Dependencies:** P-011/P-012/P-013 (Reading must exist), Validation rules configured  
**Related APIs:** POST /api/readings/:id/approve, POST /api/readings/:id/reject  
**DB Tables:** Reading (status), ValidationResult, ValidationRule  
**Events:** ReadingValidated, ReadingFlagged, ReadingRejected  
**Risks:** False positives cause manual workload. False negatives cause billing errors.  
**Performance:** 10,000 validations/minute | **Availability:** 99.99%  
**Implementation Priority:** P0 | **Wave:** 01 | **Sessions:** 4

---

## P-015: Reading Approval

**Business Purpose:** Approve a flagged reading after manual review, confirming it for use in billing.  
**Business Owner:** Meter Data Management  
**Priority:** P0 — Critical  
**Preconditions:** Reading must be in FLAGGED status  
**Inputs:** Reading ID, Approval reason, Reviewer notes, Corrected value (if adjustment needed)  
**Outputs:** Reading status → APPROVED  
**Primary Actor:** Data Analyst | **Secondary Actors:** System (auto-approve for trusted sources)  
**Permissions:** `readings.edit`  
**SLA:** < 24 hours for flagged readings | **KPI:** Approval turnaround < 8 hours  
**Sessions:** 2

---

## P-016: Reading Rejection

**Business Purpose:** Reject a reading that fails validation and cannot be corrected, requiring a new reading.  
**Business Owner:** Meter Data Management  
**Priority:** P0 — Critical  
**Preconditions:** Reading fails validation and manual review confirms error  
**Inputs:** Reading ID, Rejection reason  
**Outputs:** Reading status → REJECTED. New reading request created.  
**Primary Actor:** Data Analyst | **Secondary Actors:** Field Technician (re-read)  
**SLA:** < 24 hours | **Sessions:** 1

---

## P-017: Reading Correction

**Business Purpose:** Correct an erroneous reading that was already approved or billed, with full audit trail.  
**Business Owner:** Meter Data Management  
**Priority:** P1 — High  
**Trigger:** Billing dispute, Field re-read confirms error, System audit detects anomaly  
**Preconditions:** Original reading must exist. Correction must be approved by supervisor if already billed.  
**Inputs:** Reading ID, Corrected value, Correction reason, Supervisor approval (if billed)  
**Outputs:** New corrected Reading record. Original reading preserved (immutable). Adjustment entry created.  
**Primary Actor:** Data Analyst (supervisor) | **Permissions:** readings.edit (requires supervisor for billed readings)  
**Business Rules:** Original reading never deleted (append-only). Billed reading correction triggers billing adjustment.  
**Dependencies:** P-015 (Approval for billed corrections)  
**SLA:** < 5 business days | **Sessions:** 3

---

## P-018: Consumption Calculation

**Business Purpose:** Calculate consumption for a meter by subtracting previous reading from current reading.  
**Business Owner:** Billing Director  
**Priority:** P0 — Critical | **Criticality:** Core billing input  
**Trigger:** Bill cycle execution (P-031), On-demand calculation  
**Preconditions:** Current and previous readings must be APPROVED. Meter configuration (CT/PT ratio) must be set.  
**Inputs:** Meter ID, Period start/end, Current reading, Previous reading, CT/PT ratio  
**Outputs:** Calculated consumption (adjusted by CT/PT ratio)  
**Primary Actor:** System (Calculation Engine)  
**Validation Rules:** Zero consumption → Valid (no usage). Negative consumption → Flag for review.  
**Decision Points:** Water difference mode? → report_only (log only), warn (notify), block (prevent billing).  
**Exception Paths:** Missing previous reading → Estimate based on average daily consumption.  
**SLA:** < 2 seconds per meter | **KPI:** Calculation accuracy 100%  
**Sessions:** 3

---

## P-019: Abnormal Consumption Detection

**Business Purpose:** Detect abnormal consumption patterns that may indicate leaks, theft, or meter malfunction.  
**Business Owner:** Revenue Assurance Director  
**Priority:** P1 — High  
**Trigger:** Consumption calculated (P-018), Continuous monitoring, Scheduled analysis  
**Inputs:** Meter ID, Current consumption, Historical consumption (12 months), Seasonal factors, Area average  
**Outputs:** Alert generated if abnormal pattern detected. Meter flagged for review.  
**Primary Actor:** AI Model (Anomaly Detection) | **Secondary Actors:** Revenue Analyst  
**AI Agents:** Consumption Anomaly Model  
**Validation:** Compare against statistical model (Z-score, moving average, seasonal decomposition).  
**Decision Points:** Z-score > 3? → High confidence alert. Z-score 2-3? → Low confidence flag for review.  
**Sessions:** 4

---

## P-020: Leak Detection

**Business Purpose:** Detect continuous water flow that indicates a leak on the customer's side of the meter.  
**Business Owner:** Revenue Assurance Director / Water Operations  
**Priority:** P1 — High  
**Trigger:** Minimum flow detected for extended period (configurable: typically > 2 hours continuous)  
**Inputs:** Meter ID, Flow rate (calculated from readings), Duration of continuous flow, Time of day  
**Outputs:** Leak alert generated. Customer notification triggered. | **AI Agents:** Leak Detection Model  
**SLA:** Alert within 15 minutes of detection | **KPI:** Leak detection accuracy > 90%  
**Sessions:** 3
