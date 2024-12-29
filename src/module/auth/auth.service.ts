import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { UserOtpEntity } from "../user/entities/userotp.entity";
import { randomInt } from "crypto";
import { UserSendOtpDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(UserOtpEntity) private otpRepo: Repository<UserOtpEntity>
  ) {}

  async sendOtp(otpDto: UserSendOtpDto) {
    const { mobile } = otpDto;
    let user = await this.userRepo.findOneBy({ mobile });
    if (!user) {
      user = this.userRepo.create({
        mobile,
      });
      user = await this.userRepo.save(user);
    }
    await this.createOtp(user);
    return {
      message: "کد یکبار مصرف با موفقیت ارسال شد",
    };
  }

  async createOtp(user: UserEntity) {
    const expiresIn = new Date(new Date().getTime() + 1000 * 60 * 2);
    const code = randomInt(10000, 99999).toString();

    let otp = await this.otpRepo.findOneBy({ userId: user.id });
    if (otp) {
      if (otp.expires_in > new Date()) {
        throw new BadRequestException("کد یکبار مصرف هنوز منقضی نشده است");
      }
      otp.code = code;
      otp.expires_in = expiresIn;
    } else {
      otp = this.otpRepo.create({
        code,
        expires_in: expiresIn,
        userId: user.id,
      });
    }
    otp = await this.otpRepo.save(otp);
    user.otpId = otp.id;
    await this.userRepo.save(user);
  }
}
