import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { MeterController } from "./interfaces/controllers/meter.controller";
import { MeterRepository } from "./infrastructure/persistence/meter.repository";

@Module({
  imports: [CqrsModule],
  controllers: [MeterController],
  providers: [MeterRepository],
})
export class MeterModule {}
