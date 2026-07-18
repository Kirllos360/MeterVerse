import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CustomerRepository } from "../../infrastructure/persistence/customer.repository";
import { CustomerEntity } from "../../domain/entities/customer.entity";

export class CreateCustomerCommand {
  constructor(
    public readonly code: string,
    public readonly nameAr: string,
    public readonly phone: string,
    public readonly projectId: string,
    public readonly nameEn?: string,
    public readonly email?: string,
    public readonly type?: string,
  ) {}
}

@CommandHandler(CreateCustomerCommand)
export class CreateCustomerHandler implements ICommandHandler<CreateCustomerCommand> {
  constructor(private readonly repo: CustomerRepository) {}

  async execute(command: CreateCustomerCommand) {
    const customer = await this.repo.create({
      code: command.code,
      nameAr: command.nameAr,
      nameEn: command.nameEn || null,
      phone: command.phone,
      email: command.email || null,
      type: command.type || "residential",
      status: "active",
      balance: 0,
      address: null,
      projectId: command.projectId,
      unitId: null,
    });
    return customer;
  }
}
