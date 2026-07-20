import { Public } from '../common/decorators/public.decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { TimetablesService } from './timetables.service';

@Controller('timetables')
export class TimetablesController {
  constructor(private readonly timetablesService: TimetablesService) {}

  @Public()
  @Get('schools')
  getSchools() {
    return this.timetablesService.getPlannerSchools();
  }

  @Public()
  @Get('exams')
  getExams(@Query() query: any) {
    return this.timetablesService.getExams(query);
  }

  @Public()
  @Get('class')
  getClassTimetable(@Query() query: any) {
    return this.timetablesService.getClassTimetable(query);
  }

  @Public()
  @Get('programmes')
  getProgrammes(@Query('school_id') schoolId: string) {
    return this.timetablesService.getProgrammes(schoolId);
  }

  @Public()
  @Get('levels')
  getLevels(
    @Query('school_id') schoolId: string,
    @Query('programme_id') programmeId: string,
  ) {
    return this.timetablesService.getLevels(schoolId, programmeId);
  }
}
