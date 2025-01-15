import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { FormType } from "src/common/enum/formType.enum";
import { UploadFileS3 } from "src/common/interceptors/upload-file.interceptor";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { RoleAccess } from "src/common/decorator/role.decorator";
import { Roles } from "src/common/enum/role.enum";
import { BlogService } from "../Services/blog.service";
import { ChangeBlogStatus, CreateBlogDto } from "../dto/create-blog.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { Pagination } from "src/common/decorator/pagination.decorator";
import { BlogFilter } from "../decorator/blogFilter.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { BlogFilterDto } from "../dto/blogFilter.dto";

@Controller("blog")
@ApiTags("Blog")
@AuthDecorator()
@RoleAccess(Roles.Admin)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

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
    createBlogDto: CreateBlogDto
  ) {
    return this.blogService.create(image, createBlogDto);
  }

  @Get()
  @Pagination()
  @BlogFilter()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: BlogFilterDto
  ) {
    return this.blogService.findAll(paginationDto, filterDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.blogService.findOneById(+id);
  }

  @Patch(":id")
  @ApiConsumes(FormType.Multipart)
  @UseInterceptors(UploadFileS3("image"))
  update(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: "image/(png|jpg|jpeg|webp)" }),
        ],
      })
    )
    image: Express.Multer.File,
    @Param("id", ParseIntPipe) id: number,
    @Body() updateBlogDto: UpdateBlogDto
  ) {
    return this.blogService.update(id, image, updateBlogDto);
  }

  @Patch("/status/:id")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  updateBlogStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() status: ChangeBlogStatus
  ) {
    return this.blogService.changeBlogStatus(id, status);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.remove(id);
  }
}
