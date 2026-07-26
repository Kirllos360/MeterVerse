# Enterprise Process Catalogs

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/PROCESS_ENTERPRISE_CATALOGS.md`

---

## 1. Business Process Catalog

Processes that directly impact business operations, customer experience, and revenue.

| ID | Process | Business Value | Customer Facing | Revenue Impact | 
|----|---------|---------------|-----------------|----------------|
| P-001 | Meter Registration | Inventory accuracy | No | Indirect |
| P-002 | Meter Assignment | Service delivery | Yes | Direct |
| P-004 | Meter Disconnect | Revenue protection | Yes | Direct |
| P-011 | Reading Import | Data completeness | No | Critical |
| P-014 | Reading Validation | Billing accuracy | No | Critical |
| P-018 | Consumption Calculation | Billing accuracy | No | Critical |
| P-021 | Customer Registration | Customer acquisition | Yes | Direct |
| P-031 | Bill Cycle Execution | Revenue generation | No | Critical |
| P-033 | Invoice Generation | Revenue generation | Yes | Critical |
| P-036 | Invoice Distribution | Customer communication | Yes | Direct |
| P-045 | Payment Registration | Cash collection | Yes | Critical |
| P-046 | Payment Allocation | Cash application | No | Critical |
| P-051 | Collection Assignment | Debt recovery | Yes | Direct |
| P-059 | Month Close | Financial reporting | No | Critical |
| P-073 | Login | System access | Yes | Indirect |
| P-078 | User Registration | Team onboarding | No | Indirect |

## 2. Technical Process Catalog

Processes that maintain system health, performance, and reliability.

| ID | Process | Technical Domain | Automation | Criticality |
|----|---------|-----------------|------------|-------------|
| P-063 | Gateway Registration | Communications | Auto | Medium |
| P-066 | Synchronization | Data Platform | Auto | Critical |
| P-082 | Configuration Update | System Config | Manual | High |
| P-084 | Feature Toggle | System Config | Manual | Medium |
| P-085 | License Validation | Platform | Auto | Critical |
| P-086 | Health Check | Monitoring | Auto | Critical |
| P-087 | Monitoring | Monitoring | Auto | High |
| P-088 | Backup Creation | Data Protection | Auto | Critical |
| P-089 | Restore | Data Protection | Manual | Critical |
| P-090 | Disaster Recovery | Platform | Semi-auto | Critical |
| P-106 | Webhook Processing | Integration | Auto | High |
| P-107 | Queue Processing | Platform | Auto | Critical |
| P-108 | Scheduler Execution | Platform | Auto | High |
| P-120 | API Access | Security | Auto | Critical |

## 3. Financial Process Catalog

Processes with direct financial impact or accounting implications.

| ID | Process | Financial Impact | GL Impact | Audit Required |
|----|---------|-----------------|-----------|----------------|
| P-033 | Invoice Generation | Revenue recognition | AR Credit | Yes |
| P-045 | Payment Registration | Cash receipt | Cash Debit | Yes |
| P-046 | Payment Allocation | AR reduction | AR Debit | Yes |
| P-048 | Refund | Cash outflow | Cash Credit | Yes |
| P-049 | Credit Note | Revenue reduction | AR Credit | Yes |
| P-050 | Debit Note | Revenue increase | AR Debit | Yes |
| P-055 | Customer Ledger Update | Balance tracking | No | Yes |
| P-056 | GL Posting | Financial records | Yes | Yes |
| P-057 | Journal Posting | Financial records | Yes | Yes |
| P-058 | Bank Reconciliation | Cash accuracy | Yes | Yes |
| P-059 | Month Close | Period-end close | Yes | Yes |
| P-060 | Year Close | Year-end close | Yes | Yes |

## 4. Security Process Catalog

Processes related to authentication, authorization, data protection, and compliance.

| ID | Process | Security Domain | Compliance Standard | Audit Frequency |
|----|---------|-----------------|-------------------|----------------|
| P-073 | Login | Authentication | SOC 2, ISO 27001 | Continuous |
| P-074 | Logout | Session Mgmt | SOC 2 | Continuous |
| P-075 | Password Reset | Identity Mgmt | SOC 2, NIST | Per event |
| P-076 | MFA Enrollment | Authentication | SOC 2 | Per event |
| P-077 | Session Recovery | Session Mgmt | SOC 2 | Per event |
| P-080 | Role Assignment | Authorization | SOC 2, SOX | Per event |
| P-081 | Permission Assignment | Authorization | SOC 2, SOX | Per event |
| P-085 | License Validation | Compliance | Per vendor | Daily |
| P-098 | Alert Generation | Monitoring | SOC 2 | Continuous |
| P-119 | Audit Export | Compliance | SOC 2, SOX | Monthly |
| P-120 | API Access | API Security | SOC 2 | Continuous |

## 5. Monitoring Process Catalog

Processes that observe, measure, and report on system health and performance.

| ID | Process | Metric | Collection Method | Retention |
|----|---------|--------|-------------------|-----------|
| P-086 | Health Check | Component status | Polling (30s) | 90 days |
| P-087 | Monitoring | CPU, memory, disk, API latency | Agent + Prometheus | 90 days |
| P-098 | Alert Generation | Threshold breaches | Event-driven | 1 year |
| P-099 | Alert Resolution | MTTA, MTTR | Event-driven | 1 year |
| P-100 | Analytics Report | Business KPIs | Scheduled | Per report |
| P-109 | Incident Creation | Incident count | Manual + auto | 2 years |
| P-110 | Incident Resolution | Resolution time | Manual | 2 years |

## 6. Integration Process Catalog

Processes that connect MeterVerse with external systems.

| ID | Process | External System | Protocol | Direction | Frequency |
|----|---------|----------------|----------|-----------|-----------|
| P-101 | ERP Sync | SAP/Oracle/Dynamics | REST/SFTP/SOAP | Bidirectional | Hourly |
| P-102 | CRM Sync | Salesforce/Dynamics | REST | Bidirectional | Hourly |
| P-103 | GIS Sync | ArcGIS/QGIS | REST/SFTP | To MeterVerse | Daily |
| P-104 | SCADA Sync | SCADA/RTU | OPC/Modbus | To MeterVerse | Real-time |
| P-105 | IoT Sync | IoT Devices | MQTT/CoAP/LwM2M | Bidirectional | Real-time |
| P-106 | Webhook Processing | External Apps | HTTP(S) | Outbound | Event-driven |
| P-011 | Reading Import | AMI/MDM | REST/SFTP/DLMS | Inbound | Real-time |
