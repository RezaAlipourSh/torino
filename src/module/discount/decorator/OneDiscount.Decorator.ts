import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { DiscountType } from "../discountType.enum";

export const OneDiscountFilter = () =>
  applyDecorators(
    ApiQuery({ name: "code", type: String, required: false }),
    ApiQuery({ name: "id", type: Number, required: false })
  );

export const DiscountFilter = () =>
  applyDecorators(
    ApiQuery({ name: "code", type: String, required: false }),
    ApiQuery({
      name: "type",
      type: String,
      required: false,
      enum: DiscountType,
    }),
    ApiQuery({ name: "isActive", type: Boolean, required: false }),
    ApiQuery({ name: "forNewComers", type: Boolean, required: false }),
    ApiQuery({ name: "amount", type: Number, required: false }),
    ApiQuery({ name: "percent", type: Number, required: false }),
    ApiQuery({ name: "discountLimit", type: Number, required: false }),
    ApiQuery({ name: "usage", type: Number, required: false }),
    ApiQuery({ name: "tourId", type: Number, required: false }),
    ApiQuery({ name: "buylimit", type: Number, required: false }),
    ApiQuery({
      name: "expires_from_date",
      type: String,
      required: false,
      description: "2024-10-01T17:28:22.663Z",
    }),
    ApiQuery({
      name: "expires_to_date",
      type: String,
      required: false,
      description: "2024-10-01T17:28:22.663Z",
    }),
    ApiQuery({
      name: "created_from_date",
      type: String,
      required: false,
      description: "2024-10-01T17:28:22.663Z",
    }),
    ApiQuery({
      name: "created_to_date",
      type: String,
      required: false,
      description: "2024-10-01T17:28:22.663Z",
    })
  );
