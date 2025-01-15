import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsString, Length } from "class-validator";

export class CreateCommentDto {
  @ApiProperty()
  @Transform(({ value }) => parseInt(value, 10))
  blogId: number;
  @ApiProperty()
  @IsString()
  @Length(3, 300, { message: "طول کامنت باید بین 3 تا 300 کاراکتر باشد." })
  comment: string;
  @ApiPropertyOptional()
  parentId: number;
}
