import { MigrationInterface, QueryRunner } from 'typeorm';
import { IctCategory } from '../../ict/entities/ict-category.entity';
import { runIctCategorySeed } from '../seeds/ict-category-seed';

/**
 * Companion to MigrateCampusFeedbackIntoIct. The category seed normally runs on
 * app boot (IctService.onModuleInit), but a standalone migration:run copies the
 * feedback rows before any boot — leaving migrated tickets with a null category
 * because ict_categories was empty at copy time.
 *
 * This migration (a) seeds the merged categories via the ORM so they exist
 * regardless of app boot, then (b) back-fills category_id / department_id on the
 * already-migrated tickets by joining back through campus_feedback (matched on the
 * preserved ticket id). Idempotent and guarded for fresh, feedback-less databases.
 */
export class SeedIctCategoriesBackfillFeedback1782000700000 implements MigrationInterface {
  name = 'SeedIctCategoriesBackfillFeedback1782000700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // (a) Ensure the merged categories exist (reuses the single seed definition).
    await runIctCategorySeed(queryRunner.manager.getRepository(IctCategory));

    // (b) Back-fill category/department on tickets migrated with a null category.
    if (await queryRunner.hasTable('campus_feedback')) {
      await queryRunner.query(`
        UPDATE "ict_tickets" t
        SET "category_id" = ic."id",
            "department_id" = COALESCE(t."department_id", cf."department_id")
        FROM "campus_feedback" cf
        JOIN "campus_feedback_categories" cfc ON cfc."id" = cf."category_id"
        JOIN "ict_categories" ic ON ic."slug" = cfc."slug"
        WHERE t."id" = cf."id"
          AND t."category_id" IS NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Only unset the category linkage we back-filled onto migrated (CFB) tickets;
    // leave the seeded categories in place (harmless and shared with new intake).
    await queryRunner.query(`
      UPDATE "ict_tickets" SET "category_id" = NULL
      WHERE "reference_number" LIKE 'OUK-CFB-%'
    `);
  }
}
