import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

export const OneDiscountFilter = () =>
  applyDecorators(
    ApiQuery({ name: "code", type: String, required: false }),
    ApiQuery({ name: "id", type: Number, required: false })
  );
