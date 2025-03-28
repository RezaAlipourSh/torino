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
import { TourPassengersEntity } from "src/module/tour/entities/tourpassengers.entity";
import { BasketEntity } from "src/module/basket/entities/basket.entity";
import { ReserveEntity } from "src/module/reserve/entities/reserve.entity";
import { PaymentEntity } from "src/module/payment/entities/payment.entity";
import { CategoryEntity } from "src/module/category/entities/category.entity";

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
  @Column({ default: 0 })
  bankInfo: number;
  @Column({ type: "enum", enum: UserRole, default: UserRole.User })
  role: string;
  @CreateDateColumn({ nullable: true })
  born: Date;
  @CreateDateColumn()
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
  @OneToMany(() => TourPassengersEntity, (passenger) => passenger.user)
  companions: TourPassengersEntity[];
  @OneToMany(() => BasketEntity, (basket) => basket.user)
  basket: BasketEntity[];
  @OneToMany(() => ReserveEntity, (reserve) => reserve.user)
  reserves: ReserveEntity[];
  @OneToMany(() => PaymentEntity, (payment) => payment.user)
  payments: PaymentEntity[];
  @OneToMany(() => CategoryEntity, (category) => category.creator)
  createdCategory: CategoryEntity[];
}
