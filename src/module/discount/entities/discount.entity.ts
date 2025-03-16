import { EntityNames } from "src/common/enum/entity-name.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DiscountType } from "../discountType.enum";
import { BasketEntity } from "src/module/basket/entities/basket.entity";
import { TourEntity } from "src/module/tour/entities/tour.entity";

@Entity(EntityNames.Discount)
export class DiscountEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column({ unique: true })
  code: string;
  @Column({ default: true })
  isActive: boolean;
  @Column({ nullable: true, type: "decimal" })
  amount: number;
  @Column({ nullable: true, type: "decimal" })
  percent: number;
  @Column({ default: false })
  forNewComers: boolean;
  @Column({ nullable: true })
  limit: number;
  @Column({ default: 0 })
  usage: number;
  @Column({ nullable: true })
  buylimit: number;
  @Column({ nullable: true, type: "timestamp" })
  expiresIn: Date;
  @Column({ nullable: true })
  tourId: number;
  @Column({ type: "enum", enum: DiscountType })
  type: string;
  @CreateDateColumn()
  createdAt: Date;
  @OneToMany(() => BasketEntity, (basket) => basket.discount)
  baskets: BasketEntity[];
  @ManyToOne(() => TourEntity, (tour) => tour.discounts, {
    onDelete: "SET NULL",
  })
  tour: TourEntity;
}
