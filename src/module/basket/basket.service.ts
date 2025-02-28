import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BasketEntity } from "./entities/basket.entity";
import { Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { AddBasketDto } from "./dto/basket.dto";
import { validateStringArray } from "./utils/ArrayValidate.util";
import { TourService } from "../tour/tour.service";
import { ToNumber } from "src/common/utility/Number.util";
import { ToBoolean } from "src/common/utility/boolean.util";
import { checkTicket } from "./utils/ticket.util";

@Injectable({ scope: Scope.REQUEST })
export class BasketService {
  constructor(
    @InjectRepository(BasketEntity)
    private basketRepo: Repository<BasketEntity>,
    @Inject(REQUEST) private req: Request,
    private tourService: TourService
  ) {}

  async addBasket(basketDto: AddBasketDto) {
    const { id: userId } = this.req.user;
    const { companions, count, withMe, tourId } = basketDto;
    let companionArray: string[];

    if (count >= 2 || (count == 1 && ToBoolean(withMe) === false)) {
      companionArray = validateStringArray(companions);
      checkTicket(companionArray, count, ToBoolean(withMe));
    } else companionArray = null;

    await this.tourService.findOne(ToNumber(tourId));

    await this.basketRepo.insert({
      userId,
      tourId: ToNumber(tourId),
      count: ToNumber(count),
      withMe: ToBoolean(withMe),
      companions: companionArray,
    });

    return {
      message: "سبد شما با موفقیت اضافه شد",
    };
  }
}
