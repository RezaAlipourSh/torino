import { Controller } from "@nestjs/common";
import { DiscountService } from "./discount.service";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { RoleAccess } from "src/common/decorator/role.decorator";
import { Roles } from "src/common/enum/role.enum";

@Controller("Discount")
@AuthDecorator()
@RoleAccess(Roles.Admin)
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}
}
