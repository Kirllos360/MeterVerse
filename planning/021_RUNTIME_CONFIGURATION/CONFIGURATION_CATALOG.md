# Runtime Configuration Catalog

## Global Settings (System-wide)
| Setting | Type | Default | UI | Description |
|---------|:----:|:-------:|:--:|-------------|
| system.name | string | MeterVerse | ✅ | Platform display name |
| system.timezone | string | UTC | ✅ | Default timezone |
| system.dateFormat | string | YYYY-MM-DD | ✅ | Date display format |
| system.numberFormat | string | #,##0.00 | ✅ | Number display format |
| system.language | enum | en | ✅ | Default language (en/ar) |
| system.currency | string | EGP | ✅ | Default currency |
| system.logo | file | — | ✅ | Company logo for branding |
| system.favicon | file | — | ✅ | Browser tab icon |

## Organization Settings
| Setting | Type | Default | UI | Description |
|---------|:----:|:-------:|:--:|-------------|
| org.name | string | — | ✅ | Organization display name |
| org.taxEnabled | boolean | false | ✅ | Enable tax calculation |
| org.taxRate | decimal | 0.14 | ✅ | Default tax rate (14%) |
| org.holidayCalendar | reference | — | ✅ | Holiday calendar for due dates |

## Security Settings
| Setting | Type | Default | UI | Description |
|---------|:----:|:-------:|:--:|-------------|
| auth.passwordMinLength | int | 8 | ✅ | Minimum password length |
| auth.passwordUppercase | boolean | true | ✅ | Require uppercase |
| auth.passwordLowercase | boolean | true | ✅ | Require lowercase |
| auth.passwordNumber | boolean | true | ✅ | Require number |
| auth.passwordSpecial | boolean | true | ✅ | Require special char |
| auth.lockoutAttempts | int | 5 | ✅ | Lockout threshold |
| auth.lockoutDuration | int | 15 | ✅ | Lockout duration (minutes) |
| auth.sessionTimeout | int | 240 | ✅ | Admin session (minutes) |
| auth.mfaRequired | boolean | false | ✅ | Force MFA for all users |
| auth.mfaEnforceRoles | array | [super_admin] | ✅ | Roles that must use MFA |

## Billing Settings
| Setting | Type | Default | UI | Description |
|---------|:----:|:-------:|:--:|-------------|
| billing.dueDateDays | int | 30 | ✅ | Days until invoice due |
| billing.lateFeePercent | decimal | 0 | ✅ | Late fee percentage |
| billing.lateFeeGraceDays | int | 0 | ✅ | Grace period before late fee |
| billing.invoicePrefix | string | INV | ✅ | Invoice number prefix |
| billing.autoGenerate | boolean | false | ✅ | Auto-generate invoices |

## Notification Settings
| Setting | Type | Default | UI | Description |
|---------|:----:|:-------:|:--:|-------------|
| notify.emailEnabled | boolean | false | ✅ | Enable email sending |
| notify.smsEnabled | boolean | false | ✅ | Enable SMS sending |
| notify.pushEnabled | boolean | false | ✅ | Enable push notifications |
| notify.rateLimitPerMinute | int | 60 | ✅ | Max notifications per minute |

## Feature Flags
| Flag | Default | Description |
|:----:|:-------:|-------------|
| billing.enabled | true | Enable billing module |
| ai.enabled | false | Enable AI features |
| mobile.enabled | false | Enable mobile API |
| multiArea.enabled | false | Enable multi-area mode |
| reports.enabled | true | Enable reporting module |
