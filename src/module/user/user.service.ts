import { Inject, Injectable, Scope } from "@nestjs/common";
import { AddUserBankAccountDto } from "./dto/create-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import {
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { PaginationDto } from "src/common/dto/pagination.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utility/paginatiion.util";
import { UserFilterDto } from "./dto/userFilter.dto";
import { UserGender, UserRole } from "./enum/user.enum";
import { isDate, isEmail, isEnum, isMobilePhone } from "class-validator";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { userBankAccountEntity } from "./entities/user-bankAccount.entity";
import { IbanNumber } from "src/common/enum/bankData.enum";
import { ValidateBank } from "./util/validateBank.function";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(userBankAccountEntity)
    private userBankRepo: Repository<userBankAccountEntity>,
    @Inject(REQUEST) private req: Request
  ) {}

  // create(createUserDto: CreateUserDto) {
  //   return "This action adds a new user";
  // }

  async findAll(paginationDto: PaginationDto, filterDto: UserFilterDto) {
    const {
      Gender,
      role,
      email,
      first_name,
      from_date,
      last_name,
      mobile,
      national_code,
      to_date,
    } = filterDto;

    const { limit, page, skip } = paginationSolver(
      paginationDto.page,
      paginationDto.limit
    );

    let where: FindOptionsWhere<UserEntity> = {};
    if (Gender && isEnum(Gender, UserGender)) {
      where.Gender = Gender;
    }
    if (role && isEnum(role, UserRole)) {
      where.role = role;
    }
    if (first_name && first_name.length > 2) {
      where.first_name = ILike(`%${first_name}%`);
    }
    if (last_name && last_name.length > 2) {
      where.last_name = ILike(`%${last_name}%`);
    }
    if (email && isEmail(email)) {
      where.email = email;
    }
    if (mobile && isMobilePhone(mobile, "fa-IR")) {
      where.mobile = mobile;
    }
    if (national_code && national_code.length === 10) {
      where.national_code = national_code;
    }
    if (
      from_date &&
      to_date &&
      isDate(new Date(from_date)) &&
      isDate(new Date(to_date))
    ) {
      let from = new Date(new Date(from_date).setUTCHours(0, 0, 0));
      let to = new Date(new Date(to_date).setUTCHours(0, 0, 0));
      where.born = (MoreThanOrEqual(from), LessThanOrEqual(to));
    } else if (from_date && isDate(new Date(from_date))) {
      let from = new Date(new Date(from_date).setUTCHours(0, 0, 0));
      where.born = MoreThanOrEqual(from);
    } else if (to_date && isDate(new Date(to_date))) {
      let to = new Date(new Date(to_date).setUTCHours(0, 0, 0));
      where.born = LessThanOrEqual(to);
    }

    const [users, count] = await this.userRepo.findAndCount({
      where,
      relations: {
        bankAccounts: true,
        blogs: true,
      },
      select: {
        bankAccounts: {
          accountNumber: true,
          cardNumber: true,
          iban: true,
        },
        blogs: {
          title: true,
          description: true,
          id: true,
          blogStatus: true,
          createdAt: true,
        },
      },
      skip,
      take: limit,
      order: { id: "DESC" },
    });

    return {
      pagination: paginationGenerator(count, page, limit),
      users,
    };
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

  async addBankData(dto: AddUserBankAccountDto) {
    try {
      const { id: userId } = this.req.user;
      const { accountNumber, cardNumber, iban } = dto;

      const validateAccountNumber = iban?.slice(-accountNumber?.length || -10);
      const validateCard = cardNumber?.substring(0, 6);
      const selectedIban = iban?.substring(4, 7);

      const validatedIban = ValidateBank(IbanNumber, selectedIban, "شماره شبا");

      return {
        userId,
        validateAccountNumber,
        iban,
        validateCard,
        selectedIban,
        validatedIban,
      };
    } catch (error) {
      throw error;
    }
  }
}
