import { PartialType } from "@nestjs/mapped-types";
import { AddUserBankAccountDto, CreateUserDto } from "./create-user.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserBankAccountDto {
  @ApiPropertyOptional({
    example: "IR230215974165082937145421",
    description:
      "به صورت نمونه مقابل اطلاعات را وارد نمایید - IR230215974165082937145421 ",
  })
  @IsOptional()
  @Matches(/^IR[0-9a-zA-Z]{24}$/, {
    message: "شماره شبا را به صورت صحیح و  عبارت IR  در اول آن وارد کنید",
  })
  @IsString()
  @Length(26, 26, { message: "طول شماره شبا وارد شده صحیح نمی باشد " })
  iban: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString(
    {},
    { message: "مقدار شماره حساب را به صورت رشته ای از اعداد وارد نمایید" }
  )
  @Length(8, 16, { message: "شماره حساب خود را به درستی وارد نمایید" })
  accountNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString(
    {},
    { message: "مقدار شماره کارت را به صورت رشته ای از اعداد وارد نمایید" }
  )
  @Length(16, 16, { message: " شماره کارت 16 رقمی خود را به درستی وارد کنید." })
  cardNumber: string;
}
