import { EntityNames } from "src/common/enum/entity-name.enum";
import { DiscountEntity } from "src/module/discount/entities/discount.entity";
import { TourEntity } from "src/module/tour/entities/tour.entity";
import { UserEntity } from "src/module/user/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity(EntityNames.Basket)
export class BasketEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  tourId: number;
  @Column()
  userId: number;
  @Column()
  count: number;
  @Column({ nullable: true })
  discountId: number;
  @ManyToOne(() => TourEntity, (tour) => tour.baskets, { onDelete: "CASCADE" })
  tour: TourEntity;
  @ManyToOne(() => UserEntity, (user) => user.basket, { onDelete: "CASCADE" })
  user: UserEntity;
  @ManyToOne(() => DiscountEntity, (discount) => discount.baskets, {
    onDelete: "SET NULL",
  })
  discount: DiscountEntity;
  @CreateDateColumn()
  createdAt: Date;
}
