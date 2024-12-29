import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsString, Length } from "class-validator";

export class UserSendOtpDto {
  @ApiProperty()
  @IsMobilePhone(
    "fa-IR",
    {},
    { message: "your phonbe number format is incorrect" }
  )
  mobile: string;
}

export class UserCheckOtpDto {
  @ApiProperty()
  @IsMobilePhone(
    "fa-IR",
    {},
    { message: "your phonbe number format is incorrect" }
  )
  mobile: string;
  @ApiProperty()
  @IsString()
  @Length(5, 5, { message: "کد یکبار مصرف 5 رقمی را به درستی وارد کنید" })
  code: string;
}
