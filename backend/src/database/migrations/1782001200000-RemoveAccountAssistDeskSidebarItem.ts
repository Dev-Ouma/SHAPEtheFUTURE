import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes the retired Account Assist Desk entry from the admin sidebar.
 * The sidebar is persisted in admin_sidebar_items, so existing databases need
 * an explicit cleanup migration in addition to the updated seed source.
 */
export class RemoveAccountAssistDeskSidebarItem1782001200000 implements MigrationInterface {
  name = 'RemoveAccountAssistDeskSidebarItem1782001200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;

    await queryRunner.query(`
      DELETE FROM "admin_sidebar_items"
      WHERE "href" = '/admin/ict/password-reset'
         OR "label" = 'Account Assist Desk'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;

    await queryRunner.query(`
      INSERT INTO "admin_sidebar_items" ("id", "label", "href", "icon", "order", "categoryId", "created_at", "updated_at")
      SELECT uuid_generate_v4(), 'Account Assist Desk', '/admin/ict/password-reset', 'KeyRound', 5, c."id", now(), now()
      FROM "admin_sidebar_categories" c
      WHERE c."title" = 'Communication & Support'
        AND NOT EXISTS (
          SELECT 1
          FROM "admin_sidebar_items" i
          WHERE i."href" = '/admin/ict/password-reset'
        )
    `);
  }
}
