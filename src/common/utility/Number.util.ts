import { BadRequestException } from "@nestjs/common";
import {
  isNumber,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

export function ToNumber(value: number | string) {
  const number = Number(value);
  if (!isNumber(number))
    throw new BadRequestException("مقدار عددی را به درستی وارد نمایید");
  return number;
}

@ValidatorConstraint()
export class ValidNumber implements ValidatorConstraintInterface {
  validate(value: string | number): Promise<boolean> | boolean {
    if (ToNumber(value) <= 0)
      throw new BadRequestException("اعداد ورودی نباید صفر یا منفی باشد");
    return true;
  }
}
