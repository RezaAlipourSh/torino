import { ApiProperty } from "@nestjs/swagger";
import { Min, Validate } from "class-validator";
import { ValidNumber } from "src/common/utility/Number.util";

export class AddBasketDto {
  @ApiProperty()
  @Validate(ValidNumber)
  tourId: number;
  @ApiProperty()
  @Validate(ValidNumber)
  count: number;
  @ApiProperty({
    description: "تعین کنید فرد خریدار هم حضور دارد یا نه",
    default: true,
  })
  withMe: boolean;
  @ApiProperty({
    description:
      "کد ملی افراد همراه خود را به صورت رشته ای از اعداد وارد نمایید",
  })
  companions: string[];
}
