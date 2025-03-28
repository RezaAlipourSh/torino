import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { BasketService } from "../basket/basket.service";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentEntity } from "./entities/payment.entity";
import { BasketEntity } from "../basket/entities/basket.entity";
import { ReserveEntity } from "../reserve/entities/reserve.entity";
import { BasketModule } from "../basket/basket.module";
import { TourModule } from "../tour/tour.module";
import { ReserveService } from "../reserve/reserve.service";
import { DiscountModule } from "../discount/discount.module";

@Module({
  imports: [
    AuthModule,
    BasketModule,
    TourModule,
    DiscountModule,
    TypeOrmModule.forFeature([PaymentEntity, BasketEntity, ReserveEntity]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, BasketService, ReserveService],
})
export class PaymentModule {}
