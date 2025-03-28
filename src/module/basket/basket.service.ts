import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BasketEntity } from "./entities/basket.entity";
import { Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { BasketDiscountDto, BasketDto } from "./dto/basket.dto";
import { TourService } from "../tour/tour.service";
import { ToNumber } from "src/common/utility/Number.util";
import { DiscountService } from "../discount/discount.service";
import { DiscountType } from "../discount/discountType.enum";
import { CheckNewComers } from "../discount/util/discount.util";

@Injectable({ scope: Scope.REQUEST })
export class BasketService {
  constructor(
    @InjectRepository(BasketEntity)
    private basketRepo: Repository<BasketEntity>,
    @Inject(REQUEST) private req: Request,
    private tourService: TourService,
    private discountService: DiscountService
  ) {}

  async AddToBasket(basketDto: BasketDto) {
    const { id: userId } = this.req.user;
    const { count, tourId } = basketDto;

    const basket = await this.basketRepo.findOne({
      where: {
        userId,
        tourId: ToNumber(tourId),
      },
    });

    if (!basket) {
      await this.checktourLimit(tourId, count);

      await this.basketRepo.insert({
        userId,
        tourId: ToNumber(tourId),
        count: ToNumber(count),
      });
    } else {
      const newCount = basket.count + ToNumber(count);
      await this.checktourLimit(tourId, newCount);

      basket.count += ToNumber(count);
      await this.basketRepo.save(basket);
    }

    return {
      message: "به درستی به سبد شما اضافه شد",
    };
  }

  async RemoveFrombasket(basketDto: BasketDto) {
    const { id: userId } = this.req.user;
    const { count, tourId } = basketDto;

    const basket = await this.basketRepo.findOne({
      where: {
        userId,
        tourId,
      },
    });

    if (!basket)
      throw new NotFoundException("سبد خرید شما برای این تور یافت نشد");

    if (basket.count <= count) {
      await this.basketRepo.delete({ id: basket.id });
    } else {
      basket.count -= ToNumber(count);
      await this.basketRepo.save(basket);
    }

    return {
      message: "با موفقیت از سبد حذف شد",
    };
  }

  async getBasket() {
    const { id: userId } = this.req.user;

    const baskets = await this.basketRepo.find({
      where: { userId },
      relations: {
        tour: true,
        user: true,
      },
      order: { createdAt: "DESC" },
    });

    if (baskets.length <= 0)
      throw new NotFoundException("شما فعلا سبد سفارشی ندارید ");

    let basketList = [];
    let PaymentAmount = null;

    for (const item of baskets) {
      let totaLPrice = ToNumber(item.count) * ToNumber(item.tour.price);
      basketList.push({
        tourid: item.tourId,
        tourName: item.tour.name,
        count: item.count,
        ticketPrice: item.tour.price,
        totaLPrice,
      });
      PaymentAmount += totaLPrice;
    }

    return {
      PaymentAmount,
      basketList,
    };
  }

  async checktourLimit(tourId: number, count: number) {
    const tour = await this.tourService.findOne(ToNumber(tourId));

    if (tour.limit <= 0) {
      throw new BadRequestException(
        "ظرفیت تور تکمیل شده است و دیگر نمیتوان رزرو کرد"
      );
    } else if (tour.limit < ToNumber(count))
      throw new BadRequestException({
        message:
          "متاسفانه تعداد بلیط انتخاب شده توسط شما از ظرفیت  باقیمانده تور بیشتر است",
        RemainingTickets: tour.limit,
        SelectedTickets: count,
      });

    return tour;
  }

  async AddDiscountToBasket(dto: BasketDiscountDto) {
    const { code } = dto;
    const { id: userId, created_at } = this.req.user;

    const discount = await this.discountService.findOne({ code });

    const userBasketDiscount = await this.basketRepo.findOneBy({
      discountId: discount.id,
      userId,
    });
    if (userBasketDiscount)
      throw new ConflictException("کد تخفیف از قبل اعمال شده است");

    if (discount.forNewComers) CheckNewComers(created_at, 30);

    if (!discount.isActive)
      throw new BadRequestException("کد تخفیف فعال نمی‌باشد");

    if (discount.limit && discount.limit <= discount.usage)
      throw new BadRequestException(" ظرفیت کد تخفیف به پایان رسیده است");

    if (
      discount?.expiresIn &&
      discount.expiresIn?.getTime() <= new Date().getTime()
    )
      throw new BadRequestException("کد تخفیف منقضی شده است");

    const userBasket = await this.basketRepo.findOneBy({
      userId,
    });

    if (
      discount.buylimit &&
      discount.buylimit > (await this.getBasket()).PaymentAmount
    )
      throw new BadRequestException({
        message:
          "حداقل مقدار خرید برای این کد تخفیف بیشتر از مبلغ خرید شما است",
        limit: discount.buylimit,
        amount: (await this.getBasket()).PaymentAmount,
      });

    if (discount.type == DiscountType.Tour) {
      if (userBasket.tourId !== discount.tourId)
        throw new BadRequestException("کد تخفیف برای این تور نمی‌باشد");
    }

    await this.basketRepo.update(
      { id: userBasket.id },
      { discountId: discount.id }
    );

    const discountUsage = ToNumber(discount.usage) + 1;
    await this.discountService.UpdateDiscountUsage(discount.id, discountUsage);

    return {
      message: "کد تخفیف به درستی اعمال شد",
    };
  }

  async removeDiscountFromBasket(dto: BasketDiscountDto) {
    const { code } = dto;
    const { id: userId } = this.req.user;
    const discount = await this.discountService.findOne({ code });
    const basket = await this.basketRepo.findOneBy({
      userId,
      discountId: discount.id,
    });
    if (!basket) throw new NotFoundException("کد تخفیف در سبد خرید موجود نیست");

    await this.basketRepo.update({ id: basket.id }, { discountId: null });

    const discountUsage = ToNumber(discount.usage) - 1;
    await this.discountService.UpdateDiscountUsage(discount.id, discountUsage);

    return {
      message: "کد تخفیف به درستی از سبد خزید حذف شد",
    };
  }
}
