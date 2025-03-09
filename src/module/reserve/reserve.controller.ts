import { Controller } from "@nestjs/common";
import { ReserveService } from "./reserve.service";

@Controller("reserve")
export class ReserveController {
  constructor(private readonly reserveService: ReserveService) {}
}
