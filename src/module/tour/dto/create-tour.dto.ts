import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  Length,
  Max,
  Min,
} from "class-validator";
import { VehicleType } from "../enums/vehicle.enums";
import { TourLeaderStatus } from "../enums/tourLeader.enum";
import { Transform } from "class-transformer";

export class CreateTourDto {
  @ApiProperty()
  @Length(2, 50, { message: " نام تور باید بین 2 تا 50 حرف باشد" })
  name: string;
  @ApiProperty()
  @Length(2, 50, { message: " نام مبدا باید بین 2 تا 50 حرف باشد" })
  from: string;
  @ApiProperty()
  @Length(2, 50, { message: " نام مقصد باید بین 2 تا 50 حرف باشد" })
  to: string;
  @ApiProperty({})
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber({}, { message: "یک  مقدار از نوع عدد برای روز وارد کنید" })
  day: number;
  @ApiPropertyOptional()
  night: number;
  @ApiPropertyOptional()
  @Length(10, 150, { message: " توضیح تور باید بین 10 تا 150 حرف باشد" })
  detail: string;
  @ApiProperty({ example: "2025-01-01T07:31:39.614Z" })
  @IsDateString(
    {},
    {
      message:
        " 2025-01-01T07:31:39.614Z  -  مقدار ورودی همانند مثال باید از نوع تاریخ باشد",
    }
  )
  startDate: Date;
  @ApiPropertyOptional({
    example: 4,
    description: "بین یک تا پنج باید باشد",
  })
  @Min(1, {
    message: "درجه هتل باید از نوع عددی باشد و نمی تواند کمتر از یک باشد",
  })
  @Max(5, {
    message: "درجه هتل باید از نوع عددی باشد و نمی تواند بیشتر از پنج باشد",
  })
  @Transform(({ value }) => parseInt(value, 10))
  hotelGrade: number;
  @ApiPropertyOptional()
  @Length(2, 50, { message: " نام هتل باید بین 2 تا 50 حرف باشد" })
  hotelName: string;
  @ApiProperty({ default: "10000000" })
  price: string;
  @ApiProperty({ default: 30 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber({}, { message: "یک  مقدار از نوع عدد برای ظرفیت تور وارد کنید" })
  capacity: number;
  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType, {
    message: " نوع وسیله حمل و نقل را به درستی وراد کنید",
  })
  travelType: string;
  @ApiPropertyOptional({ example: "1000000" })
  insuranceAmount: string;
  @ApiPropertyOptional({ enum: TourLeaderStatus })
  @IsEnum(TourLeaderStatus, {
    message: " وضعیت تور لیدر را به درستی مشخص کنید",
  })
  tourLeaderStatus: string;
}
