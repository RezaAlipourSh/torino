import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import {
  CategoryDto,
  categoryStatus,
  updateCategoryDto,
} from "./dto/category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoryEntity } from "./entities/category.entity";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import {
  DeepPartial,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { S3Service } from "../s3/s3.service";
import { ToNumber } from "src/common/utility/Number.util";
import { ToBoolean } from "src/common/utility/boolean.util";
import { CategoryFilterDto } from "./dto/categoryFilter.dto";
import { isDate } from "class-validator";

@Injectable({ scope: Scope.REQUEST })
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepo: Repository<CategoryEntity>,
    @Inject(REQUEST) private req: Request,
    private s3Service: S3Service
  ) {}

  async create(image: Express.Multer.File, dto: CategoryDto) {
    const { id: userId } = this.req.user;
    const { isActive, name, parentId } = dto;
    const { Key, Location } = await this.s3Service.uploadFile(
      image,
      "categoryImage"
    );
    await this.findOneByName(name);
    if (parentId) {
      await this.findOneById(ToNumber(parentId));
    }
    const category = this.categoryRepo.create({
      isActive: ToBoolean(isActive),
      name,
      parentId: parentId ?? null,
      creatorId: userId,
      image: Location,
      imageKey: Key,
    });
    await this.categoryRepo.save(category);

    return {
      message: "دسته بندی با موفقیت ثبت شد",
      "نام دسته بندی ثبت شده": name,
    };
  }

  async update(id: number, image: Express.Multer.File, dto: updateCategoryDto) {
    const category = await this.findOneById(ToNumber(id));
    const { isActive, name, parentId } = dto;
    const updateObject: DeepPartial<CategoryEntity> = {};
    if (image) {
      const { Key, Location } = await this.s3Service.uploadFile(
        image,
        "categoryImage"
      );
      updateObject.image = Location;
      updateObject.imageKey = Key;
      if (category?.imageKey) {
        await this.s3Service.deleteFile(category?.imageKey);
      }
    }
    if (isActive) updateObject.isActive = ToBoolean(isActive);
    if (name) {
      await this.findOneByName(name);
      updateObject.name = name;
    }
    if (parentId) {
      await this.findOneById(ToNumber(parentId));
      updateObject.parentId = ToNumber(parentId);
    }

    await this.categoryRepo.update({ id }, updateObject);
    return {
      message: "دسته بندی به درستی ویرایش شد",
    };
  }

  async findAll(filterDto: CategoryFilterDto) {
    const { creatorId, from_date, isActive, name, parentId, to_date } =
      filterDto;
    const where: FindOptionsWhere<CategoryEntity> = {};
    if (isActive) where.isActive = ToBoolean(isActive);
    if (creatorId) where.creatorId = ToNumber(creatorId);
    if (parentId) where.parentId = ToNumber(parentId);
    if (name && name.length >= 2) where.name = name;
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

    const [categories, count] = await this.categoryRepo.findAndCount({
      where,
      order: { id: "DESC" },
    });

    return {
      count,
      categories,
    };
  }

  async findOneById(id: number) {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) throw new NotFoundException("دسته بندی یافت نشد");
    return category;
  }

  async findOneByName(name: string) {
    const category = await this.categoryRepo.findOneBy({ name });
    if (category)
      throw new ConflictException(
        "یک دسته بندی با این نام از قبل موجود می باشد"
      );
    return true;
  }

  async delete(id: number) {
    const category = await this.findOneById(ToNumber(id));
    await this.s3Service.deleteFile(category.imageKey);
    await this.categoryRepo.remove(category);
    return {
      message: "دسته بندی با موفقیت حذف شد",
    };
  }

  async changeCategoryStatus(id: number, dto: categoryStatus) {
    const { isActive } = dto;
    const category = await this.findOneById(ToNumber(id));
    if (category.isActive == ToBoolean(isActive)) {
      throw new ConflictException(
        "وضعیت دسته بندی نسبت به قبل تغییر نیافته است"
      );
    }
    await this.categoryRepo.update({ id }, { isActive: ToBoolean(isActive) });
    return {
      message: "وضعیت دسته بندی به درستی تغییر یافت",
    };
  }
}
