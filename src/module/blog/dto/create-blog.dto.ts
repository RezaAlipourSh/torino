import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, Length } from "class-validator";
import { BlogStatus } from "../enum/blogStatus.enum";

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
}
