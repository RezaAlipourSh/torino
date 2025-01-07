import { UserEntity } from "src/module/user/entities/user.entity";

declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;
    }
  }
}
