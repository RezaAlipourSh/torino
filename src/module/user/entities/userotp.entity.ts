import { EntityNames } from "src/common/enum/entity-name.enum";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity(EntityNames.UserOtp)
export class UserOtpEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  code: string;
  @Column()
  expires_in: Date;
  @Column()
  userId: number;
  @OneToOne(() => UserEntity, (user) => user.otp)
  user: UserEntity;
}
