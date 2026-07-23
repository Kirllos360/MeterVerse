# Runtime Dependency Map

**Purpose:** Document how runtime services depend on each other.

```
Workspace Engine
  └── Registry
       └── Runtime Kernel
            ├── Widgets
            │    └── Context
            └── Permissions
                 └── API
                      └── BFF
                           └── Backend
                                └── Database
```

### Current Runtime Stack

| Service | Depends On | Depended By | Status |
|---------|-----------|------------|--------|
| auth-engine | prisma, bcrypt, jwt | All routes | ✅ Live |
| notification-engine | prisma | All routes | ✅ Live |
| email-engine | nodemailer, prisma | notification-engine | ✅ Live |
| billing-engine | prisma | invoices route | ✅ Live |
| validation-engine | prisma | readings route | ✅ Live |
| alert-engine | prisma | monitoring | ✅ Live |
| kpi-engine | prisma | Dashboard | ✅ Live |
| monitor (middleware) | prisma | All routes | ✅ Live |
