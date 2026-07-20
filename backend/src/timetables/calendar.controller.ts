import { Public } from '../common/decorators/public.decorator';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicCalendarEvent } from '../programs/entities/calendar-event.entity';
import { School } from '../programs/entities/school.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { normalizeLocale, pickLocalized } from '../common/locale';

@Controller('calendar')
export class CalendarController {
  constructor(
    @InjectRepository(AcademicCalendarEvent)
    private readonly calendarRepo: Repository<AcademicCalendarEvent>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
  ) {}

  private localizeEvent(event: AcademicCalendarEvent, localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    return {
      ...event,
      title: pickLocalized(locale, event.title, event.title_sw),
      description:
        pickLocalized(locale, event.description, event.description_sw) ||
        event.description,
    };
  }

  @Public()
  @Get()
  async findAll(
    @Query('school') schoolSlug?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('locale') locale?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (schoolSlug) {
      const school = await this.schoolRepo.findOne({
        where: { slug: schoolSlug },
      });
      if (!school) return { data: [], total: 0, page, limit, totalPages: 0 };
      where.school = { id: school.id };
    }

    const [data, total] = await this.calendarRepo.findAndCount({
      where,
      order: { date_start: 'ASC' },
      take: limit,
      skip: skip,
    });

    return {
      data: data.map((e) => this.localizeEvent(e, locale)),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() data: any) {
    const school = await this.schoolRepo.findOne({
      where: { id: data.schoolId },
    });
    const event = this.calendarRepo.create({
      ...data,
      school,
    });
    return this.calendarRepo.save(event);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.calendarRepo.update(id, data);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async importFromSchool(
    @Body() data: { fromSchoolSlug: string; toSchoolId: string },
  ) {
    const fromSchool = await this.schoolRepo.findOne({
      where: { slug: data.fromSchoolSlug },
    });
    const toSchool = await this.schoolRepo.findOne({
      where: { id: data.toSchoolId },
    });

    if (!fromSchool || !toSchool)
      return { success: false, message: 'Source or target school not found' };

    const sourceEvents = await this.calendarRepo.find({
      where: { school: { id: fromSchool.id } },
    });

    const newEvents = sourceEvents.map((event) => {
      const { id, ...eventData } = event;
      // We want to keep the original values but assign to the new school
      return this.calendarRepo.create({
        ...eventData,
        school: toSchool,
      });
    });

    await this.calendarRepo.save(newEvents);
    return { success: true, count: newEvents.length };
  }

  @Delete('clear/:schoolId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async clearSchoolCalendar(@Param('schoolId') schoolId: string) {
    await this.calendarRepo.delete({ school: { id: schoolId } });
    return { success: true };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.calendarRepo.delete(id);
  }
}
