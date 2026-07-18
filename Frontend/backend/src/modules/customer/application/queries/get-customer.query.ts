import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CustomerRepository } from "../../infrastructure/persistence/customer.repository";

export class GetCustomerQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetCustomerQuery)
export class GetCustomerHandler implements IQueryHandler<GetCustomerQuery> {
  constructor(private readonly repo: CustomerRepository) {}

  async execute(query: GetCustomerQuery) {
    return this.repo.findById(query.id);
  }
}
