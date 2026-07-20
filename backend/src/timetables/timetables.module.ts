import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetablesController } from './timetables.controller';
import { TimetablesService } from './timetables.service';
import { CalendarController } from './calendar.controller';
import { AcademicCalendarEvent } from '../programs/entities/calendar-event.entity';
import { School } from '../programs/entities/school.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([AcademicCalendarEvent, School]),
  ],
  controllers: [TimetablesController, CalendarController],
  providers: [TimetablesService],
})
export class TimetablesModule {}
