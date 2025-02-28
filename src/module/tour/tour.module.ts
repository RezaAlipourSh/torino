import { Module } from "@nestjs/common";
import { TourService } from "./tour.service";
import { TourController } from "./tour.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TourEntity } from "./entities/tour.entity";
import { TourPlanEntity } from "./entities/tourPlan.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([TourEntity, TourPlanEntity])],
  controllers: [TourController],
  providers: [TourService],
  exports: [TypeOrmModule, TourService],
})
export class TourModule {}
