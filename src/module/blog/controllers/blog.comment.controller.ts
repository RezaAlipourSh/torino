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
import { CreateCommentDto } from "../dto/create-comment.dto";

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

  //   @Get()
  //   findAll() {
  //     return this.blogService.findAll();
  //   }

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

  //   @Delete(":id")
  //   remove(@Param("id", ParseIntPipe) id: number) {
  //     return this.blogService.remove(id);
  //   }
}
