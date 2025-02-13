import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  Param,
  Delete,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { AddUserBankAccountDto } from "./dto/create-user.dto";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { RoleAccess } from "src/common/decorator/role.decorator";
import { Roles } from "src/common/enum/role.enum";
import { Pagination } from "src/common/decorator/pagination.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { UserFilter } from "./decorator/userFilter.decorator";
import { UserFilterDto } from "./dto/userFilter.dto";
import { FormType } from "src/common/enum/formType.enum";

@Controller("user")
@ApiTags("User")
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @Get()
  @RoleAccess(Roles.Admin)
  @Pagination()
  @UserFilter()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query() userFilterDto: UserFilterDto
  ) {
    return this.userService.findAll(paginationDto, userFilterDto);
  }

  @Post("/AddBankData")
  @ApiConsumes(FormType.Urlencoded, FormType.Json)
  AddBankData(@Body() dto: AddUserBankAccountDto) {
    return this.userService.addBankData(dto);
  }

  // @Get(":id")
  // findOne(@Param("id") id: string) {
  //   return this.userService.findOne(+id);
  // }

  @Get("/UserBankData")
  GetUserBankData() {
    return this.userService.getUserBankData();
  }

  @Get("/UserBankDataByAdmin/:id")
  @RoleAccess(Roles.Admin)
  GetUserBankDataByAdmin(@Param("id", ParseIntPipe) id: number) {
    return this.userService.getUserBankDataByAdmin(id);
  }

  // @Patch(":id")
  // update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  @Delete("/userBankData/:id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.userService.removeUserBankData(id);
  }
}
