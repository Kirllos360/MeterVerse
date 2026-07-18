# ECG-01R-014 — Build Event Consumers

**Platform:** Event Platform (PZ-007)  
**Priority:** P2  
**Estimated Effort:** 3-5 days  
**Depends on:** None  

## Objective

Create subscribers for the 35 registered event types that are currently published but never consumed.

## Scope

### Create event consumers

**Critical events (implement first):**

1. **`invoice.generated`** — Trigger PDF generation, send notification to customer
   - Create `InvoiceEventConsumer` → subscribe to `'invoice.generated'`
   - Call `invoiceTemplateService.generatePdf()` asynchronously
   - Send notification via `NotificationsService`

2. **`payment.received`** — Update ledger, send receipt
   - Create `PaymentEventConsumer` → subscribe to `'payment.received'`
   - Generate payment receipt PDF
   - Send confirmation notification

3. **`meter.assigned`** — Log assignment, notify installer
   - Create `MeterEventConsumer`
   - Create notification for field technician

4. **`auth.login.failure`** — Track for security analysis, trigger lockout rules
   - Create `SecurityEventConsumer` → subscribe to `'auth.login.failure'`
   - Feed into progressive lockout logic

**Batch events (implement second):**

5. **`sync.completed`** — Notify stakeholders, log summary
6. **`reading.created`** — Trigger review queue check, anomaly detection (if not already done inline)

### Register subscribers

In each consumer file, use `EventBusService.subscribe()` in `onModuleInit()`:
```typescript
@Injectable()
export class InvoiceEventConsumer implements OnModuleInit {
  constructor(private readonly eventBus: EventBusService) {}
  
  onModuleInit(): void {
    this.eventBus.subscribe('invoice.generated', async (event) => {
      // handle event
    });
  }
}
```

### Add automatic retry with exponential backoff

In `EventBusService.subscribe()`, add an option for automatic retry:
```typescript
subscribe(eventType, handler, {
  retry: true,
  maxRetries: 3,
  backoffMs: 1000,  // doubles each retry
  onFinalFailure: (event, error) => this.persistenceService.deadLetter(event, error.message),
})
```

## Verification

- `npx tsc --noEmit` — 0 errors
- All 35 event types have at least one subscriber
- Invoice generation triggers async PDF render
- Payment receipt triggers notification
- Dead letter queue receives events that fail after max retries
