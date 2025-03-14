import { EntityNames } from "src/common/enum/entity-name.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BlogStatus } from "../enum/blogStatus.enum";
import { UserEntity } from "src/module/user/entities/user.entity";
import { BlogCommentEntity } from "./blogcomments.entity";
import { CategoryEntity } from "src/module/category/entities/category.entity";

@Entity(EntityNames.Blog)
export class BlogEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  title: string;
  @Column()
  description: string;
  @Column()
  content: string;
  @Column()
  image: string;
  @Column({ nullable: true })
  imageKey: string;
  @Column({ type: "enum", enum: BlogStatus, default: BlogStatus.Draft })
  blogStatus: string;
  @Column({ default: 4 })
  readTime: number;
  @Column()
  authorId: number;
  @Column({ nullable: true })
  categoryId: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => UserEntity, (user) => user.blogs, { onDelete: "CASCADE" })
  author: UserEntity;
  @OneToMany(() => BlogCommentEntity, (comment) => comment.blog)
  comments: BlogCommentEntity[];
  @ManyToOne(() => CategoryEntity, (category) => category.blogs, {
    onDelete: "SET NULL",
  })
  category: CategoryEntity;
}
