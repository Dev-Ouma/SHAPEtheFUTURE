import { MigrationInterface, QueryRunner } from 'typeorm';

/** Backfill header menu title_sw gaps left after Layer B. */
export class BackfillMissingMenuTitleSw1782910000000 implements MigrationInterface {
  name = 'BackfillMissingMenuTitleSw1782910000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const menuSw: Record<string, string> = {
      'about/vice-chancellor': 'Maono ya Makamu wa Chansela',
      'about/campus-feedback': 'Malalamiko na Pongezi',
      'library/e-repository': 'Hazina ya Kielektroniki',
    };
    for (const [slug, titleSw] of Object.entries(menuSw)) {
      await queryRunner.query(
        `UPDATE "menus" SET "title_sw" = $1::character varying
         WHERE "slug" = $2::character varying
           AND ("title_sw" IS NULL OR "title_sw" = ''::character varying)`,
        [titleSw, slug],
      );
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // keep data
  }
}
