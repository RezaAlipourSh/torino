import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DiscountEntity } from "./entities/discount.entity";
import { Repository } from "typeorm";
import { createDiscountDto } from "./dto/discount.dto";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable({scope:Scope.REQUEST})
export class DiscountService {
  constructor(
    @InjectRepository(DiscountEntity)
    private discountRepo: Repository<DiscountEntity>,
    @Inject(REQUEST) private req: Request
  ) {}

  async createDiscount(dto :createDiscountDto) {}
}
