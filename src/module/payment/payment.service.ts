import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";

import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { BasketService } from "../basket/basket.service";
import { ZarinpalService } from "../http/zarinpal.service";
import { ReserveService } from "../reserve/reserve.service";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentEntity } from "./entities/payment.entity";
import { Repository } from "typeorm";
import { PaymentData, PaymentDto } from "./dto/create-payment.dto";
import { ReserveStatus } from "../reserve/reserve.status";

@Injectable({ scope: Scope.REQUEST })
export class PaymentService {
  constructor(
    @Inject(REQUEST) private req: Request,
    private basketService: BasketService,
    private zarinpalService: ZarinpalService,
    private reserveService: ReserveService,
    @InjectRepository(PaymentEntity)
    private paymentRepo: Repository<PaymentEntity>
  ) {}

  async getGatewayUrl(paymnetDto: PaymentDto) {
    const { id: userId, email, mobile } = this.req.user;
    const basket = await this.basketService.getBasket();
    const reserve = await this.reserveService.create(basket, paymnetDto);
    const payment = await this.create({
      amount: basket.PaymentAmount,
      reserveId: reserve.id,
      status: basket.PaymentAmount === 0,
      userId,
      invoiceNumber: new Date().getTime().toString(),
    });
    if (payment.status == false) {
      const { authority, code, gatewayURL } =
        await this.zarinpalService.sendRequest({
          amount: basket.PaymentAmount,
          description: "Payment Description",
          user: {
            email,
            mobile,
          },
        });
      payment.authority = authority;
      await this.paymentRepo.save(payment);
      return {
        gatewayURL,
        code,
      };
    }
    return {
      message: "پرداخت با موفقیت انجام شد",
    };
  }

  async create(paymentDto: PaymentData) {
    const { amount, invoiceNumber, reserveId, status, userId } = paymentDto;
    const payment = this.paymentRepo.create({
      amount,
      invoiceNumber,
      reserveId,
      status,
      userId,
    });
    return await this.paymentRepo.save(payment);
  }
  async findPaymentByAuthority(authority: string) {
    const payment = await this.paymentRepo.findOneBy({ authority });
    if (!payment) throw new NotFoundException("Payment Not Found");
    return payment;
  }

  async verify(authority: string, status: string) {
    const payment = await this.findPaymentByAuthority(authority);
    if (payment.status) throw new ConflictException("قبلا پرداخت شده است");
    if (status === "OK") {
      const reserve = await this.reserveService.findOne(payment.reserveId);
      reserve.status = ReserveStatus.Done;
      await this.reserveService.save(reserve);
      payment.status = true;
    } else {
      return "http://frontURL.com/payment?status=failed";
    }
    await this.paymentRepo.save(payment);
    return "http://frontURL.com/payment?status=success";
  }
}
