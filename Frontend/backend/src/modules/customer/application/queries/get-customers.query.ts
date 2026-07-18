import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CustomerRepository } from "../../infrastructure/persistence/customer.repository";

export class GetCustomersQuery {
  constructor(public readonly projectId?: string, public readonly search?: string) {}
}

@QueryHandler(GetCustomersQuery)
export class GetCustomersHandler implements IQueryHandler<GetCustomersQuery> {
  constructor(private readonly repo: CustomerRepository) {}

  async execute(query: GetCustomersQuery) {
    return this.repo.findAll(query.projectId, query.search);
  }
}
