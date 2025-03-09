import { EntityNames } from "src/common/enum/entity-name.enum";
import { ReserveEntity } from "src/module/reserve/entities/reserve.entity";
import { UserEntity } from "src/module/user/entities/user.entity";
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity(EntityNames.Payment)
export class PaymentEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  userId: number;
  @Column()
  reserveId: number;
  @Column({ default: false })
  status: boolean;
  @Column()
  amount: number;
  @Column()
  invoiceNumber: string;
  @Column({ nullable: true })
  authority: string;
  @OneToOne(() => ReserveEntity, (reserve) => reserve.payment)
  reserve: ReserveEntity;
  @ManyToOne(() => UserEntity, (user) => user.payments, { onDelete: "CASCADE" })
  user: UserEntity;
}
