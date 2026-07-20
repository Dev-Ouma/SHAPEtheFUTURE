import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes the retired System Status entry from the admin sidebar.
 * The sidebar is persisted in admin_sidebar_items, so existing databases need
 * an explicit cleanup migration in addition to the updated seed source.
 */
export class RemoveSystemStatusSidebarItem1782001100000 implements MigrationInterface {
  name = 'RemoveSystemStatusSidebarItem1782001100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;

    await queryRunner.query(`
      DELETE FROM "admin_sidebar_items"
      WHERE "href" = '/admin/ict/status'
         OR "label" = 'System Status'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;

    await queryRunner.query(`
      INSERT INTO "admin_sidebar_items" ("id", "label", "href", "icon", "order", "categoryId", "created_at", "updated_at")
      SELECT uuid_generate_v4(), 'System Status', '/admin/ict/status', 'Activity', 3, c."id", now(), now()
      FROM "admin_sidebar_categories" c
      WHERE c."title" = 'Communication & Support'
        AND NOT EXISTS (
          SELECT 1
          FROM "admin_sidebar_items" i
          WHERE i."href" = '/admin/ict/status'
        )
    `);
  }
}
