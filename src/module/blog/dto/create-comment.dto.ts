import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsString, Length } from "class-validator";
import { CommentStatus } from "../enum/commentStatus.enum";

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

export class ChangeCommentStatus {
  @ApiProperty({ enum: CommentStatus })
  @IsEnum(CommentStatus)
  Status: String;
}

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
