import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateTourDto } from "./dto/create-tour.dto";
import { UpdateTourDto } from "./dto/update-tour.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { TourEntity } from "./entities/tour.entity";
import { DeepPartial, Repository } from "typeorm";
import { TourPlanEntity } from "./entities/tourPlan.entity";
import { TourPlanDto, UpdatePlanDto } from "./dto/tourplan.dto";
import { EntityNames } from "src/common/enum/entity-name.enum";
import { validateNumString } from "./util/tour.functions";

@Injectable()
export class TourService {
  constructor(
    @InjectRepository(TourEntity) private tourRepo: Repository<TourEntity>,
    @InjectRepository(TourPlanEntity)
    private tourPlanRepo: Repository<TourPlanEntity>
  ) {}

  async create(createTourDto: CreateTourDto) {
    let {
      capacity,
      day,
      detail,
      from,
      hotelGrade,
      hotelName,
      insuranceAmount,
      name,
      startDate,
      night,
      price,
      to,
      tourLeaderStatus,
      travelType,
    } = createTourDto;

    if (!night || isNaN(night)) {
      night = day + 1;
    }

    validateNumString(price);
    validateNumString(insuranceAmount);

    this.checkDayNightDifference(day, night);

    const { returnDate } = this.returnDay(startDate, day, night);

    let tour = this.tourRepo.create({
      capacity,
      day,
      detail,
      from,
      hotelGrade,
      hotelName,
      returnDate,
      insuranceAmount,
      name,
      startDate,
      night,
      price,
      to,
      tourLeaderStatus,
      travelType,
      limit: capacity,
    });

    tour = await this.tourRepo.save(tour);

    return {
      message: "تور با موفقیت ساخته شد.",
    };
  }

  async findAll() {
    return await this.tourRepo.find({
      where: {},
      order: { id: "ASC" },
      relations: {
        plans: true,
      },
    });
  }

  async findTourPlans(id: number) {
    await this.findOne(id);
    const plans = await this.tourPlanRepo.findBy({ tourId: id });
    if (!plans)
      throw new NotFoundException("هیچ برنامه ای برای این تور پیدا نشد");
    return plans;
  }

  async findOneTourPlan(id: number) {
    const plan = await this.tourPlanRepo.findOneBy({ id });
    if (!plan) throw new NotFoundException("چنین  برنامه ای وجود ندارد");
    return plan;
  }

  async findOne(id: number) {
    const tour = await this.tourRepo
      .createQueryBuilder(EntityNames.Tour)
      .leftJoinAndSelect("tour.plans", "plans")
      .where({ id })
      .select(["tour", "plans.day", "plans.description"])
      .getOne();

    if (!tour) throw new NotFoundException("تور موردنظر یافت نشد");
    return tour;
  }

  async update(id: number, updateTourDto: UpdateTourDto) {
    try {
      const tour = await this.findOne(id);
      let {
        capacity,
        day,
        detail,
        from,
        hotelGrade,
        hotelName,
        insuranceAmount,
        name,
        night,
        price,
        startDate,
        to,
        tourLeaderStatus,
        travelType,
      } = updateTourDto;

      const tourObject: DeepPartial<TourEntity> = {};

      if (detail) tourObject.detail = detail;
      if (to) tourObject.to = to;
      if (from) tourObject.from = from;
      if (name) tourObject.name = name;
      if (hotelName) tourObject.hotelName = hotelName;
      if (hotelGrade) tourObject.hotelGrade = hotelGrade;
      if (tourLeaderStatus) tourObject.tourLeaderStatus = tourLeaderStatus;
      if (travelType) tourObject.travelType = travelType;

      if (insuranceAmount) {
        validateNumString(insuranceAmount);
        tourObject.insuranceAmount = insuranceAmount;
      }
      if (price) {
        validateNumString(price);
        tourObject.price = price;
      }

      if (capacity) {
        if (capacity < tour.limit) {
          tourObject.limit = capacity - tour.capacity + tour.limit;
        } else if (capacity > tour.limit) {
          throw new BadRequestException(
            `مقدار ظرفیت از تعداد رزرو شده نمیتواند کمتر باشد ظرفیت= ${capacity} مقدار رزرو شده = ${tour.limit}`
          );
        }
        tourObject.capacity = capacity;
      }

      if (
        day &&
        night &&
        typeof day !== "undefined" &&
        typeof day !== "undefined"
      ) {
        this.checkDayNightDifference(day, night);
        tourObject.day = day;
        tourObject.night = night;
      } else if (day && typeof day !== "undefined") {
        this.checkDayNightDifference(day, tour.night);
        tourObject.day = day;
      } else if (night && typeof night !== "undefined") {
        this.checkDayNightDifference(tour.day, night);
        tourObject.night = night;
      }
      if (startDate) {
        const { returnDate } = this.returnDay(
          startDate,
          day ?? tour.day,
          night ?? tour.night
        );
        console.log(returnDate);

        tourObject.startDate = startDate;
        tourObject.returnDate = returnDate;
      }

      await this.tourRepo.update({ id }, tourObject);

      return {
        message: "با موفقیت ویرایش شد ",
      };
    } catch (error) {
      return error;
    }
  }

  async remove(id: number) {
    const tour = await this.findOne(id);
    await this.tourRepo.remove(tour);
    return { message: "تور مورد نظر حذف شد" };
  }

  checkDayNightDifference(day: number, night: number) {
    if (night - day > 1 || day - night > 1)
      throw new BadRequestException(
        `اختلاف روز و شب نباید بیشتر از یک باشد  روز = ${day} شب = ${night}`
      );
  }

  async createPlan(planDto: TourPlanDto) {
    const { day, description, tourId } = planDto;
    await this.ExistPlanDay(tourId, day);

    const tour = await this.findOne(tourId);

    this.CountDays(day, tour.day, tour.night);

    const plan = this.tourPlanRepo.create({
      tourId,
      day,
      description,
    });

    await this.tourPlanRepo.save(plan);

    return {
      message: `برنامه سفر روز ${day} با موفقیت برای ${tour.name} ساخته شد`,
    };
  }

  async updatePlan(planId: number, planDto: UpdatePlanDto) {
    const { day, description, tourId } = planDto;
    const tour = await this.findOne(tourId);

    await this.findOneTourPlan(planId);

    const planObject: DeepPartial<TourPlanEntity> = {};
    if (tourId) planObject.tourId = tourId;
    if (day) {
      this.CountDays(day, tour.day, tour.night);
      planObject.day = day;
    }
    if (description) planObject.description = description;
    await this.tourPlanRepo.update(
      { id: planId },
      {
        tourId,
        day,
        description,
      }
    );
    return {
      message: `برنامه سفر روز ${day} با موفقیت برای ${tour.name} ویرایش شد`,
    };
  }

  async deletePlan(id: number) {
    await this.findOneTourPlan(id);
    await this.tourPlanRepo.delete(id);
    return {
      message: "برنامه تور حذف شد.",
    };
  }

  async ExistPlanDay(tourId: number, day: number) {
    const planDay = await this.tourPlanRepo.findOne({
      where: { tourId, day },
    });
    if (planDay)
      throw new ConflictException(
        "شما قبلا برای این روز تور برنامه درست کرده اید"
      );
    return true;
  }

  CountDays(day: number, tourDay: number, tourNight: number) {
    const countDays: number = tourDay > tourNight ? tourDay : tourNight;
    if (day > countDays || day <= 0) {
      throw new BadRequestException(
        "روز انتخابی نباید از تعداد روزها بیشتر باشد یا صفر و منفی باشد"
      );
    }
    return true;
  }

  returnDay(startDate: Date, day: number, night: number) {
    const returnDate = new Date(startDate);
    returnDate.setDate(returnDate.getDate() + (day > night ? day : night));
    return { returnDate };
  }
}
