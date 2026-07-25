# Enterprise Process Library

## Customer Lifecycle
| Step | Status | Endpoint | File |
|:-----|:------:|:---------|:-----|
| Create | ✅ | POST /api/customers | customers.js |
| Read | ✅ | GET /api/customers/:id | customers.js |
| Update | ✅ | PUT /api/customers/:id | customers.js |
| Archive (Soft Delete) | ✅ | DELETE /api/customers/:id | customers.js |
| Restore | ✅ | POST /api/customers/:id/restore | customers.js |
| Search | ✅ | GET /api/customers?search= | customers.js |
| Export | ✅ | GET /api/customers/export | customers.js |
| Stats | ✅ | GET /api/customers/stats | customers.js |

## Meter Lifecycle
| Step | Status | Endpoint | File |
|:-----|:------:|:---------|:-----|
| Create | ✅ | POST /api/meters | meters.js |
| Read | ✅ | GET /api/meters/:id | meters.js |
| Update | ✅ | PUT /api/meters/:id | meters.js |
| Terminate | ✅ | POST /api/meters/:id/terminate | meters.js |
| Archive | ✅ | DELETE /api/meters/:id | meters.js |
| Replacement | ❌ | POST /api/meters/:id/replace | NOT IMPLEMENTED |
| Disconnection | ❌ | POST /api/meters/:id/disconnect | NOT IMPLEMENTED |
| Reconnection | ❌ | POST /api/meters/:id/reconnect | NOT IMPLEMENTED |

## SIM Lifecycle
| Step | Status | Endpoint | File |
|:-----|:------:|:---------|:-----|
| Create | ✅ | POST /api/sim | sim.js |
| Read | ✅ | GET /api/sim/:id | sim.js |
| Update | ✅ | PUT /api/sim/:id | sim.js |
| Assign | ✅ | POST /api/sim/:id/assign | sim.js |
| Release | ✅ | POST /api/sim/:id/release | sim.js |
| Eligibility | ✅ | GET /api/sim/:id/eligibility | sim.js |
| Replace | ❌ | POST /api/sim/:id/replace | NOT IMPLEMENTED |

## Invoice Lifecycle
| Step | Status | Endpoint | File |
|:-----|:------:|:---------|:-----|
| Generate | ✅ | POST /api/invoices/generate | invoices.js |
| Issue | ✅ | POST /api/invoices/:id/issue | invoices.js |
| Read | ✅ | GET /api/invoices/:id | invoices.js |
| Adjustment | ✅ | POST /api/invoices/:id/adjustments | invoices.js |
| Regenerate | ✅ | POST /api/invoices/:id/regenerate | invoices.js |
| Cancel | ✅ | POST /api/invoices/:id/cancel | billing.js |
| Version History | ❌ | GET /api/invoices/:id/versions | NOT IMPLEMENTED |

## Payment Lifecycle
| Step | Status | Endpoint | File |
|:-----|:------:|:---------|:-----|
| Create | ✅ | POST /api/payments | payments.js |
| Allocate (ODF) | ✅ | POST /api/payments (auto) | payments.js |
| Reverse | ✅ | POST /api/payments/:id/reverse | payments.js |
| Refund | ✅ | POST /api/payments/:id/refund | payments.js |
| Statement | ✅ | GET /api/customers/:id/statement | payments.js |
| Aging | ✅ | GET /api/customers/:id/aging | payments.js |

## Business Process Gaps Summary
| Missing Process | Business Impact | Priority |
|:----------------|:---------------|:--------:|
| Meter Replacement | Cannot track meter swaps | 🟡 MEDIUM |
| Meter Disconnection | No service disconnect flow | 🟡 MEDIUM |
| Meter Reconnection | No service reconnect flow | 🟡 MEDIUM |
| SIM Replacement | Cannot swap SIMs on meters | 🟢 LOW |
| Invoice Version History | No audit trail for invoice changes | 🟡 MEDIUM |
| Customer Restore (was missing) | 🔴 NOW FIXED THIS SESSION | ✅ |
| Payment Refund (was missing) | 🔴 NOW FIXED THIS SESSION | ✅ |
