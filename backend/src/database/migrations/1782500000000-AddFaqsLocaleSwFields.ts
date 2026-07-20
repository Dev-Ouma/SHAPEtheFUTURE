import { MigrationInterface, QueryRunner } from 'typeorm';
import { addColumnIfNotExists } from '../migration-helpers';

/** Layer H: FAQ question_sw / answer_sw for public locale projection. */
export class AddFaqsLocaleSwFields1782500000000 implements MigrationInterface {
  name = 'AddFaqsLocaleSwFields1782500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await addColumnIfNotExists(
      queryRunner,
      'faqs',
      'question_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(queryRunner, 'faqs', 'answer_sw', 'text NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const col of ['answer_sw', 'question_sw'] as const) {
      if (await queryRunner.hasColumn('faqs', col)) {
        await queryRunner.query(`ALTER TABLE "faqs" DROP COLUMN "${col}"`);
      }
    }
  }
}
