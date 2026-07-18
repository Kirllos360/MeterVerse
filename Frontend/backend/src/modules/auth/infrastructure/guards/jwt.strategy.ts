import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthRepository } from "../persistence/auth.repository";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authRepo: AuthRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || "mv-secret-key-change-in-production",
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.authRepo.findById(payload.sub);
    if (!user || !user.active) throw new UnauthorizedException("User not found");
    return { id: user.id, email: user.email, role: user.role, nameAr: user.nameAr };
  }
}
