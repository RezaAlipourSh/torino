import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "./entities/blog.entity";
import { DeepPartial, Repository } from "typeorm";
import { BlogCommentEntity } from "./entities/blogcomments.entity";
import { S3Service } from "../s3/s3.service";

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity) private blogRepo: Repository<BlogEntity>,
    @InjectRepository(BlogCommentEntity)
    private commentRepo: Repository<BlogCommentEntity>,
    @Inject(REQUEST) private req: Request,
    private s3service: S3Service
  ) {}
  async create(image: Express.Multer.File, createBlogDto: CreateBlogDto) {
    const { id } = this.req.user;
    const { blogStatus, content, description, readTime, title } = createBlogDto;
    await this.findOneByTitle(title);
    const { Key, Location } = await this.s3service.uploadFile(
      image,
      "blogImage"
    );
    await this.blogRepo.insert({
      title,
      content,
      description,
      image: Location,
      authorId: id,
      imageKey: Key,
      readTime,
      blogStatus,
    });

    return {
      message: `مقاله ${title} با موفقیت ساخته شد`,
    };
  }

  findAll() {
    return `This action returns all blog`;
  }

  async findOneById(id: number) {
    const blog = await this.blogRepo.findOneBy({ id });
    if (!blog)
      throw new NotFoundException("این مقاله با ایدی مورد نظر یافت نشد");
    return blog;
  }

  async findOneByTitle(title: string) {
    const blog = await this.blogRepo.findOne({ where: { title } });
    if (blog)
      throw new ConflictException(
        "اسم مقاله تکراری است . لطفا از اسم دیگری استفاده کنید"
      );
    return blog;
  }

  async update(
    id: number,
    image: Express.Multer.File,
    updateBlogDto: UpdateBlogDto
  ) {
    const { blogStatus, content, description, readTime, title } = updateBlogDto;
    const blog = await this.findOneById(id);
    const updateObject: DeepPartial<BlogEntity> = {};
    if (image) {
      const { Key, Location } = await this.s3service.uploadFile(
        image,
        "blogImage"
      );
      if (Location) {
        (updateObject.image = Location), (updateObject.imageKey = Key);
        if (blog?.imageKey) {
          await this.s3service.deleteFile(blog?.imageKey);
        }
      }
    }
    if (blogStatus) updateObject.blogStatus = blogStatus;
    if (content) updateObject.content = content;
    if (description) updateObject.description = description;
    if (readTime) updateObject.readTime = readTime;
    if (title) updateObject.title = title;

    await this.blogRepo.update({ id }, updateObject);

    return {
      message: "مقاله مورد نظر با موفقیت ویرایش شد.",
    };
  }

  async remove(id: number) {
    const blog = await this.findOneById(id);
    await this.s3service.deleteFile(blog.imageKey);
    await this.blogRepo.delete({ id });

    return {
      message: "مقاله موردنظر حذف شد",
    };
  }
}
