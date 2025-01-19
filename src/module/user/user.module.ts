import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { userBankAccountEntity } from "./entities/user-bankAccount.entity";
import { UserEntity } from "./entities/user.entity";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([userBankAccountEntity, UserEntity]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
