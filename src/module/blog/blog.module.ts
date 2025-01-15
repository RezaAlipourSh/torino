import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogEntity } from "./entities/blog.entity";
import { BlogCommentEntity } from "./entities/blogcomments.entity";
import { S3Service } from "../s3/s3.service";
import { AuthModule } from "../auth/auth.module";
import { BlogController } from "./controllers/blog.controller";
import { BlogService } from "./Services/blog.service";
import { CommentController } from "./controllers/blog.comment.controller";
import { BlogCommentService } from "./Services/blog.comment.service";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([BlogEntity, BlogCommentEntity]),
  ],
  controllers: [BlogController, CommentController],
  providers: [BlogService, S3Service, BlogCommentService],
})
export class BlogModule {}
