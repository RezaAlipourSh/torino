import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, Length } from "class-validator";
import { BlogStatus } from "../enum/blogStatus.enum";
import { Transform } from "class-transformer";

export class CreateBlogDto {
  @ApiProperty()
  @Length(3, 100)
  title: string;
  @ApiProperty()
  @Length(15, 200)
  description: string;
  @ApiProperty()
  content: string;
  @ApiProperty({ format: "binary" })
  image: string;
  @ApiPropertyOptional({ enum: BlogStatus })
  @IsEnum(BlogStatus)
  blogStatus: string;
  @ApiPropertyOptional({ example: 4 })
  readTime: number;
  @ApiPropertyOptional({ description: "ایدی دسته‌بندی موردنظر" })
  categoryId: number;
}

export class ChangeBlogStatus {
  @ApiProperty({ enum: BlogStatus })
  @IsEnum(BlogStatus)
  Status: String;
}
