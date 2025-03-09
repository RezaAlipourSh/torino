import { Module } from "@nestjs/common";
import { ReserveService } from "./reserve.service";
import { ReserveController } from "./reserve.controller";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReserveEntity } from "./entities/reserve.entity";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ReserveEntity])],
  controllers: [ReserveController],
  providers: [ReserveService],
})
export class ReserveModule {}
