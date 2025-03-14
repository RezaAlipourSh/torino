import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import {
  DeepPartial,
  FindOptionsWhere,
  ILike,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { ChangeBlogStatus, CreateBlogDto } from "../dto/create-blog.dto";
import { BlogEntity } from "../entities/blog.entity";
import { S3Service } from "src/module/s3/s3.service";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { BlogFilterDto } from "../dto/blogFilter.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utility/paginatiion.util";
import { isDate, isEnum } from "class-validator";
import { BlogStatus } from "../enum/blogStatus.enum";
import { EntityNames } from "src/common/enum/entity-name.enum";
import { CategoryService } from "src/module/category/category.service";
import { ToNumber } from "src/common/utility/Number.util";

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity) private blogRepo: Repository<BlogEntity>,
    @Inject(REQUEST) private req: Request,
    private s3service: S3Service,
    private categoryService: CategoryService
  ) {}
  async create(image: Express.Multer.File, createBlogDto: CreateBlogDto) {
    const { id } = this.req.user;
    const { blogStatus, content, description, readTime, title, categoryId } =
      createBlogDto;
    await this.findOneByTitle(title);
    const category = await this.categoryService.findOneById(
      ToNumber(categoryId)
    );
    if (category.isActive == false)
      throw new BadRequestException(
        "دسته‌بندی فعال نیست . از دسته‌بندی های فعال استفاده کنید"
      );
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
      categoryId: ToNumber(categoryId),
    });

    return {
      message: `مقاله ${title} با موفقیت ساخته شد`,
    };
  }

  async findAll(paginationDto: PaginationDto, filterDto: BlogFilterDto) {
    const { limit, page, skip } = paginationSolver(
      paginationDto.page,
      paginationDto.limit
    );

    const {
      authorId,
      blogStatus,
      content,
      description,
      from_date,
      readTime,
      title,
      to_date,
      categoryId,
    } = filterDto;

    const where: FindOptionsWhere<BlogEntity> = {};

    if (authorId && !isNaN(parseInt(authorId))) {
      where.authorId = parseInt(authorId);
    }
    if (categoryId) {
      where.categoryId = ToNumber(categoryId);
    }

    if (readTime && !isNaN(parseInt(readTime))) {
      where.readTime = parseInt(readTime);
    }

    if (content && content.length < 2) {
      where.content = ILike(`%${content}%`);
    }

    if (description && description.length < 2) {
      where.description = ILike(`%${description}%`);
    }
    if (title && title.length < 2) {
      where.title = ILike(`%${title}%`);
    }
    if (blogStatus && isEnum(blogStatus, BlogStatus)) {
      where.blogStatus = blogStatus;
    }
    if (
      from_date &&
      to_date &&
      isDate(new Date(from_date)) &&
      isDate(new Date(to_date))
    ) {
      let from = new Date(new Date(from_date).setUTCHours(0, 0, 0));
      let to = new Date(new Date(to_date).setUTCHours(0, 0, 0));
      where.createdAt = (MoreThanOrEqual(from), LessThanOrEqual(to));
    } else if (from_date && isDate(new Date(from_date))) {
      let from = new Date(new Date(from_date).setUTCHours(0, 0, 0));
      where.createdAt = MoreThanOrEqual(from);
    } else if (to_date && isDate(new Date(to_date))) {
      let to = new Date(new Date(to_date).setUTCHours(0, 0, 0));
      where.createdAt = LessThanOrEqual(to);
    }

    const [blogs, count] = await this.blogRepo
      .createQueryBuilder(EntityNames.Blog)
      .leftJoin("blog.author", "author")
      .leftJoin("blog.category", "category")
      .leftJoin(
        "blog.comments",
        "comments",
        "comments.commentStatus = :status",
        { status: "accepted" }
      )
      .leftJoin("comments.children", "children")
      .addSelect([
        "category.name",
        "author.mobile",
        "author.last_name",
        "comments.comment",
        "comments.id",
        "children",
      ])
      .where(where)
      .orderBy("blog.id", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      pagination: paginationGenerator(count, page, limit),
      blogs,
    };
  }

  async findOneById(id: number) {
    const blog = await this.blogRepo.findOne({
      where: {
        id,
        comments: {
          parentId: IsNull(),
        },
      },
      relations: {
        author: true,
        comments: {
          children: true,
        },
        category: true,
      },
      select: {
        category: {
          name: true,
          image: true,
        },
        author: {
          last_name: true,
          mobile: true,
          born: true,
          blogs: true,
        },
        comments: {
          parent: {
            id: true,
            comment: true,
            userId: true,
            createdAt: true,
            children: {
              id: true,
              comment: true,
              userId: true,
              createdAt: true,
            },
          },
          id: true,
          comment: true,
          userId: true,
          createdAt: true,
          children: {
            id: true,
            comment: true,
            userId: true,
            createdAt: true,
          },
        },
      },
      order: { id: "DESC" },
    });

    if (!blog)
      throw new NotFoundException("این مقاله با ایدی مورد نظر یافت نشد");
    return blog;
  }

  async changeBlogStatus(blogId: number, statusDto: ChangeBlogStatus) {
    const { Status } = statusDto;

    const blog = await this.findOneById(blogId);
    if (blog.blogStatus === Status) {
      throw new BadRequestException(
        `وضعیت بلاگ همانند قبل ${blog.blogStatus} ماند`
      );
    }
    await this.blogRepo.update(
      { id: blogId },
      { blogStatus: Status as string }
    );

    return {
      message: "وضعیت بلاگ به درستی تغییر یافت",
      status: Status,
    };
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
    const { blogStatus, content, description, readTime, title, categoryId } =
      updateBlogDto;
    console.log(image, typeof image);

    const blog = await this.findOneById(id);
    const updateObject: DeepPartial<BlogEntity> = {};
    if (categoryId) {
      const category = await this.categoryService.findOneById(
        ToNumber(categoryId)
      );
      if (category.isActive == false)
        throw new BadRequestException(
          "دسته‌بندی فعال نیست . از دسته‌بندی های فعال استفاده کنید"
        );
      updateObject.categoryId = ToNumber(categoryId);
    }
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
