import { BadRequestException } from "@nestjs/common";

export function validateNumString(value: string): boolean {
  if (parseInt(value) <= 0) {
    throw new BadRequestException(
      " مقدار ورودی برای قیمتها نمیتواند منفی باشد"
    );
  }

  return true;
}
