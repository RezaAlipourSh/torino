import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { DiscountService } from "./discount.service";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { RoleAccess } from "src/common/decorator/role.decorator";
import { Roles } from "src/common/enum/role.enum";
import {
  createDiscountDto,
  OneDiscountDto,
  UpdateDiscountDto,
} from "./dto/discount.dto";
import { ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { FormType } from "src/common/enum/formType.enum";
import {
  DiscountFilter,
  OneDiscountFilter,
} from "./decorator/OneDiscount.Decorator";
import { Pagination } from "src/common/decorator/pagination.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { DiscountFilterDto } from "./dto/discountFilter.dto";

@Controller("Discount")
@AuthDecorator()
@RoleAccess(Roles.Admin)
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  createDiscount(@Body() dto: createDiscountDto) {
    return this.discountService.createDiscount(dto);
  }

  @Get("/getOne")
  @OneDiscountFilter()
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  findOne(@Query() dto: OneDiscountDto) {
    return this.discountService.findOne(dto);
  }

  @Get()
  @Pagination()
  @DiscountFilter()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() FilterDto: DiscountFilterDto
  ) {
    return this.discountService.findAll(paginationDto, FilterDto);
  }

  @Patch(":id")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  @ApiOperation({
    summary:
      "برای ارسال مقدار null در فیلدهایی که میتوانند nullable باشند گزینه send empty value را در نوع فرم x-www-form-urlencoded  بزنید",
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountDto
  ) {
    return this.discountService.update(id, dto);
  }

  @Delete()
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  Delete(@Body() dto: OneDiscountDto) {
    return this.discountService.deleteOne(dto);
  }
}
