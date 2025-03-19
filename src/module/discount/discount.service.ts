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
import {
  DeepPartial,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import {
  createDiscountDto,
  OneDiscountDto,
  UpdateDiscountDto,
} from "./dto/discount.dto";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { TourService } from "../tour/tour.service";
import { ToNumber } from "src/common/utility/Number.util";
import { ToBoolean } from "src/common/utility/boolean.util";
import { isBoolean, isDate, isEnum, isNotEmptyObject } from "class-validator";
import { DiscountType } from "./discountType.enum";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { DiscountFilterDto } from "./dto/discountFilter.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utility/paginatiion.util";

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
      tourId: ToNumber(tourId) ?? null,
      buylimit: ToNumber(buylimit) ?? null,
      limit: ToNumber(limit) ?? null,
      forNewComers: ToBoolean(forNewComers),
      isActive: ToBoolean(isActive),
      expiresIn: expiresIn ? new Date(expiresIn) : null,
      amount: ToNumber(amount) ?? null,
      percent: ToNumber(percent) ?? null,
      type,
    });

    await this.discountRepo.save(discount);

    return {
      message: "کد تخفیف به درستی ایجاد شد",
    };
  }
  async update(id: number, dto: UpdateDiscountDto) {
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
    const discount = await this.findOne({ id });
    let discountObject: DeepPartial<DiscountEntity> = {};

    if (type === DiscountType.Basket && type !== discount.type) {
      if (tourId)
        throw new BadRequestException(
          "کد تخفیف سبد خرید نیازی به ایدی تور ندارد"
        );
      discountObject.type = DiscountType.Basket;
      discountObject.tourId = null;
    } else if (type === DiscountType.Tour) {
      if (!tourId) throw new BadRequestException("ایدی تور را وارد کنید");
      if (tourId && ToNumber(tourId) !== ToNumber(discount.tourId)) {
        await this.tourService.findOne(ToNumber(tourId));
        discountObject.tourId = ToNumber(tourId);
      }
      discountObject.type = DiscountType.Tour;
    }

    if (expiresIn && new Date(expiresIn) !== discount.expiresIn) {
      if (new Date(expiresIn) < new Date())
        throw new BadRequestException(
          "تاریخ انقضا جدید باید از تاریخ الان بیشتر باشد"
        );
      discountObject.expiresIn = new Date(expiresIn);
    } else if (discount.expiresIn !== null && typeof expiresIn === "string")
      discountObject.expiresIn = null;

    if (limit && ToNumber(limit) < ToNumber(discount.usage))
      throw new BadRequestException(
        "مقدار محدودیت نباید از مقدار استفاده شده کمتر باشد "
      );

    if (amount && percent)
      return new BadRequestException(
        "از بین مقدار تخفیف و درصد تخفیف یکی باید وجود داشته باشد"
      );

    if (amount && ToNumber(amount) !== ToNumber(discount.amount)) {
      discountObject.amount = ToNumber(amount);
      discountObject.percent = null;
    }

    if (percent && ToNumber(percent) !== ToNumber(discount.percent)) {
      discountObject.percent = ToNumber(percent);
      discountObject.amount = null;
    }

    if (code && code !== discount.code) {
      await this.checkCodeExist(code);
      discountObject.code = code;
    }

    if (forNewComers && ToBoolean(forNewComers) !== discount.forNewComers)
      discountObject.forNewComers = ToBoolean(forNewComers);

    if (isActive && ToBoolean(isActive) !== discount.isActive)
      discountObject.isActive = ToBoolean(isActive);

    if (buylimit && ToNumber(buylimit) !== ToNumber(discount.buylimit)) {
      discountObject.buylimit = ToNumber(buylimit);
    } else if (discount.buylimit !== null && typeof buylimit === "string")
      discountObject.buylimit = null;

    if (limit && ToNumber(limit) !== ToNumber(discount.limit)) {
      discountObject.limit = ToNumber(limit);
    } else if (discount.limit !== null && typeof limit === "string")
      discountObject.limit = null;

    if (isNotEmptyObject(discountObject)) {
      await this.discountRepo.update({ id }, discountObject);

      return {
        message: " مشخصات کد تخفیف به درستی بروزرسانی شد",
      };
    } else {
      return {
        message: "تغییری ایجاد نشد",
      };
    }
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

  async findAll(paginationDto: PaginationDto, FilterDto: DiscountFilterDto) {
    const {
      amount,
      buylimit,
      code,
      created_from_date,
      created_to_date,
      expires_from_date,
      expires_to_date,
      forNewComers,
      isActive,
      discountLimit,
      percent,
      tourId,
      type,
      usage,
    } = FilterDto;
    const { limit, page, skip } = paginationSolver(
      paginationDto.page,
      paginationDto.limit
    );
    console.log(FilterDto, "filter");

    let where: FindOptionsWhere<DiscountEntity> = {};

    if (type && isEnum(type, DiscountType)) where.type = type;

    if (code && code.length >= 4 && code.length <= 20) {
      where.code = ILike(`%${code}%`);
    }
    if (isActive) where.isActive = ToBoolean(isActive);

    if (forNewComers) where.forNewComers = ToBoolean(forNewComers);

    if (amount) where.amount = ToNumber(amount);

    if (discountLimit) where.limit = ToNumber(discountLimit);
    if (percent) where.percent = ToNumber(percent);
    if (buylimit) where.buylimit = ToNumber(buylimit);
    if (tourId) where.tourId = ToNumber(tourId);
    if (usage) where.usage = ToNumber(usage);

    if (
      created_from_date &&
      created_to_date &&
      isDate(new Date(created_from_date)) &&
      isDate(new Date(created_to_date))
    ) {
      let from = new Date(new Date(created_from_date).setUTCHours(0, 0, 0));
      let to = new Date(new Date(created_to_date).setUTCHours(0, 0, 0));
      where.createdAt = (MoreThanOrEqual(from), LessThanOrEqual(to));
    } else if (created_from_date && isDate(new Date(created_from_date))) {
      let from = new Date(new Date(created_from_date).setUTCHours(0, 0, 0));
      where.createdAt = MoreThanOrEqual(from);
    } else if (created_to_date && isDate(new Date(created_to_date))) {
      let to = new Date(new Date(created_to_date).setUTCHours(0, 0, 0));
      where.createdAt = LessThanOrEqual(to);
    }

    if (
      expires_from_date &&
      expires_to_date &&
      isDate(new Date(expires_from_date)) &&
      isDate(new Date(expires_to_date))
    ) {
      let from = new Date(new Date(expires_from_date).setUTCHours(0, 0, 0));
      let to = new Date(new Date(expires_to_date).setUTCHours(0, 0, 0));
      where.expiresIn = (MoreThanOrEqual(from), LessThanOrEqual(to));
    } else if (expires_from_date && isDate(new Date(expires_from_date))) {
      let from = new Date(new Date(expires_from_date).setUTCHours(0, 0, 0));
      where.expiresIn = MoreThanOrEqual(from);
    } else if (expires_to_date && isDate(new Date(expires_to_date))) {
      let to = new Date(new Date(expires_to_date).setUTCHours(0, 0, 0));
      where.expiresIn = LessThanOrEqual(to);
    }
    console.log(where, "where");

    const [discounts, count] = await this.discountRepo.findAndCount({
      where,
      relations: {
        tour: true,
        baskets: true,
      },
      select: {
        tour: {
          name: true,
        },
        baskets: {
          id: true,
        },
      },
      skip,
      take: limit,
      order: { id: "DESC" },
    });

    return {
      pagination: paginationGenerator(count, page, limit),
      discounts,
    };
  }

  async deleteOne(dto: OneDiscountDto) {
    const discount = await this.findOne(dto);
    await this.discountRepo.remove(discount);
    return {
      message: "به درستی حذف شد",
    };
  }
}
