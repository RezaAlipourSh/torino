import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { ROLE_KEY } from "src/common/decorator/role.decorator";
import { Roles } from "src/common/enum/role.enum";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length == 0) return true;

    const request: Request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const userRole = user?.role ?? Roles.User;
    if (user.role === Roles.Admin) return true;
    if (requiredRoles.includes(userRole as Roles)) return true;
    throw new ForbiddenException("نیاز به مجوز دسترسی");
  }
}
