import { BadRequestException } from "@nestjs/common";
import { isDate } from "class-validator";

export function validateNumString(value: string): boolean {
  if (parseInt(value) <= 0) {
    throw new BadRequestException(
      " مقدار ورودی برای قیمتها نمیتواند منفی باشد"
    );
  }

  return true;
}

export function checkDayNightDifference(day: number, night: number) {
  if (night - day > 1 || day - night > 1)
    throw new BadRequestException(
      `اختلاف روز و شب نباید بیشتر از یک باشد  روز = ${day} شب = ${night}`
    );
}

export function returnDay(startDate: Date, day: number, night: number) {
  const returnDate = new Date(startDate);
  returnDate.setDate(returnDate.getDate() + (day > night ? day : night));
  return { returnDate };
}

export function CountDays(day: number, tourDay: number, tourNight: number) {
  const countDays: number = tourDay > tourNight ? tourDay : tourNight;
  if (day > countDays || day <= 0) {
    throw new BadRequestException(
      "روز انتخابی نباید از تعداد روزها بیشتر باشد یا صفر و منفی باشد"
    );
  }
  return true;
}

export function startDateAvailability(startDate: Date, day: number) {
  const limitDate = new Date();
  const future = new Date(limitDate);
  future.setDate(limitDate.getDate() + day);

  if (new Date(startDate) < future)
    throw new BadRequestException({
      message: `تاریخ استارت تور باید از ${day} روز آینده باشد`,
      "تاریخ فعلی طبق سیستم شما ": new Date().toLocaleDateString(),
    });
}
