# Customer Onboarding Enterprise Workflow

```
Lead Capture → Verification → Meter Assignment → Contract Creation → Tariff Config → Service Activation → Welcome Notification
```

### Cross-Cutting Concerns
- **Backend:** API endpoints for each step
- **Database:** Customer, Meter, Contract, Tariff tables
- **Frontend Admin:** Customer creation form, meter assignment UI
- **Frontend User:** Status tracking dashboard
- **Notifications:** Welcome email, SMS confirmation
- **AI:** Suggested tariff based on customer profile
- **Security:** Permission checks at every mutation
- **Audit:** Full audit trail of onboarding process
