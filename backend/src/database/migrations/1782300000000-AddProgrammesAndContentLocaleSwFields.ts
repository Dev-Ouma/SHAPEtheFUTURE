import { MigrationInterface, QueryRunner } from 'typeorm';
import { addColumnIfNotExists } from '../migration-helpers';

/**
 * Layer E: programmes title_sw / overview_sw
 * Layer F: pages.content_sw + news.content_sw
 */
export class AddProgrammesAndContentLocaleSwFields1782300000000
  implements MigrationInterface
{
  name = 'AddProgrammesAndContentLocaleSwFields1782300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await addColumnIfNotExists(
      queryRunner,
      'programs',
      'title_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'programs',
      'overview_sw',
      'text NULL',
    );
    await addColumnIfNotExists(queryRunner, 'pages', 'content_sw', 'text NULL');
    await addColumnIfNotExists(queryRunner, 'news', 'content_sw', 'text NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [table, col] of [
      ['news', 'content_sw'],
      ['pages', 'content_sw'],
      ['programs', 'overview_sw'],
      ['programs', 'title_sw'],
    ] as const) {
      if (await queryRunner.hasColumn(table, col)) {
        await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "${col}"`);
      }
    }
  }
}
