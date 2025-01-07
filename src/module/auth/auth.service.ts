import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { UserOtpEntity } from "../user/entities/userotp.entity";
import { randomInt } from "crypto";
import { UserCheckOtpDto, UserSendOtpDto } from "./dto/auth.dto";
import { TokensPayload } from "./types/payload";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(UserOtpEntity) private otpRepo: Repository<UserOtpEntity>,
    private jwtService: JwtService
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
    const { code } = await this.createOtp(user);
    return {
      code,
      message: "کد یکبار مصرف با موفقیت ارسال شد",
    };
  }

  async checkOtp(otpDto: UserCheckOtpDto) {
    const { code, mobile } = otpDto;

    const now = new Date();
    const user = await this.userRepo.findOne({
      where: { mobile },
      relations: {
        otp: true,
      },
    });

    if (!user || !user?.otp)
      throw new UnauthorizedException("حساب کاربری یافت نشد");
    const otp = user?.otp;
    if (otp?.code !== code)
      throw new UnauthorizedException("کد یکبار مصرف وارد شده اشتباه است");
    if (otp?.expires_in < now)
      throw new UnauthorizedException(" کد یکبار مصرف منقضی شده است");
    if (!user?.mobile_verify) {
      await this.userRepo.update({ id: user.id }, { mobile_verify: true });
    }

    const { accessToken, refreshToken } = this.makeToken({ id: user.id });

    return {
      accessToken,
      refreshToken,
      message: "با موفقیت وارد حساب کاربری خود شدید",
    };
  }

  async createOtp(user: UserEntity) {
    const expiresIn = new Date(new Date().getTime() + 1000 * 60 * 2);
    const code = randomInt(10000, 99999).toString();

    let otp = await this.otpRepo.findOneBy({ userId: user.id });
    if (otp) {
      if (otp.expires_in > new Date()) {
        throw new BadRequestException("کد یکبار مصرف قبلی هنوز منقضی نشده است");
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
    return { code };
  }

  makeToken(payload: TokensPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: "7d",
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: "1y",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify<TokensPayload>(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      if (typeof payload === "object" && payload?.id) {
        const user = await this.userRepo.findOneBy({ id: payload.id });
        if (!user) {
          throw new UnauthorizedException("3وارد حساب کاربری خود شوید");
        }
        return user;
      }
      throw new UnauthorizedException("4وارد حساب کاربری خود شوید");
    } catch (error) {
      throw new UnauthorizedException("5وارد حساب کاربری خود شوید");
    }
  }
}
