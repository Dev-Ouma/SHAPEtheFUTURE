import { MigrationInterface, QueryRunner } from 'typeorm';
import { addColumnIfNotExists } from '../migration-helpers';

export class AddNewsLocaleSwFields1782200000000 implements MigrationInterface {
  name = 'AddNewsLocaleSwFields1782200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await addColumnIfNotExists(
      queryRunner,
      'news',
      'title_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(queryRunner, 'news', 'summary', 'text NULL');
    await addColumnIfNotExists(queryRunner, 'news', 'summary_sw', 'text NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const col of ['summary_sw', 'summary', 'title_sw']) {
      if (await queryRunner.hasColumn('news', col)) {
        await queryRunner.query(`ALTER TABLE "news" DROP COLUMN "${col}"`);
      }
    }
  }
}
