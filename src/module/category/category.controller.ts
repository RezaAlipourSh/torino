import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import {
  CategoryDto,
  categoryStatus,
  updateCategoryDto,
} from "./dto/category.dto";
import { UploadFileS3 } from "src/common/interceptors/upload-file.interceptor";
import { ApiConsumes } from "@nestjs/swagger";
import { FormType } from "src/common/enum/formType.enum";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { RoleAccess } from "src/common/decorator/role.decorator";
import { Roles } from "src/common/enum/role.enum";
import { CategoryFilter } from "./decorator/categoryFilter.decorator";
import { CategoryFilterDto } from "./dto/categoryFilter.dto";

@Controller("Category")
@AuthDecorator()
@RoleAccess(Roles.Admin)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiConsumes(FormType.Multipart)
  @UseInterceptors(UploadFileS3("image"))
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: "image/(png|jpg|jpeg|webp)" }),
        ],
      })
    )
    image: Express.Multer.File,
    @Body()
    createDto: CategoryDto
  ) {
    return this.categoryService.create(image, createDto);
  }

  @Get()
  @CategoryFilter()
  findAll(@Query() filterDto: CategoryFilterDto) {
    return this.categoryService.findAll(filterDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.categoryService.findOneById(+id);
  }

  @Patch(":id")
  @ApiConsumes(FormType.Multipart)
  @UseInterceptors(UploadFileS3("image"))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: updateCategoryDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: "image/(png|jpg|jpeg|webp)" }),
        ],
        fileIsRequired: false,
      })
    )
    image?: Express.Multer.File
  ) {
    return this.categoryService.update(id, image, updateDto);
  }

  @Patch("/status/:id")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  updateBlogStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() status: categoryStatus
  ) {
    return this.categoryService.changeCategoryStatus(id, status);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.categoryService.delete(id);
  }
}
