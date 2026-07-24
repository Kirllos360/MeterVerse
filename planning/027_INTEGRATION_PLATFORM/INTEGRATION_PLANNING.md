# Integration Platform — Planning

## Current Integrations
| Integration | Status | Type |
|:-----------:|:------:|:----:|
| SYMBIOT (meter data) | ⏳ Planning | External API |
| Email (SMTP) | ⏳ Partial | Outbound |
| SMS (Twilio) | ❌ Not started | Outbound |
| Push (Firebase) | ❌ Not started | Outbound |

## Planned Integrations

### API Gateway
| Feature | Description | Effort |
|---------|-------------|:------:|
| API Key Management | Generate/revoke API keys for third parties | 2 sessions |
| Rate Limiting per Key | Configurable limits per API consumer | 1 session |
| Webhook Delivery | Outbound webhooks for events | 3 sessions |
| Webhook Retry | Automatic retry with backoff | 1 session |
| Webhook Log | Delivery history with status | 1 session |

### Import/Export Engine
| Format | Import | Export | Priority |
|:------:|:------:|:------:|:--------:|
| CSV | ✅ Planned | ✅ Existing | P1 |
| Excel | ⏳ Planned | ⏳ Planned | P1 |
| JSON | ✅ Existing | ✅ Existing | P2 |
| XML | ❌ Not planned | ❌ Not planned | P3 |
| PDF | ❌ Not planned | ⏳ Planned (T201) | P1 |

### Enterprise Systems (Future)
| System | Type | Priority |
|:-------|:----:|:--------:|
| ERP (SAP/Oracle) | Financial sync | P2 |
| CRM (Salesforce) | Customer sync | P2 |
| GIS (Geographic) | Meter location | P3 |
| SCADA | Real-time meter data | P3 |
| Accounting (QuickBooks) | Journal entries | P2 |
| Identity Provider (SSO) | Auth integration | P2 |
