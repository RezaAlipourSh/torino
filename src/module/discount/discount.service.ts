import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DiscountEntity } from "./entities/discount.entity";
import { FindOptionsWhere, Repository } from "typeorm";
import { createDiscountDto, OneDiscountDto } from "./dto/discount.dto";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { TourService } from "../tour/tour.service";
import { ToNumber } from "src/common/utility/Number.util";
import { ToBoolean } from "src/common/utility/boolean.util";
import { isTimeZone } from "class-validator";
import { DiscountType } from "./discountType.enum";

@Injectable({ scope: Scope.REQUEST })
export class DiscountService {
  constructor(
    @InjectRepository(DiscountEntity)
    private discountRepo: Repository<DiscountEntity>,
    @Inject(REQUEST) private req: Request,
    private readonly tourService: TourService
  ) {}

  async createDiscount(dto: createDiscountDto) {
    const {
      amount,
      buylimit,
      code,
      expiresIn,
      forNewComers,
      isActive,
      limit,
      percent,
      tourId,
      type,
    } = dto;

    await this.checkCodeExist(code);

    if ((amount && percent) || (!amount && !percent)) {
      return new BadRequestException(
        "از بین مقدار تخفیف و درصد تخفیف یکی باید وجود داشته باشد"
      );
    }

    console.log(isTimeZone(expiresIn), new Date(expiresIn));

    if (type === DiscountType.Tour) {
      if (!tourId) throw new BadRequestException("ایدی تور را وارد کنید");
      if (tourId) await this.tourService.findOne(ToNumber(tourId));
    }
    if (type === DiscountType.Basket) {
      if (tourId)
        throw new BadRequestException(
          "کد تخفیف سبد خرید نیازی به ایدی تور ندارد"
        );
    }

    const discount = this.discountRepo.create({
      code,
      tourId: tourId ?? null,
      buylimit: buylimit ?? null,
      limit: limit ?? null,
      forNewComers: ToBoolean(forNewComers),
      isActive: ToBoolean(isActive),
      expiresIn: expiresIn ? new Date(expiresIn) : null,
      amount: amount ?? null,
      percent: percent ?? null,
      type,
    });

    await this.discountRepo.save(discount);

    return {
      message: "کد تخفیف به درستی ایجاد شد",
    };
  }

  async checkCodeExist(code: string) {
    const discount = await this.discountRepo.findOneBy({ code });
    if (discount) throw new ConflictException("کد موردنظر از قبل ثبت شده است");
    return true;
  }

  async findOne(dto: OneDiscountDto) {
    const { code, id } = dto;
    if ((code && id) || (!code && !id))
      throw new BadRequestException(
        "  یکی از موارد ایدی یا کد را استفاده کنید"
      );

    const where: FindOptionsWhere<DiscountEntity> = {};

    id ? (where.id = id) : (where.code = code);

    const discount = await this.discountRepo.findOne({ where });
    if (!discount) throw new NotFoundException("کد تخفیف یافت نشد");
    return discount;
  }

  async deleteOne(dto: OneDiscountDto) {
    const discount = await this.findOne(dto);
    await this.discountRepo.remove(discount);
    return {
      message: "به درستی حذف شد",
    };
  }
}
