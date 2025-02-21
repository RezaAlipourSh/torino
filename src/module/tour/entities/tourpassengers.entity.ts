import { EntityNames } from "src/common/enum/entity-name.enum";
import { UserGender } from "src/module/user/enum/user.enum";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TourEntity } from "./tour.entity";
import { UserEntity } from "src/module/user/entities/user.entity";

@Entity(EntityNames.TourPassengers)
export class TourPassengersEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  tourId: number;
  @Column()
  ticketBuyerId: number;
  @Column({ nullable: true })
  fullName: string;
  @Column()
  national_code: string;
  @Column()
  mobile: string;
  @Column({ type: "enum", enum: UserGender, default: UserGender.Man })
  Gender: string;
  @ManyToOne(() => TourEntity, (tour) => tour.passengers, {
    onDelete: "CASCADE",
  })
  tour: TourEntity;
  @ManyToOne(() => UserEntity, (user) => user.companions, {
    onDelete: "CASCADE",
  })
  user: UserEntity;
}
