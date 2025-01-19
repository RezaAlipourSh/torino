import { BadRequestException } from "@nestjs/common";

export function ValidateBank(bank: Object, value: string, section: string) {
  for (const key in bank) {
    if (bank[key] === value) {
      return key;
    }
  }

  throw new BadRequestException(`اطلاعات ${section} وارد شده صحیح نمی باشد`);
}
