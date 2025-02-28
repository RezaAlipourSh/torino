import { Body, Controller, Post } from "@nestjs/common";
import { BasketService } from "./basket.service";
import { AddBasketDto } from "./dto/basket.dto";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { ApiConsumes } from "@nestjs/swagger";
import { FormType } from "src/common/enum/formType.enum";

@Controller("Basket")
@AuthDecorator()
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @Post("/")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  addToBasket(@Body() basketDto: AddBasketDto) {
    return this.basketService.addBasket(basketDto);
  }
}
