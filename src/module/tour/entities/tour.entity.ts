import { EntityNames } from "src/common/enum/entity-name.enum";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { VehicleType } from "../enums/vehicle.enums";
import { TourLeaderStatus } from "../enums/tourLeader.enum";
import { TourPlanEntity } from "./tourPlan.entity";

@Entity(EntityNames.Tour)
export class TourEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  name: string;
  @Column()
  from: string;
  @Column()
  to: string;
  @Column()
  day: number;
  @Column({ nullable: true })
  night: number;
  @Column({ nullable: true })
  detail: string;
  @Column()
  startDate: Date;
  @Column({ nullable: true })
  returnDate: Date;
  @Column({ nullable: true })
  hotelGrade: number;
  @Column({ nullable: true })
  hotelName: string;
  @Column({ default: "10000000" })
  price: string;
  @Column({ default: 30 })
  capacity: number;
  @Column({ nullable: true })
  limit: number;
  @Column({ type: "enum", enum: VehicleType, default: VehicleType.AirPlane })
  travelType: string;
  @Column({ nullable: true })
  insuranceAmount: string;
  @Column({
    type: "enum",
    enum: TourLeaderStatus,
    default: TourLeaderStatus.None,
  })
  tourLeaderStatus: string;
  @OneToMany(() => TourPlanEntity, (plan) => plan.tour)
  plans: TourPlanEntity[];
}
