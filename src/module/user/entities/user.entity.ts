import { EntityNames } from "src/common/enum/entity-name.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserOtpEntity } from "./userotp.entity";
import { UserGender, UserRole } from "../enum/user.enum";
import { userBankAccountEntity } from "./user-bankAccount.entity";
import { BlogEntity } from "src/module/blog/entities/blog.entity";
import { BlogCommentEntity } from "src/module/blog/entities/blogcomments.entity";

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
  national_code: string;
  @Column({ nullable: true, unique: true })
  email: string;
  @Column({ unique: true, nullable: true })
  invite_code: string;
  @Column({ nullable: true, default: false })
  mobile_verify: boolean;
  @Column({ type: "enum", enum: UserGender, default: UserGender.Man })
  Gender: string;
  @Column({ type: "enum", enum: UserRole, default: UserRole.User })
  role: string;
  @CreateDateColumn({ nullable: true })
  born: Date;
  @CreateDateColumn({ select: false })
  created_at: Date;
  @Column({ nullable: true })
  otpId: number;
  @OneToOne(() => UserOtpEntity, (otp) => otp.user)
  @JoinColumn()
  otp: UserOtpEntity;
  @OneToMany(() => userBankAccountEntity, (bankAccount) => bankAccount.user)
  bankAccounts: userBankAccountEntity[];
  @OneToMany(() => BlogEntity, (blog) => blog.author)
  blogs: BlogEntity[];
  @OneToMany(() => BlogCommentEntity, (comment) => comment.user)
  comments: BlogCommentEntity[];
}
