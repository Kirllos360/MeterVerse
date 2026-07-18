import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateCustomerDto } from "../dto/create-customer.dto";
import { CreateCustomerCommand } from "../../application/commands/create-customer.command";
import { UpdateCustomerCommand } from "../../application/commands/update-customer.command";
import { GetCustomersQuery } from "../../application/queries/get-customers.query";
import { GetCustomerQuery } from "../../application/queries/get-customer.query";

@Controller("customers")
@UseGuards(AuthGuard("jwt"))
export class CustomerController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  async findAll(@Query("projectId") projectId?: string, @Query("search") search?: string) {
    return this.queryBus.execute(new GetCustomersQuery(projectId, search));
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.queryBus.execute(new GetCustomerQuery(id));
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    return this.commandBus.execute(new CreateCustomerCommand(dto.code, dto.nameAr, dto.phone, dto.projectId, dto.nameEn, dto.email, dto.type));
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: any) {
    return this.commandBus.execute(new UpdateCustomerCommand(id, dto));
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"))
  async delete(@Param("id") id: string) {
    // Add authorization check for admin only
    return { message: "Delete coming soon" };
  }
}
