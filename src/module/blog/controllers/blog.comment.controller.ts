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
import { CreateBlogDto } from "../dto/create-blog.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { BlogCommentService } from "../Services/blog.comment.service";
import {
  ChangeCommentStatus,
  CreateCommentDto,
} from "../dto/create-comment.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { commentFilterDto } from "../dto/commentFilter.dto";
import { Pagination } from "src/common/decorator/pagination.decorator";
import { CommentFilter } from "../decorator/commentFilter.decorator";

@Controller("comment")
@ApiTags("Comments")
@AuthDecorator()
export class CommentController {
  constructor(private readonly commentService: BlogCommentService) {}

  @Post()
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  create(
    @Body()
    commentDto: CreateCommentDto
  ) {
    return this.commentService.create(commentDto);
  }

  @Get()
  @Pagination()
  @CommentFilter()
  @RoleAccess(Roles.Admin)
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: commentFilterDto
  ) {
    return this.commentService.findAll(paginationDto, filterDto);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.commentService.findCommentsOfBlogById(id);
  }

  //   @Patch(":id")
  //   @ApiConsumes(FormType.Multipart)
  //   @UseInterceptors(UploadFileS3("image"))
  //   update(
  //     @UploadedFile(
  //       new ParseFilePipe({
  //         validators: [
  //           new MaxFileSizeValidator({ maxSize: 1 * 1024 * 1024 }),
  //           new FileTypeValidator({ fileType: "image/(png|jpg|jpeg|webp)" }),
  //         ],
  //       })
  //     )
  //     image: Express.Multer.File,
  //     @Param("id", ParseIntPipe) id: number,
  //     @Body() updateBlogDto: UpdateBlogDto
  //   ) {
  //     return this.blogService.update(id, image, updateBlogDto);
  //   }

  @Patch("/status/:id")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  @RoleAccess(Roles.Admin)
  updateCommentStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() status: ChangeCommentStatus
  ) {
    return this.commentService.changeCommentStatus(id, status);
  }

  @Delete(":id")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.commentService.deleteComment(id);
  }
}
