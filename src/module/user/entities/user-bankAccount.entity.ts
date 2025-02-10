import { EntityNames } from "src/common/enum/entity-name.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";

@Entity(EntityNames.UserBankAccount)
export class userBankAccountEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  userId: number;
  @Column({ unique: true })
  iban: string;
  @Column({ nullable: true, unique: true })
  accountNumber: string;
  @Column({ nullable: true, unique: true })
  cardNumber: string;
  @Column()
  bank: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
  @ManyToOne(() => UserEntity, (user) => user.bankAccounts, {
    onDelete: "CASCADE",
  })
  user: UserEntity;
}
