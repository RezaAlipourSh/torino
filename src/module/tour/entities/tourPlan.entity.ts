import { EntityNames } from "src/common/enum/entity-name.enum";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TourEntity } from "./tour.entity";

@Entity(EntityNames.TourPlan)
export class TourPlanEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  tourId: number;
  @Column()
  day: number;
  @Column()
  description: string;
  @ManyToOne(() => TourEntity, (tour) => tour.plans, { onDelete: "CASCADE" })
  tour: TourEntity;
}
