import { EntityNames } from "src/common/enum/entity-name.enum";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity(EntityNames.UserBankAccount)
export class userBankAccountEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  userId: number;
  @Column({ nullable: true, unique: true })
  shabaNumber: string;
  @Column({ nullable: true, unique: true })
  accountNumber: string;
  @Column({ nullable: true, unique: true })
  cardNumber: string;
  @ManyToOne(() => UserEntity, (user) => user.bankAccounts, {
    onDelete: "CASCADE",
  })
  user: UserEntity;
}
