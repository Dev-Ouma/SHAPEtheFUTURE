import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LmsService {
  private readonly logger = new Logger(LmsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Sync grades from Moodle for a specific student.
   * Uses 'gradereport_user_get_grades_table' Moodle WS function.
   */
  async syncStudentGrades(studentId: string) {
    this.logger.log(`Syncing grades for student: ${studentId}`);

    // In a real scenario:
    // const response = await firstValueFrom(this.httpService.get(`${moodleUrl}...&userid=${studentId}`));

    // Mocking the sync result
    return [
      { course: 'DS101', grade: 'A', percentage: 92 },
      { course: 'CS102', grade: 'B+', percentage: 78 },
    ];
  }

  /**
   * Automatically enroll a student in their program's courses on Moodle.
   */
  async enrollStudentInProgram(studentId: string, programId: string) {
    this.logger.log(
      `Enrolling student ${studentId} in program ${programId} on LMS`,
    );

    // Logic:
    // 1. Get courses associated with programId from SIS DB.
    // 2. Map OUK Course IDs to Moodle Course IDs.
    // 3. Call 'enrol_manual_enrol_users' Moodle WS.

    return {
      success: true,
      enrolledCourses: ['DS101', 'CS102', 'CS103'],
    };
  }
}
