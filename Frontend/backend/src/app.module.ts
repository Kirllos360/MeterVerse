import { Module } from "@nestjs/common";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./infrastructure/database/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { MeterModule } from "./modules/meter/meter.module";
import { ReadingModule } from "./modules/reading/reading.module";
import { InvoiceModule } from "./modules/invoice/invoice.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { LoggerModule } from "./infrastructure/logging/logger.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    LoggerModule,
    AuthModule,
    CustomerModule,
    MeterModule,
    ReadingModule,
    InvoiceModule,
    PaymentModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
