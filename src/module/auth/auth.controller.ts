import { Body, Controller, Post } from "@nestjs/common";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { FormType } from "src/common/enum/formType.enum";
import { UserCheckOtpDto, UserSendOtpDto } from "./dto/auth.dto";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/send-otp")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  sendOtp(@Body() otpDto: UserSendOtpDto) {
    return this.authService.sendOtp(otpDto);
  }

  @Post("/check-otp")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  checkOtp(@Body() otpDto: UserCheckOtpDto) {
    return this.authService.checkOtp(otpDto);
  }
}
