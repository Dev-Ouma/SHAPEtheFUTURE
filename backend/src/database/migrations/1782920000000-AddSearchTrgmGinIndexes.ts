import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GIN trigram indexes for bilingual search ranking (similarity / ILIKE).
 * Idempotent: skips missing columns; safe to re-run.
 */
export class AddSearchTrgmGinIndexes1782920000000
  implements MigrationInterface
{
  name = 'AddSearchTrgmGinIndexes1782920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    const targets: Array<{ table: string; column: string; index: string }> = [
      { table: 'programs', column: 'title', index: 'idx_programs_title_trgm' },
      {
        table: 'programs',
        column: 'title_sw',
        index: 'idx_programs_title_sw_trgm',
      },
      { table: 'news', column: 'title', index: 'idx_news_title_trgm' },
      { table: 'news', column: 'title_sw', index: 'idx_news_title_sw_trgm' },
      { table: 'pages', column: 'title', index: 'idx_pages_title_trgm' },
      { table: 'pages', column: 'title_sw', index: 'idx_pages_title_sw_trgm' },
      {
        table: 'short_courses',
        column: 'title',
        index: 'idx_short_courses_title_trgm',
      },
      {
        table: 'short_courses',
        column: 'title_sw',
        index: 'idx_short_courses_title_sw_trgm',
      },
      {
        table: 'course_units',
        column: 'title',
        index: 'idx_course_units_title_trgm',
      },
      {
        table: 'course_units',
        column: 'title_sw',
        index: 'idx_course_units_title_sw_trgm',
      },
      { table: 'menus', column: 'title', index: 'idx_menus_title_trgm' },
      { table: 'menus', column: 'title_sw', index: 'idx_menus_title_sw_trgm' },
      {
        table: 'publications',
        column: 'title',
        index: 'idx_publications_title_trgm',
      },
      {
        table: 'publications',
        column: 'title_sw',
        index: 'idx_publications_title_sw_trgm',
      },
      {
        table: 'staff_members',
        column: 'full_name',
        index: 'idx_staff_members_full_name_trgm',
      },
      { table: 'schools', column: 'name', index: 'idx_schools_name_trgm' },
      { table: 'schools', column: 'name_sw', index: 'idx_schools_name_sw_trgm' },
    ];

    for (const t of targets) {
      await queryRunner.query(
        `
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = '${t.table}'
              AND column_name = '${t.column}'
          ) AND NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relkind = 'i'
              AND c.relname = '${t.index}'
              AND n.nspname = 'public'
          ) THEN
            EXECUTE 'CREATE INDEX "${t.index}" ON "${t.table}" USING gin ("${t.column}" gin_trgm_ops)';
          END IF;
        END $$;
        `,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const indexes = [
      'idx_programs_title_trgm',
      'idx_programs_title_sw_trgm',
      'idx_news_title_trgm',
      'idx_news_title_sw_trgm',
      'idx_pages_title_trgm',
      'idx_pages_title_sw_trgm',
      'idx_short_courses_title_trgm',
      'idx_short_courses_title_sw_trgm',
      'idx_course_units_title_trgm',
      'idx_course_units_title_sw_trgm',
      'idx_menus_title_trgm',
      'idx_menus_title_sw_trgm',
      'idx_publications_title_trgm',
      'idx_publications_title_sw_trgm',
      'idx_staff_members_full_name_trgm',
      'idx_schools_name_trgm',
      'idx_schools_name_sw_trgm',
    ];
    for (const name of indexes) {
      await queryRunner.query(`DROP INDEX IF EXISTS "public"."${name}"`);
    }
  }
}
