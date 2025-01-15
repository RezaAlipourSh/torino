import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";
import { UserGender, UserRole } from "../enum/user.enum";

export const UserFilter = () =>
  applyDecorators(
    ApiQuery({ name: "first_name", type: String, required: false }),
    ApiQuery({ name: "last_name", type: String, required: false }),
    ApiQuery({ name: "mobile", type: String, required: false }),
    ApiQuery({ name: "national_code", type: String, required: false }),
    ApiQuery({ name: "email", type: String, required: false }),
    ApiQuery({
      name: "Gender",
      type: String,
      required: false,
      enum: UserGender,
    }),
    ApiQuery({ name: "role", type: String, required: false, enum: UserRole }),
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
