import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { MeterRepository } from "../../infrastructure/persistence/meter.repository";

@Controller("meters")
@UseGuards(AuthGuard("jwt"))
export class MeterController {
  constructor(private readonly repo: MeterRepository) {}

  @Get() async findAll(@Query("projectId") projectId?: string, @Query("type") type?: string, @Query("status") status?: string) {
    return this.repo.findAll(projectId, type, status);
  }
  @Get(":id") async findOne(@Param("id") id: string) { return this.repo.findById(id); }
  @Post() async create(@Body() dto: any) { return this.repo.create(dto); }
  @Patch(":id") async update(@Param("id") id: string, @Body() dto: any) { return this.repo.update(id, dto); }
}
