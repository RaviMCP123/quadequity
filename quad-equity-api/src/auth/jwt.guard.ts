import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";

@Injectable()
export class AccountActiveGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];

    const token = authHeader.split(" ")[1];

    const user = request.user;
    if (!request.user) {
      throw new ForbiddenException("Access denied");
    }
    const userAccountActive = await this.userService.getActiveUser(user.id);
    if (!userAccountActive) {
      throw new ForbiddenException(
        "Your account has been deactivated by admin.",
      );
    }
    const userAccountActiveToken =
      await this.userService.userAccountActiveToken(token);
    if (!userAccountActiveToken) {
      throw new ForbiddenException(
        "Your account has been logged on other devices.",
      );
    }

    return true;
  }
}
