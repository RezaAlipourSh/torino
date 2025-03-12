import { EntityNames } from "src/common/enum/entity-name.enum";
import { UserEntity } from "src/module/user/entities/user.entity";
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity(EntityNames.Category)
export class CategoryEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column({ unique: true })
  name: string;
  @Column()
  image: string;
  @Column({ nullable: true })
  imageKey: string;
  @Column({ nullable: true })
  parentId: number;
  @Column({ nullable: true })
  creatorId: number;
  @ManyToOne(() => CategoryEntity, (parent) => parent.children, {
    onDelete: "CASCADE",
  })
  parent: CategoryEntity;
  @OneToMany(() => CategoryEntity, (child) => child.parent)
  children: CategoryEntity[];
  @ManyToOne(() => UserEntity, (user) => user.createdCategory, {
    onDelete: "SET NULL",
  })
  creator: UserEntity;
}
