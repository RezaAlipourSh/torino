import { BadRequestException } from "@nestjs/common";

export function ToBoolean(value: boolean | string): boolean {
  if (value === true || value === "true") {
    return true;
  } else if (value === false || value === "false") {
    return false;
  } else
    throw new BadRequestException(" مقدار صحیح یا غلط را به درستی وارد کنید");
}
