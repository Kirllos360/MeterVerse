import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AuthGuard } from "@nestjs/passport";
import { LoginDto } from "../dto/login.dto";
import { LoginCommand } from "../../application/commands/login.command";

@Controller("auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
  }

  @Post("register")
  async register(@Body() dto: any) {
    // Will implement registration with CreateUserCommand
    return { message: "Registration coming soon" };
  }

  @Post("refresh")
  @UseGuards(AuthGuard("jwt"))
  async refresh() {
    return { message: "Token refresh coming soon" };
  }
}
