import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

export const CategoryFilter = () =>
  applyDecorators(
    ApiQuery({ name: "title", type: String, required: false }),
    ApiQuery({ name: "parentId", type: Number, required: false }),
    ApiQuery({ name: "creatorId", type: Number, required: false }),
    ApiQuery({ name: "isActive", type: Boolean, required: false }),
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
