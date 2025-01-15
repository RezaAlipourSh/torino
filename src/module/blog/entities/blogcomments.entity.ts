import { EntityNames } from "src/common/enum/entity-name.enum";
import { UserEntity } from "src/module/user/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BlogEntity } from "./blog.entity";
import { CommentStatus } from "../enum/commentStatus.enum";

@Entity(EntityNames.BlogComment)
export class BlogCommentEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  blogId: number;
  @Column()
  userId: number;
  @Column()
  comment: string;
  @Column({ type: "enum", enum: CommentStatus, default: CommentStatus.Pending })
  commentStatus: string;
  @Column({ nullable: true })
  parentId: number;
  @CreateDateColumn({ nullable: true })
  updatedAt: Date;
  @CreateDateColumn()
  createdAt: Date;
  @ManyToOne(() => UserEntity, (user) => user.comments, { onDelete: "CASCADE" })
  user: UserEntity;
  @ManyToOne(() => BlogEntity, (blog) => blog.comments, { onDelete: "CASCADE" })
  blog: BlogEntity;
  @ManyToOne(() => BlogCommentEntity, (parent) => parent.children, {
    onDelete: "NO ACTION",
  })
  parent: BlogCommentEntity;
  @OneToMany(() => BlogCommentEntity, (children) => children.parent)
  children: BlogCommentEntity[];
}
