# Enterprise Automation Platform — Planning

## Automation Categories

| Category | Current | Target | Tool |
|:---------|:-------:|:------:|:----:|
| **CI/CD** | ✅ GitHub Actions | ✅ | GitHub Actions |
| **Scheduled Jobs** | ❌ None | ⏳ | cron + queue |
| **Event Bus** | ❌ None | ⏳ | RabbitMQ/Kafka |
| **Workflow Automation** | ❌ None | ⏳ | n8n/Node-RED |
| **Webhook Engine** | ❌ None | ⏳ | Custom |
| **Retry Engine** | ✅ Circuit breaker | ✅ | circuit-breaker.js |
| **Background Workers** | ❌ None | ⏳ | Bull/BullMQ |
| **Error Recovery** | ❌ None | ⏳ | Custom |

## Integration with n8n (Planned)
- n8n installed as Docker container alongside MeterVerse
- MeterVerse exposes webhook endpoints for n8n to trigger
- n8n workflows can call MeterVerse REST API
- MeterVerse can trigger n8n workflows via API
- Workflow templates: invoice overdue, meter alert, customer onboarding

## Automation Candidates (0-code)
| Process | Current State | Automation Path | Effort |
|:--------|:-------------|:----------------|:------:|
| Invoice overdue notice | Manual | n8n workflow + email | 1 day |
| Meter reading anomaly | Manual | n8n workflow + notification | 1 day |
| Customer onboarding | Manual | n8n workflow + API calls | 2 days |
| Payment receipt | Manual | Webhook → n8n → SMS/Email | 1 day |
| Daily backup | Manual | Scheduled job | 0.5 day |
