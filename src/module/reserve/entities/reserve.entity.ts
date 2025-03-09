import { EntityNames } from "src/common/enum/entity-name.enum";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ReserveStatus } from "../reserve.status";
import { UserEntity } from "src/module/user/entities/user.entity";
import { PaymentEntity } from "src/module/payment/entities/payment.entity";

@Entity(EntityNames.Reserve)
export class ReserveEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  userId: number;
  @Column()
  totalAmount: number;
  @Column({ type: "enum", enum: ReserveStatus, default: ReserveStatus.Pending })
  status: string;
  @Column({ nullable: true })
  description: string;
  @ManyToOne(() => UserEntity, (user) => user.reserves, { onDelete: "CASCADE" })
  user: UserEntity;
  @OneToOne(() => PaymentEntity, (payment) => payment.reserve)
  @JoinColumn()
  payment: PaymentEntity;
}
