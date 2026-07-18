import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/database/prisma.service";

@Injectable()
export class MeterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId?: string, type?: string, status?: string) {
    return this.prisma.meter.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(type && { type: type as any }),
        ...(status && { status: status as any }),
      },
      include: { customer: true, readings: { take: 1, orderBy: { date: "desc" } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return this.prisma.meter.findUnique({
      where: { id },
      include: { customer: true, readings: { orderBy: { date: "desc" }, take: 20 }, simCard: true },
    });
  }

  async create(data: any) { return this.prisma.meter.create({ data }); }
  async update(id: string, data: any) { return this.prisma.meter.update({ where: { id }, data }); }
}
