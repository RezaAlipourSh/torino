import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { TourService } from "./tour.service";
import { CreateTourDto } from "./dto/create-tour.dto";
import { UpdateTourDto } from "./dto/update-tour.dto";
import { ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { FormType } from "src/common/enum/formType.enum";
import { TourPlanDto, UpdatePlanDto } from "./dto/tourplan.dto";
import { RoleAccess } from "src/common/decorator/role.decorator";
import { Roles } from "src/common/enum/role.enum";
import { AuthDecorator } from "src/common/decorator/auth.decorator";

@Controller("tour")
@AuthDecorator()
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
  @ApiOperation({ summary: "ساخت تور جدید - اطلاعات را به درستی وارد کنید" })
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  create(@Body() createTourDto: CreateTourDto) {
    return this.tourService.create(createTourDto);
  }

  @Post("/plan/create")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  createPlan(@Body() TourPlanDto: TourPlanDto) {
    return this.tourService.createPlan(TourPlanDto);
  }

  @Get()
  findAll() {
    return this.tourService.findAll();
  }

  @Get(":id")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  findOne(@Param("id") id: string) {
    return this.tourService.findOne(+id);
  }

  @Get("/plans/:id")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  findTourPlans(@Param("id") id: string) {
    return this.tourService.findTourPlans(+id);
  }

  @Patch(":id")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  update(@Param("id") id: string, @Body() updateTourDto: UpdateTourDto) {
    return this.tourService.update(+id, updateTourDto);
  }

  @Patch("/plans/:id")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  updateplan(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdatePlanDto
  ) {
    return this.tourService.updatePlan(id, updateDto);
  }

  @Delete(":id")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  remove(@Param("id") id: string) {
    return this.tourService.remove(+id);
  }

  @Delete("/plan/:id")
  @RoleAccess(Roles.Admin, Roles.User)
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  removePlan(@Param("id", ParseIntPipe) id: number) {
    return this.tourService.deletePlan(id);
  }
}
