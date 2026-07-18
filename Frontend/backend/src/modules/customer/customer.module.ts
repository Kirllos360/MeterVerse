import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CustomerController } from "./interfaces/controllers/customer.controller";
import { GetCustomersHandler } from "./application/queries/get-customers.query";
import { GetCustomerHandler } from "./application/queries/get-customer.query";
import { CreateCustomerHandler } from "./application/commands/create-customer.command";
import { UpdateCustomerHandler } from "./application/commands/update-customer.command";
import { CustomerRepository } from "./infrastructure/persistence/customer.repository";

@Module({
  imports: [CqrsModule],
  controllers: [CustomerController],
  providers: [
    GetCustomersHandler, GetCustomerHandler,
    CreateCustomerHandler, UpdateCustomerHandler,
    CustomerRepository,
  ],
  exports: [CustomerRepository],
})
export class CustomerModule {}
