import { EntityNames } from "src/common/enum/entity-name.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserOtpEntity } from "./userotp.entity";

@Entity(EntityNames.User)
export class UserEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column({ nullable: true })
  first_name: string;
  @Column({ nullable: true })
  last_name: string;
  @Column({ unique: true })
  mobile: string;
  @Column({ nullable: true, unique: true })
  email: string;
  @Column({ unique: true, nullable: true })
  invite_code: string;
  @Column({ nullable: true, default: false })
  mobile_verify: boolean;
  @CreateDateColumn()
  created_at: Date;
  @Column({ nullable: true })
  otpId: number;
  @OneToOne(() => UserOtpEntity, (otp) => otp.user)
  @JoinColumn()
  otp: UserOtpEntity;
}
