# Operational Process Specifications (P-061 to P-072)

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/03_OPERATIONAL_PROCESSES/sim_gateway/P-061_to_P-072_Operational.md`

---

## P-061: SIM Assignment

**Business Purpose:** Assign a SIM card to a meter for cellular communication.  
**Owner:** Communication Manager | **Priority:** P0 — Critical  
**Preconditions:** SIM must be AVAILABLE status. Meter must be in ASSIGNED or INSTALLED state.  
**Inputs:** SIM ICCID, Meter ID, APN settings (optional)  
**Outputs:** SIMAssignment created. SIM status → ASSIGNED. Meter.SIM updated.  
**Validation:** SIM not already assigned. Meter not already bound to active SIM.  
**Exception:** SIM in cooldown → Warn but allow. | **Related APIs:** POST /api/sim/:id/assign  
**Sessions:** 2

---

## P-062: SIM Replacement

**Business Purpose:** Replace a faulty or damaged SIM card on an active meter. | **Priority:** P1  
**Sessions:** 2

---

## P-063: Gateway Registration

**Business Purpose:** Register a communication gateway (concentrator, data logger) in the system. | **Priority:** P1  
**Sessions:** 2

---

## P-064: Gateway Connection

**Business Purpose:** Establish communication link between gateway and platform. | **Priority:** P1  
**Sessions:** 2

---

## P-065: Communication Test

**Business Purpose:** Test end-to-end communication from meter → gateway → platform. | **Priority:** P1  
**Sessions:** 1

---

## P-066: Synchronization Job

**Business Purpose:** Replicate data between MeterVerse areas (October, New Cairo, SODIC) or external systems.  
**Owner:** Platform Director | **Priority:** P0 — Critical  
**Trigger:** Scheduled (every 15min), Event-driven (data change), Manual  
**Preconditions:** Source and target connections active. No conflicting sync in progress.  
**Inputs:** Sync type (meter/reading/customer/invoice), Source area, Target area, Last sync timestamp  
**Outputs:** SyncJob record. Target area updated with changes. Conflict log generated if applicable.  
**Primary Actor:** System (Sync Engine) | **Validation:** Idempotent — re-running produces same result.  
**Decision Points:** Conflict detected? → Auto-resolve (last-writer-wins) with audit.  
**Business Rules:** Each area is source of truth for its own meters. Billing data is centralized.  
**Sessions:** 4

---

## P-067: Conflict Resolution

**Business Purpose:** Review and resolve data conflicts detected during synchronization. | **Priority:** P1  
**Trigger:** Sync detects conflicting changes in two areas  
**Primary Actor:** Platform Administrator (manual resolution) | **Permissions:** admin.*  
**Sessions:** 2

---

## P-068: Area Synchronization

**Business Purpose:** Full bi-directional sync between all areas to maintain data consistency. | **Priority:** P0  
**Sessions:** 4

---

## P-069: Notification Delivery

**Business Purpose:** Deliver a notification to a user or system through configured channels.  
**Owner:** Communications Director | **Priority:** P0 — Critical  
**Trigger:** Any system event requiring user notification  
**Inputs:** Recipient, Channel (in_app/email/sms/push), Title, Body, Template (optional)  
**Outputs:** Notification record. Channel-specific delivery (EmailLog, SmsLog, PushNotification).  
**Primary Actor:** System (Notification Engine) | **Retry:** 3 attempts with 5min delay  
**Sessions:** 3

---

## P-070: Email Delivery

**Business Purpose:** Send transactional email (invoice, notification, alert). | **Priority:** P0  
**Preconditions:** SMTP configured. Email template exists.  
**Sessions:** 2

---

## P-071: SMS Delivery

**Business Purpose:** Send transactional SMS (payment reminder, disconnect warning). | **Priority:** P0  
**Preconditions:** SMS gateway configured. | **Sessions:** 2

---

## P-072: Push Notification

**Business Purpose:** Send push notification to mobile app users. | **Priority:** P0  
**Preconditions:** Firebase/APNS configured. Device token registered. | **Sessions:** 2
