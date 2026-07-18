import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/database/prisma.service";

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: { email: string; password: string; nameAr: string; role: string }) {
    return this.prisma.user.create({ data: data as any });
  }
}
