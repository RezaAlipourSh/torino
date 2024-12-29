import { IsMobilePhone } from "class-validator";

export class UserSendOtpDto {
  @IsMobilePhone(
    "fa-IR",
    {},
    { message: "your phonbe number format is incorrect" }
  )
  mobile: string;
}
