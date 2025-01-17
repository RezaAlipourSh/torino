import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { BlogCommentEntity } from "../entities/blogcomments.entity";
import {
  ChangeCommentStatus,
  CreateCommentDto,
  UpdateCommentDto,
} from "../dto/create-comment.dto";
import { BlogService } from "./blog.service";
import { BlogStatus } from "../enum/blogStatus.enum";
import { EntityNames } from "src/common/enum/entity-name.enum";
import { CommentStatus } from "../enum/commentStatus.enum";
import { Roles } from "src/common/enum/role.enum";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utility/paginatiion.util";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { commentFilterDto } from "../dto/commentFilter.dto";
import { isDate, isEnum } from "class-validator";

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
    const { id: userId } = this.req.user;
    const blog = await this.blogService.findOneById(blogId);
    if (blog.blogStatus === BlogStatus.Publish) {
      const comments = this.commentRepo.create({
        blogId,
        comment,
        parentId: parentId ?? null,
        userId,
      });
      await this.commentRepo.save(comments);

      return {
        message: "نظر شما با موفقیت ارسال شد",
      };
    } else {
      throw new NotFoundException("همچین مقاله ای یافت نشد");
    }
  }

  async findAll(paginationDto: PaginationDto, filterDto: commentFilterDto) {
    const { limit, page, skip } = paginationSolver(
      paginationDto.page,
      paginationDto.limit
    );

    const {
      blogId,
      comment,
      commentStatus,
      created_from,
      created_to,
      parentId,
      updated_from,
      updated_to,
      userId,
    } = filterDto;

    const where: FindOptionsWhere<BlogCommentEntity> = {};

    if (blogId && !isNaN(blogId)) {
      where.blogId = blogId;
    }
    if (userId && !isNaN(userId)) {
      where.userId = userId;
    }

    if (parentId && !isNaN(parentId)) {
      where.parentId = parentId;
    }

    if (comment && comment.length < 2) {
      where.comment = ILike(`%${comment}%`);
    }

    if (commentStatus && isEnum(commentStatus, CommentStatus)) {
      where.commentStatus = commentStatus;
    }

    if (
      updated_from &&
      updated_to &&
      isDate(new Date(updated_from)) &&
      isDate(new Date(updated_to))
    ) {
      let from = new Date(new Date(updated_from).setUTCHours(0, 0, 0));
      let to = new Date(new Date(updated_to).setUTCHours(0, 0, 0));
      where.updatedAt = (MoreThanOrEqual(from), LessThanOrEqual(to));
    } else if (updated_from && isDate(new Date(updated_from))) {
      let from = new Date(new Date(updated_from).setUTCHours(0, 0, 0));
      where.updatedAt = MoreThanOrEqual(from);
    } else if (updated_to && isDate(new Date(updated_to))) {
      let to = new Date(new Date(updated_to).setUTCHours(0, 0, 0));
      where.updatedAt = LessThanOrEqual(to);
    }

    if (
      created_from &&
      created_to &&
      isDate(new Date(created_from)) &&
      isDate(new Date(created_to))
    ) {
      let from = new Date(new Date(created_from).setUTCHours(0, 0, 0));
      let to = new Date(new Date(created_to).setUTCHours(0, 0, 0));
      where.createdAt = (MoreThanOrEqual(from), LessThanOrEqual(to));
    } else if (created_from && isDate(new Date(created_from))) {
      let from = new Date(new Date(created_from).setUTCHours(0, 0, 0));
      where.createdAt = MoreThanOrEqual(from);
    } else if (created_to && isDate(new Date(created_to))) {
      let to = new Date(new Date(created_to).setUTCHours(0, 0, 0));
      where.createdAt = LessThanOrEqual(to);
    }

    const [comments, count] = await this.commentRepo
      .createQueryBuilder(EntityNames.BlogComment)
      .where(where)
      .orderBy("blog_comment.id", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      pagination: paginationGenerator(count, page, limit),
      comments,
    };
  }

  async findCommentsOfBlogById(id: number) {
    await this.blogService.findOneById(id);

    const comments = await this.commentRepo
      .createQueryBuilder(EntityNames.BlogComment)
      .where(
        "blog_comment.parentId IS Null AND blog_comment.commentStatus = :status",
        { status: CommentStatus.Accepted }
      )
      .leftJoin("blog_comment.children", "children1")
      .andWhere("children1.commentStatus  = :status", {
        status: CommentStatus.Accepted,
      })
      .leftJoin("children1.children", "children2")
      .andWhere("children2.commentStatus  = :status", {
        status: CommentStatus.Accepted,
      })
      .addSelect([
        "blog_comment.comment",
        "blog_comment.id",
        "blog_comment.userId",
        "blog_comment.parentId",
        "children1.comment",
        "children1.id",
        "children1.commentStatus",
        "children1.userId",
        "children1.parentId",
        "children2.comment",
        "children2.id",
        "children2.commentStatus",
        "children2.userId",
        "children2.parentId",
      ])
      .andWhere("blog_comment.blogId = :id", { id })
      .getOne();

    if (!comments)
      throw new NotFoundException("نظر یا کامنتی برای این مقاله یافت نشد");
    return comments;
  }

  async updateComment(id: number, updateDto: UpdateCommentDto) {
    const { id: userId } = this.req.user;
    const { blogId, comment, parentId } = updateDto;

    const commentData = await this.findOneById(id);

    const data: DeepPartial<BlogCommentEntity> = {};

    if (commentData.userId !== userId)
      throw new ForbiddenException(
        "شما نمیتوانید کامنت شخص دیگری را ویرایش کنید"
      );

    if (blogId && !isNaN(blogId)) {
      data.blogId = blogId;
    }
    if (parentId && !isNaN(parentId)) {
      data.parentId = parentId;
    }

    if (comment) {
      data.comment = comment;
    }

    data.updatedAt = new Date();

    await this.commentRepo.update({ id }, data);

    return {
      message: "کامنت مورد نظر به درستی ویرایش شد",
    };
  }

  async findOneById(id: number) {
    const comment = await this.commentRepo.findOneBy({ id });
    if (!comment) throw new NotFoundException("کامنت موردنظر یافت نشد");
    return comment;
  }

  async changeCommentStatus(id: number, status: ChangeCommentStatus) {
    const { Status } = status;

    const comment = await this.findOneById(id);
    if (comment.commentStatus === Status) {
      throw new BadRequestException(
        `وضعیت کامنت همانند قبل ${comment.commentStatus} ماند`
      );
    }
    await this.commentRepo.update({ id }, { commentStatus: Status as string });

    return {
      message: "وضعیت کامنت به درستی تغییر یافت",
      status: Status,
    };
  }

  async deleteComment(id: number) {
    const { id: userId } = this.req.user;
    const comment = await this.findOneById(id);
    if ((comment.userId = userId)) {
      await this.commentRepo.delete({ id });
      return {
        message: "نظر شما به درستی حذف شد",
      };
    } else if ((this.req.user.role = Roles.Admin)) {
      await this.commentRepo.delete({ id });
      return {
        message: "کامنت به درستی توسط ادمین حذف شد",
      };
    } else {
      throw new ForbiddenException(
        "این نظر فقط توسط سازنده آن یا ادمین میتواند حذف شود"
      );
    }
  }
}
