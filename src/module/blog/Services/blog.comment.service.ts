import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { CreateBlogDto } from "../dto/create-blog.dto";
import { BlogEntity } from "../entities/blog.entity";
import { S3Service } from "src/module/s3/s3.service";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { BlogCommentEntity } from "../entities/blogcomments.entity";
import { CreateCommentDto } from "../dto/create-comment.dto";
import { BlogService } from "./blog.service";
import { BlogStatus } from "../enum/blogStatus.enum";

@Injectable({ scope: Scope.REQUEST })
export class BlogCommentService {
  constructor(
    @InjectRepository(BlogCommentEntity)
    private commentRepo: Repository<BlogCommentEntity>,
    @Inject(REQUEST) private req: Request,
    private blogService: BlogService
  ) {}

  async create(commentDto: CreateCommentDto) {
    const { blogId, comment, parentId } = commentDto;
    console.log(blogId, typeof blogId, comment, parentId, typeof parentId);
    const { id } = this.req.user;
    const blog = await this.blogService.findOneById(blogId);
    if (blog.blogStatus === BlogStatus.Publish) {
      const comments = this.commentRepo.create({
        blogId,
        comment,
        parentId: parentId ?? null,
        userId: id,
      });
      await this.commentRepo.save(comments);

      return {
        message: "نظر شما با موفقیت ارسال شد",
      };
    } else {
      throw new NotFoundException("همچین مقاله ای یافت نشد");
    }
  }

  //   findAll() {
  //     return `This action returns all blog`;
  //   }

  async findCommentsOfBlogById(id: number) {
    await this.blogService.findOneById(id);
    const comments = await this.commentRepo.find({
      where: { blogId: id },
      relations: {
        children: true,
      },
      select: {
        children: true,
        parent: {
          id: true,
        },
      },
    });
    if (!comments)
      throw new NotFoundException("نظر یا کامنتی برای این مقاله یافت نشد");
    return comments;
  }

  //   async findOneByTitle(title: string) {
  //     const blog = await this.blogRepo.findOne({ where: { title } });
  //     if (blog)
  //       throw new ConflictException(
  //         "اسم مقاله تکراری است . لطفا از اسم دیگری استفاده کنید"
  //       );
  //     return blog;
  //   }

  //   async update(
  //     id: number,
  //     image: Express.Multer.File,
  //     updateBlogDto: UpdateBlogDto
  //   ) {
  //     const { blogStatus, content, description, readTime, title } = updateBlogDto;
  //     const blog = await this.findOneById(id);
  //     const updateObject: DeepPartial<BlogEntity> = {};
  //     if (image) {
  //       const { Key, Location } = await this.s3service.uploadFile(
  //         image,
  //         "blogImage"
  //       );
  //       if (Location) {
  //         (updateObject.image = Location), (updateObject.imageKey = Key);
  //         if (blog?.imageKey) {
  //           await this.s3service.deleteFile(blog?.imageKey);
  //         }
  //       }
  //     }
  //     if (blogStatus) updateObject.blogStatus = blogStatus;
  //     if (content) updateObject.content = content;
  //     if (description) updateObject.description = description;
  //     if (readTime) updateObject.readTime = readTime;
  //     if (title) updateObject.title = title;

  //     await this.blogRepo.update({ id }, updateObject);

  //     return {
  //       message: "مقاله مورد نظر با موفقیت ویرایش شد.",
  //     };
  //   }

  //   async remove(id: number) {
  //     const blog = await this.findOneById(id);
  //     await this.s3service.deleteFile(blog.imageKey);
  //     await this.blogRepo.delete({ id });

  //     return {
  //       message: "مقاله موردنظر حذف شد",
  //     };
  //   }
}
