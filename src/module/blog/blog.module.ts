import { Module } from "@nestjs/common";
import { BlogService } from "./blog.service";
import { BlogController } from "./blog.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogEntity } from "./entities/blog.entity";
import { BlogCommentEntity } from "./entities/blogcomments.entity";
import { S3Service } from "../s3/s3.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([BlogEntity, BlogCommentEntity]),
  ],
  controllers: [BlogController],
  providers: [BlogService, S3Service],
})
export class BlogModule {}
