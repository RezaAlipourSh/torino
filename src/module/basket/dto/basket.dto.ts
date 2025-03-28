import { ApiProperty } from "@nestjs/swagger";
import { Min, Validate } from "class-validator";
import { ValidNumber } from "src/common/utility/Number.util";

export class BasketDto {
  @ApiProperty()
  @Validate(ValidNumber)
  tourId: number;
  @ApiProperty()
  @Validate(ValidNumber)
  count: number;
}

export class BasketDiscountDto {
  @ApiProperty()
  code: string;
}
