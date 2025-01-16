import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { CommentStatus } from "../enum/commentStatus.enum";

export const CommentFilter = () =>
  applyDecorators(
    ApiQuery({ name: "blogId", type: Number, required: false }),
    ApiQuery({ name: "userId", type: Number, required: false }),
    ApiQuery({ name: "comment", type: String, required: false }),
    ApiQuery({
      name: "commentStatus",
      type: String,
      required: false,
      enum: CommentStatus,
    }),
    ApiQuery({ name: "parentId", type: Number, required: false }),
    ApiQuery({
      name: "updated_from",
      type: String,
      required: false,
      description: "2024-10-01T17:28:22.663Z",
    }),
    ApiQuery({
      name: "updated_to",
      type: String,
      required: false,
      description: "2024-10-01T17:28:22.663Z",
    }),
    ApiQuery({
      name: "created_from",
      type: String,
      required: false,
      description: "2024-10-01T17:28:22.663Z",
    }),
    ApiQuery({
      name: "created_to",
      type: String,
      required: false,
      description: "2024-10-01T17:28:22.663Z",
    })
  );
