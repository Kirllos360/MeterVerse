import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AuthService } from "../../domain/auth.service";

export class LoginCommand {
  constructor(public readonly email: string, public readonly password: string) {}
}

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: LoginCommand) {
    return this.authService.login(command.email, command.password);
  }
}
