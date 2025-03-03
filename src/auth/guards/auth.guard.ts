import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard as PAuthGuard } from "@nestjs/passport";

@Injectable()
export class AuthGuard extends PAuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const isValid = await super.canActivate(context);
    if (!isValid) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const roles =
      this.reflector.get<string[]>("roles", context.getHandler()) ||
      this.reflector.get<string[]>("roles", context.getClass());
    if (!roles) {
      return true;
    }

    const hasRole = () =>
      user.roles.some((role: string) => roles.includes(role));
    if (!user || !user.roles || !hasRole()) {
      throw new ForbiddenException("You do not have permission (Roles)");
    }

    return true;
  }
}
