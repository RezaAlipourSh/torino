import { Body, Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { BasketService } from "./basket.service";
import { BasketDiscountDto, BasketDto } from "./dto/basket.dto";
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

  @Post("/discount")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  AddDiscountToBasket(@Body() Dto: BasketDiscountDto) {
    return this.basketService.AddDiscountToBasket(Dto);
  }
  @Patch("/discount")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  RemoveDiscountfromBasket(@Body() Dto: BasketDiscountDto) {
    return this.basketService.removeDiscountFromBasket(Dto);
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
