import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "../user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfig } from "src/config/typeorm.config";
import { AuthModule } from "../auth/auth.module";
import { TourModule } from "../tour/tour.module";
import { BlogModule } from "../blog/blog.module";
import { BasketModule } from "../basket/basket.module";
import { PaymentModule } from "../payment/payment.module";
import { ReserveModule } from "../reserve/reserve.module";
import { HttpApimodule } from "../http/http.module";
import { CategoryModule } from "../category/category.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(TypeOrmConfig()),
    AuthModule,
    UserModule,
    TourModule,
    BlogModule,
    BasketModule,
    PaymentModule,
    ReserveModule,
    CategoryModule,
    HttpApimodule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
