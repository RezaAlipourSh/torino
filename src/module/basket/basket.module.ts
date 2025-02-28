import { Module } from "@nestjs/common";
import { BasketService } from "./basket.service";
import { BasketController } from "./basket.controller";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BasketEntity } from "./entities/basket.entity";
import { TourService } from "../tour/tour.service";
import { TourModule } from "../tour/tour.module";

@Module({
  imports: [AuthModule, TourModule, TypeOrmModule.forFeature([BasketEntity])],
  controllers: [BasketController],
  providers: [BasketService],
})
export class BasketModule {}
