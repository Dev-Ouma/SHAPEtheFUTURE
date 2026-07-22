import { MigrationInterface, QueryRunner } from 'typeorm';
import { addColumnIfNotExists } from '../migration-helpers';

/** Layer G: title_sw + description_sw on calendar / alumni / student events. */
export class AddEventsLocaleSwFields1782400000000 implements MigrationInterface {
  name = 'AddEventsLocaleSwFields1782400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of [
      'academic_calendar_events',
      'alumni_events',
      'student_events',
    ]) {
      await addColumnIfNotExists(
        queryRunner,
        table,
        'title_sw',
        'character varying NULL',
      );
      await addColumnIfNotExists(
        queryRunner,
        table,
        'description_sw',
        'text NULL',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [
      'student_events',
      'alumni_events',
      'academic_calendar_events',
    ]) {
      for (const col of ['description_sw', 'title_sw']) {
        if (await queryRunner.hasColumn(table, col)) {
          await queryRunner.query(
            `ALTER TABLE "${table}" DROP COLUMN "${col}"`,
          );
        }
      }
    }
  }
}
