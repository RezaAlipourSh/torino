import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class TourPlanDto {
  @ApiProperty()
  @Transform(({ value }) => parseInt(value, 10))
  tourId: number;
  @ApiProperty()
  @Transform(({ value }) => parseInt(value, 10))
  day: number;
  @ApiProperty()
  description: string;
}

export class UpdatePlanDto extends PartialType(TourPlanDto) {}
