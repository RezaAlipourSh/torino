import { SetMetadata } from "@nestjs/common";
import { Roles } from "../enum/role.enum";

export const ROLE_KEY = "ROLES";
export const RoleAccess = (...roles: Roles[]) => SetMetadata(ROLE_KEY, roles);
