import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Length } from "class-validator";

export class CategoryDto {
  @ApiProperty()
  @Length(2, 20)
  name: string;
  @ApiProperty({ format: "binary" })
  image: string;
  @ApiProperty()
  isActive: boolean;
  @ApiPropertyOptional()
  parentId: number;
}

export class updateCategoryDto extends PartialType(CategoryDto) {}

export class categoryStatus {
  @ApiProperty()
  isActive: boolean;
}
