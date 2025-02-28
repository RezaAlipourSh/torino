import { BadRequestException } from "@nestjs/common";
import { isString } from "class-validator";

export function validateStringArray(value: string | string[]) {
  if (!Array.isArray(value) && typeof value === "string") {
    let arr: string[] | string = value.toString().split(",");
    checkValueOfArray(arr);
    return arr;
  }
  checkValueOfArray(value);

  return value;
}

export function checkValueOfArray(arr: string[]) {
  if (!Array.isArray(arr))
    throw new BadRequestException("ارایه کد ملی افراد را به درستی وارد نمایید");

  for (const element of arr) {
    if (!isString(element) || !/^\d+$/g.test(element))
      throw new BadRequestException(
        "تمامی مقادیر ارایه باید از نوع رشته ای و فقط شامل اعداد باشد"
      );
    if (element.includes(" ") || element.length !== 10) {
      throw new BadRequestException(
        "مقادیر آرایه نباید خالی باشند و طول آن باید برابر با 10 رشته باشد"
      );
    }
  }
}
