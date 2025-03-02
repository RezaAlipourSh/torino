import {
  BadRequestException,
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
import { BasketDto } from "./dto/basket.dto";
import { TourService } from "../tour/tour.service";
import { ToNumber } from "src/common/utility/Number.util";

@Injectable({ scope: Scope.REQUEST })
export class BasketService {
  constructor(
    @InjectRepository(BasketEntity)
    private basketRepo: Repository<BasketEntity>,
    @Inject(REQUEST) private req: Request,
    private tourService: TourService
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
}
