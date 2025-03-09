import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { ReserveEntity } from "./entities/reserve.entity";
import { DataSource, Repository } from "typeorm";
import { ReserveStatus } from "./reserve.status";
import { PaymentDto } from "../payment/dto/create-payment.dto";
import { BasketType } from "../basket/basket.type";
import { ToNumber } from "src/common/utility/Number.util";

@Injectable({ scope: Scope.REQUEST })
export class ReserveService {
  constructor(
    @Inject(REQUEST) private req: Request,
    @InjectRepository(ReserveEntity)
    private reserveRepo: Repository<ReserveEntity>,
    private dataSource: DataSource
  ) {}

  async create(basket: BasketType, paymnetDto: PaymentDto) {
    const { description = undefined } = paymnetDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const { id: userId } = this.req.user;
      const { PaymentAmount } = basket;
      let reserve = queryRunner.manager.create(ReserveEntity, {
        userId,
        status: ReserveStatus.Pending,
        totalAmount: ToNumber(PaymentAmount),
        description,
      });
      reserve = await queryRunner.manager.save(ReserveEntity, reserve);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return reserve;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw new BadRequestException("Order Failed");
    }
  }

  async findOne(id: number) {
    const reserve = await this.reserveRepo.findOneBy({ id });
    if (!reserve) throw new NotFoundException("Not Found Reserve");
    return reserve;
  }

  async save(reserve: ReserveEntity) {
    return await this.reserveRepo.save(reserve);
  }
}
