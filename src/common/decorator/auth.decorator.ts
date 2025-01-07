import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "src/module/auth/guard/auth.guard";
import { RoleGuard } from "src/module/auth/guard/role.guard";

export function AuthDecorator() {
  return applyDecorators(
    ApiBearerAuth("Authorization"),
    UseGuards(AuthGuard, RoleGuard)
  );
}
