# Operational Readiness Review

| Subsystem | Admin Configurable | Customer Configurable | Needs Code | Support Troubleshoot | Operations Monitor | QA Testable | Documented |
|:----------|:------------------:|:--------------------:|:----------:|:-------------------:|:-----------------:|:-----------:|:----------:|
| Auth | ⚠️ Partial | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tariff | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Billing | ⚠️ Partial | ❌ | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Payments | ⚠️ Partial | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Workflow | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Configuration | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ⚠️ |
| Integration | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reports | ⚠️ Partial | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Notifications | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Admin Platform | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

**Overall Operational Readiness: 45%**
**Gap:** Most subsystems require developer intervention to configure. Target is 90%+ admin-configurable.
**Recommended:** Prioritize Configuration Studio (028) to close the gap.
