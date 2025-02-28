import { EntityNames } from "src/common/enum/entity-name.enum";
import { TourEntity } from "src/module/tour/entities/tour.entity";
import { UserEntity } from "src/module/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
  @Column({ default: false })
  withMe: boolean;
  @Column("text", { array: true, nullable: true })
  companions: string[];
  @ManyToOne(() => TourEntity, (tour) => tour.baskets, { onDelete: "CASCADE" })
  tour: TourEntity;
  @ManyToOne(() => UserEntity, (user) => user.basket, { onDelete: "CASCADE" })
  user: UserEntity;
}
