import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DiscountType } from "../discountType.enum";
import { IsEnum, Length } from "class-validator";

export class createDiscountDto {
  @ApiProperty()
  @Length(4, 20, { message: "کد تخفیف باید بین 4 تا 20 حرف باشد" })
  code: string;
  @ApiProperty({ default: true })
  isActive: boolean;
  @ApiPropertyOptional()
  amount: number;
  @ApiPropertyOptional()
  percent: number;
  @ApiProperty({ default: false })
  forNewComers: boolean;
  @ApiPropertyOptional()
  limit: number;
  @ApiPropertyOptional({
    description: "کد تخفیف برای خریدهای بالاتر از این مقدار باشد.",
  })
  buylimit: number;
  @ApiPropertyOptional({ example: "2025-05-01T07:31:39.614Z" })
  expiresIn: Date;
  @ApiPropertyOptional()
  tourId: number;
  @ApiProperty({
    enum: DiscountType,
  })
  @IsEnum(DiscountType, { message: "نوع کد تخفیف را به درستی وارد کنید" })
  type: string;
}

export class OneDiscountDto {
  @ApiPropertyOptional()
  code?: string;
  @ApiPropertyOptional()
  id?: number;
}
