import { BadRequestException } from "@nestjs/common";
import { ToNumber } from "src/common/utility/Number.util";

export function checkTicket(
  array: string[],
  count: number,
  withBuyer: boolean
) {
  if (count == 1 && withBuyer == false) {
    if (array.length == 1) {
      return true;
    } else
      throw new BadRequestException(
        "تعداد بلیط و تعداد افراد  متقاضی برابر نمی باشد"
      );
  }

  const totalcountArray = withBuyer ? count - 1 : count;
  if (array.length !== ToNumber(totalcountArray))
    throw new BadRequestException(
      "تعداد بلیط و تعداد افراد  متقاضی برابر نمی باشد"
    );

  const uniqueValues = new Set(array);
  if (uniqueValues.size !== array.length)
    throw new BadRequestException(" کدهای ملی افراد نباید تکراری باشند");

  return true;
}
