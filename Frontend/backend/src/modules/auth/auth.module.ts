import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./interfaces/controllers/auth.controller";
import { LoginCommandHandler } from "./application/commands/login.command";
import { AuthService } from "./domain/auth.service";
import { JwtStrategy } from "./infrastructure/guards/jwt.strategy";
import { AuthRepository } from "./infrastructure/persistence/auth.repository";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "mv-secret-key-change-in-production",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [AuthController],
  providers: [LoginCommandHandler, AuthService, JwtStrategy, AuthRepository],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
