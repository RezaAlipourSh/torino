import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { BlogStatus } from "../enum/blogStatus.enum";

export const BlogFilter = () =>
  applyDecorators(
    ApiQuery({ name: "title", type: String, required: false }),
    ApiQuery({ name: "description", type: String, required: false }),
    ApiQuery({ name: "content", type: String, required: false }),
    ApiQuery({
      name: "blogStatus",
      type: String,
      required: false,
      enum: BlogStatus,
    }),
    ApiQuery({ name: "readTime", type: Number, required: false }),
    ApiQuery({ name: "authorId", type: Number, required: false }),
    ApiQuery({
      name: "from_date",
      type: String,
      required: false,
      description: "2024-10-01T17:28:22.663Z",
    }),
    ApiQuery({
      name: "to_date",
      type: String,
      required: false,
      description: "2024-10-01T17:28:22.663Z",
    })
  );
