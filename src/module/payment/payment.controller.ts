import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { PaymentService } from "./payment.service";

import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { PaymentDto } from "./dto/create-payment.dto";
import { Response } from "express";

@Controller("payment")
@AuthDecorator()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  gatewayUrl(@Body() paymentDto: PaymentDto) {
    return this.paymentService.getGatewayUrl(paymentDto);
  }

  @Get("/verify")
  async verifyPayments(
    @Query("Authority") authority: string,
    @Query("Status") status: string,
    @Res() res: Response
  ) {
    const url = await this.paymentService.verify(authority, status);
    return res.redirect(url);
  }
}
