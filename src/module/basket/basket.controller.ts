import { Body, Controller, Delete, Get, Post } from "@nestjs/common";
import { BasketService } from "./basket.service";
import { BasketDto } from "./dto/basket.dto";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { ApiConsumes } from "@nestjs/swagger";
import { FormType } from "src/common/enum/formType.enum";

@Controller("Basket")
@AuthDecorator()
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @Post("/")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  AddToBasket(@Body() basketDto: BasketDto) {
    return this.basketService.AddToBasket(basketDto);
  }

  @Get("/")
  getBasket() {
    return this.basketService.getBasket();
  }

  @Delete("/")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  deletefromBasket(@Body() basketDto: BasketDto) {
    return this.basketService.RemoveFrombasket(basketDto);
  }
}
