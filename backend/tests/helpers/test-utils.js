import { prisma } from './mock-prisma.js';

export const mockData = {
  customer: () => ({
    PkID: 1,
    CustomerID: 'CUST-001',
    Name: 'Test Customer',
    Status: 'Active',
    AreaFk: 1,
    OrganizationFk: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  meter: () => ({
    PkID: 1,
    MeterID: 'MTR-001',
    MeterType: 'Electricity',
    Status: 'Active',
    AreaFk: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  reading: () => ({
    PkID: 1,
    MeterFk: 1,
    ReadingValue: 1500.5,
    ReadingDate: new Date(),
    Source: 'Manual',
    Status: 'Validated',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  user: () => ({
    PkID: 1,
    Email: 'admin@meterverse.com',
    Name: 'Admin User',
    PasswordHash: '$2a$10$hashedpassword',
    Status: 'Active',
    RoleFk: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  invoice: () => ({
    PkID: 1,
    InvoiceNumber: 'INV-2026-0001',
    CustomerFk: 1,
    Status: 'Draft',
    TotalAmount: 1250.00,
    DueDate: new Date('2026-08-15'),
    PeriodStart: new Date('2026-07-01'),
    PeriodEnd: new Date('2026-07-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  tariff: () => ({
    PkID: 1,
    Name: 'Standard Electricity Rate',
    Type: 'Electricity',
    Status: 'Active',
    Rates: [{ tier: 1, rate: 0.85 }],
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  auditEntry: () => ({
    PkID: 1,
    Actor: 'admin@meterverse.com',
    Action: 'user.login',
    Resource: '/api/auth/login',
    Status: 'success',
    Duration: 45,
    IP: '127.0.0.1',
    Severity: 'info',
    createdAt: new Date(),
  }),

  notificationTemplate: () => ({
    PkID: 1,
    Key: 'invoice.generated',
    Type: 'in_app',
    Subject: 'New Invoice',
    Body: 'Invoice {INVOICE_NUMBER} has been generated for {AMOUNT} EGP',
    Variables: ['INVOICE_NUMBER', 'AMOUNT'],
    Status: 'Active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};
