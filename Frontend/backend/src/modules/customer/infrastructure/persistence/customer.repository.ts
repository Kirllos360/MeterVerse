import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/database/prisma.service";

@Injectable()
export class CustomerRepository {
  private readonly logger = new Logger(CustomerRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId?: string, search?: string) {
    return this.prisma.customer.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(search && {
          OR: [
            { nameAr: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async findById(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: { meters: true, invoices: { take: 10, orderBy: { createdAt: "desc" } } },
    });
  }

  async create(data: {
    code: string; nameAr: string; nameEn?: string | null; phone: string; email?: string | null;
    type: string; status: string; balance: number; address?: string | null; projectId: string; unitId?: string | null;
  }) {
    return this.prisma.customer.create({ data });
  }

  async update(id: string, data: Partial<{
    nameAr: string; nameEn: string; phone: string; email: string; status: string; address: string; unitId: string;
  }>) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }
}
