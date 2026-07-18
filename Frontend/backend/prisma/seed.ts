import { PrismaClient, UserRole, MeterType, MeterStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@meterverse.com" },
    update: {},
    create: { email: "admin@meterverse.com", password: adminPassword, nameAr: "مدير النظام", nameEn: "System Admin", role: UserRole.SUPER_ADMIN, phone: "+201234567890" },
  });

  const opsPassword = await bcrypt.hash("ops123", 12);
  await prisma.user.upsert({
    where: { email: "ops@meterverse.com" },
    update: {},
    create: { email: "ops@meterverse.com", password: opsPassword, nameAr: "مشغل", nameEn: "Operator", role: UserRole.OPERATOR, phone: "+201234567891" },
  });

  // Create project
  const project = await prisma.project.upsert({
    where: { code: "OCT" },
    update: {},
    create: { code: "OCT", name: "October", area: "6th October", status: "active" },
  });

  const project2 = await prisma.project.upsert({
    where: { code: "NC" },
    update: {},
    create: { code: "NC", name: "New Cairo", area: "New Cairo", status: "active" },
  });

  // Create units
  const unit1 = await prisma.unit.create({ data: { name: "Unit 101", code: "BLD-01-101", type: "apartment", status: "occupied", projectId: project.id, area: 120 } });
  const unit2 = await prisma.unit.create({ data: { name: "Unit 102", code: "BLD-01-102", type: "apartment", status: "occupied", projectId: project.id, area: 95 } });

  // Create customers
  const c1 = await prisma.customer.create({ data: { code: "CUST-001", nameAr: "أحمد السيد", nameEn: "Ahmed El-Sayed", phone: "+201234567890", email: "ahmed@example.com", type: "residential", status: "active", balance: 1250.50, projectId: project.id, unitId: unit1.id, userId: admin.id } });
  const c2 = await prisma.customer.create({ data: { code: "CUST-002", nameAr: "محمد علي", nameEn: "Mohamed Ali", phone: "+201234567891", type: "residential", status: "active", balance: -340.25, projectId: project.id, unitId: unit2.id, userId: admin.id } });
  const c3 = await prisma.customer.create({ data: { code: "CUST-003", nameAr: "سارة خالد", nameEn: "Sara Khaled", phone: "+201234567892", email: "sara@business.com", type: "commercial", status: "active", balance: 5200.00, projectId: project2.id, userId: admin.id } });

  // Create meters
  const m1 = await prisma.meter.create({ data: { serialNumber: "MTR-4821", type: MeterType.ELECTRICITY, brand: "Iskra", status: MeterStatus.ACTIVE, location: "BLD-01-101", installationDate: new Date("2024-01-20"), lastReading: 12450, lastReadingDate: new Date("2026-06-15"), communicationType: "4G", signalQuality: 92, battery: 85, customerId: c1.id, unitId: unit1.id, projectId: project.id } });
  const m2 = await prisma.meter.create({ data: { serialNumber: "MTR-6732", type: MeterType.WATER, brand: "Itron", status: MeterStatus.ACTIVE, location: "BLD-01-101", installationDate: new Date("2024-01-20"), lastReading: 3420, lastReadingDate: new Date("2026-06-15"), customerId: c1.id, unitId: unit1.id, projectId: project.id } });
  const m3 = await prisma.meter.create({ data: { serialNumber: "MTR-3912", type: MeterType.ELECTRICITY, brand: "Iskra", status: MeterStatus.FAULTY, location: "BLD-01-102", lastReading: 8900, lastReadingDate: new Date("2026-05-28"), customerId: c2.id, unitId: unit2.id, projectId: project.id } });

  // Create readings
  await prisma.reading.create({ data: { meterId: m1.id, customerId: c1.id, previousValue: 12000, currentValue: 12450, consumption: 450, date: new Date("2026-06-15"), source: "manual", status: "APPROVED" as any, enteredById: admin.id } });
  await prisma.reading.create({ data: { meterId: m1.id, customerId: c1.id, previousValue: 11600, currentValue: 12000, consumption: 400, date: new Date("2026-05-15"), source: "manual", status: "APPROVED" as any, enteredById: admin.id } });
  await prisma.reading.create({ data: { meterId: m3.id, customerId: c2.id, previousValue: 8600, currentValue: 8900, consumption: 300, date: new Date("2026-05-28"), source: "manual", status: "SUSPICIOUS" as any, enteredById: admin.id } });

  // Create invoices
  const inv1 = await prisma.invoice.create({ data: { number: "INV-2024-001", customerId: c1.id, projectId: project.id, period: "June 2024", issueDate: new Date("2024-07-01"), dueDate: new Date("2024-07-31"), total: 450.00, paid: 450.00, outstanding: 0, status: "PAID" as any, createdById: admin.id } });
  await prisma.invoiceLine.create({ data: { invoiceId: inv1.id, description: "Electricity consumption - 450 kWh", quantity: 450, unitPrice: 1.00, total: 450.00, type: "consumption" } });

  const inv2 = await prisma.invoice.create({ data: { number: "INV-2024-002", customerId: c2.id, projectId: project.id, period: "June 2024", issueDate: new Date("2024-07-01"), dueDate: new Date("2024-07-31"), total: 340.25, paid: 0, outstanding: 340.25, status: "OVERDUE" as any, createdById: admin.id } });
  await prisma.invoiceLine.create({ data: { invoiceId: inv2.id, description: "Electricity consumption - 300 kWh", quantity: 300, unitPrice: 1.134, total: 340.25, type: "consumption" } });

  // Create payment
  await prisma.payment.create({ data: { customerId: c1.id, invoiceId: inv1.id, amount: 450.00, method: "cash", date: new Date("2024-07-15"), reference: "RCT-001", status: "COMPLETED" as any, createdById: admin.id } });

  // Create ledger entries
  await prisma.ledgerEntry.create({ data: { customerId: c1.id, date: new Date("2024-07-01"), description: "Invoice INV-2024-001", debit: 450.00, credit: 0, balance: 450.00, reference: inv1.id, category: "invoice" } });
  await prisma.ledgerEntry.create({ data: { customerId: c1.id, date: new Date("2024-07-15"), description: "Payment RCT-001", debit: 0, credit: 450.00, balance: 0, reference: "RCT-001", category: "payment" } });

  // Create tariff
  const tariff = await prisma.tariff.create({ data: { name: "Standard Electricity", type: MeterType.ELECTRICITY, chargeMode: "PER_UNIT", rate: 1.75, fixedCharge: 25, tax: 0.14, effectiveFrom: new Date("2024-01-01") } });
  await prisma.tariffSlab.create({ data: { tariffId: tariff.id, fromUsage: 0, toUsage: 200, rate: 1.25 } });
  await prisma.tariffSlab.create({ data: { tariffId: tariff.id, fromUsage: 201, toUsage: 600, rate: 1.75 } });
  await prisma.tariffSlab.create({ data: { tariffId: tariff.id, fromUsage: 601, toUsage: 999999, rate: 2.50 } });

  // Create audit log
  await prisma.auditLog.create({ data: { userId: admin.id, action: "SEED", entity: "System", entityId: "seed-001", newValue: { message: "Database seeded successfully" } } });

  console.log("✅ Seed complete");
  console.log(`   Admin: admin@meterverse.com / admin123`);
  console.log(`   Operator: ops@meterverse.com / ops123`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
