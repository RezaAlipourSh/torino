import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { AddUserBankAccountDto } from "./dto/create-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import {
  DeepPartial,
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
import { ValidateBankType } from "src/common/enum/bankData.enum";
import {
  ValidateBankAccount,
  ValidateIbanOrBankCard,
} from "./util/validateBank.function";
import { UpdateUserBankAccountDto } from "./dto/update-user.dto";

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

  async updateBankData(id: number, updateBankDto: UpdateUserBankAccountDto) {
    const { id: userId } = this.req.user;
    const bankDto = await this.getBankData(id);
    if (bankDto.userId !== userId)
      throw new ForbiddenException(
        "شما فقط قادر به ویرایش اطلاعات مالی مربوط به خود هستید"
      );

    const { accountNumber, cardNumber, iban } = updateBankDto;

    const newObject: DeepPartial<userBankAccountEntity> = {};

    if (iban) {
      await this.checkExistBankInfo(iban, ValidateBankType.Iban);
      const { validatedIban } = ValidateIbanOrBankCard(
        iban,
        ValidateBankType.Iban
      );
      if (bankDto.accountNumber) {
        ValidateBankAccount(bankDto.accountNumber, iban);
      }
      newObject.iban = iban;
      newObject.bank = validatedIban;
    }
    if (accountNumber) {
      await this.checkExistBankInfo(accountNumber, ValidateBankType.Account);
      if (iban) {
        ValidateBankAccount(accountNumber, iban);
      } else {
        ValidateBankAccount(accountNumber, bankDto.iban);
      }
      newObject.accountNumber = accountNumber;
    }
    if (cardNumber) {
      await this.checkExistBankInfo(cardNumber, ValidateBankType.Card);
      if (iban) {
        const { validatedIban } = ValidateIbanOrBankCard(
          iban,
          ValidateBankType.Iban
        );
        const { validatedCard } = ValidateIbanOrBankCard(
          cardNumber,
          ValidateBankType.Card
        );
        if (validatedCard !== validatedIban)
          throw new BadRequestException(
            "شماره کارت وارد شده به این شماره شبا تعلق ندارد"
          );
      } else {
        const { validatedIban } = ValidateIbanOrBankCard(
          bankDto.iban,
          ValidateBankType.Iban
        );
        const { validatedCard } = ValidateIbanOrBankCard(
          cardNumber,
          ValidateBankType.Card
        );
        if (validatedCard !== validatedIban)
          throw new BadRequestException(
            "شماره کارت وارد شده به  شماره شبا ثبت شده قبلی تعلق ندارد"
          );
      }

      newObject.cardNumber = cardNumber;
    }

    await this.userBankRepo.update({ id }, newObject);

    return {
      message: "اطلاعات مالی با موفقیت ویرایش شد ",
    };
  }

  async getBankData(id: number) {
    const bankData = await this.userBankRepo.findOneBy({ id });
    if (!bankData) throw new NotFoundException("اطلاعات مالی یافت نشد");

    return bankData;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

  async addBankData(dto: AddUserBankAccountDto) {
    try {
      const { id: userId } = this.req.user;
      const { accountNumber, cardNumber, iban } = dto;
      let validCard: string;

      await this.checkExistBankInfo(iban, ValidateBankType.Iban);
      const { validatedIban } = ValidateIbanOrBankCard(
        iban,
        ValidateBankType.Iban
      );

      if (accountNumber && accountNumber.length > 0) {
        await this.checkExistBankInfo(accountNumber, ValidateBankType.Account);
        ValidateBankAccount(accountNumber, iban);
      }

      if (cardNumber && cardNumber.length == 16) {
        await this.checkExistBankInfo(cardNumber, ValidateBankType.Card);
        const { validatedCard } = ValidateIbanOrBankCard(
          cardNumber,
          ValidateBankType.Card
        );
        if (validatedCard !== validatedIban)
          throw new BadRequestException(
            "شماره کارت وارد شده به این شماره شبا تعلق ندارد"
          );
        validCard = validatedCard;
      }

      await this.AddBankInfoToUser(userId);

      const bankAccount = this.userBankRepo.create({
        userId,
        iban,
        bank: validatedIban,
        cardNumber: cardNumber ?? null,
        accountNumber: accountNumber ?? null,
      });

      await this.userBankRepo.save(bankAccount);

      return {
        accountNumber,
        cardNumber,
        iban,
        bank: validatedIban,
        message: "اطلاعات بانکی شما به درستی اضافه شدند",
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserBankData() {
    const { id: userId } = this.req.user;

    const [data, count] = await this.userBankRepo.findAndCount({
      where: { userId },
      select: {
        id: true,
        bank: true,
        iban: true,
        cardNumber: true,
      },
      order: { id: "DESC" },
    });

    return {
      count,
      data,
    };
  }

  async getUserBankDataByAdmin(userId: number) {
    const [data, count] = await this.userBankRepo.findAndCount({
      where: { userId },
      select: {
        id: true,
        bank: true,
        iban: true,
        cardNumber: true,
      },
      order: { id: "DESC" },
    });

    return {
      count,
      data,
    };
  }

  async AddBankInfoToUser(id: number) {
    const user = await this.userRepo.findOneBy({ id });

    if (user.bankInfo >= 5 || user.bankInfo < 0) {
      throw new BadRequestException(
        `تعداد اطلاعات بانک نباید بیشتر از 5 یا منفی باشد . تعداد فعلی ${user.bankInfo}`
      );
    }

    user.bankInfo += 1;

    await this.userRepo.save(user);
  }

  async RemoveBankInfoFromUser(id: number) {
    const user = await this.userRepo.findOneBy({ id });

    if (user.bankInfo > 5 || user.bankInfo <= 0) {
      throw new BadRequestException(
        `تعداد اطلاعات بانک نباید بیشتر از 5 یا منفی باشد . تعداد فعلی ${user.bankInfo}`
      );
    }

    user.bankInfo -= 1;

    await this.userRepo.save(user);
  }

  async checkExistBankInfo(data: string, type: ValidateBankType) {
    if (type === ValidateBankType.Account) {
      const account = await this.userBankRepo.findOneBy({
        accountNumber: data,
      });
      if (account) throw new ConflictException("شماره حساب قبلا ثبت شده است");
      return true;
    } else if (type === ValidateBankType.Card) {
      const account = await this.userBankRepo.findOneBy({ cardNumber: data });
      if (account) throw new ConflictException("شماره کارت قبلا ثبت شده است");
      return true;
    } else if (type === ValidateBankType.Iban) {
      const account = await this.userBankRepo.findOneBy({ iban: data });
      if (account) throw new ConflictException("شماره شبا قبلا ثبت شده است");
      return true;
    } else throw new BadRequestException("مقادیر را به درستی ارسال کنید");
  }

  async removeUserBankData(id: number) {
    const { id: userId } = this.req.user;
    const bankData = await this.getBankData(id);

    if (bankData.userId !== userId) {
      throw new ForbiddenException(
        "شما فقط میتوانید اطلاعات مالی مربوط به خود را حذف نمایید"
      );
    }

    await this.RemoveBankInfoFromUser(userId);

    await this.userBankRepo.remove(bankData);

    return {
      message: " اطلاعات مالی به درستی حذف شد",
    };
  }
}
