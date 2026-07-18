import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthRepository } from "../infrastructure/persistence/auth.repository";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly authRepo: AuthRepository, private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.authRepo.findByEmail(email);
    if (!user || !user.active) throw new UnauthorizedException("Invalid credentials");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");
    return { id: user.id, email: user.email, role: user.role, nameAr: user.nameAr };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: this.jwtService.sign(payload), user };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}
