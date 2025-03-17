import { Module } from "@nestjs/common";
import { DiscountService } from "./discount.service";
import { DiscountController } from "./discount.controller";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DiscountEntity } from "./entities/discount.entity";
import { TourService } from "../tour/tour.service";
import { TourEntity } from "../tour/entities/tour.entity";
import { TourModule } from "../tour/tour.module";

@Module({
  imports: [AuthModule, TourModule, TypeOrmModule.forFeature([DiscountEntity])],
  controllers: [DiscountController],
  providers: [DiscountService],
})
export class DiscountModule {}
