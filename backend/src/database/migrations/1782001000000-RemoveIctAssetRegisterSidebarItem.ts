import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes the retired IT Asset Register entry from the admin sidebar.
 * The sidebar is persisted in admin_sidebar_items, so existing databases need
 * an explicit cleanup migration in addition to the updated seed source.
 */
export class RemoveIctAssetRegisterSidebarItem1782001000000 implements MigrationInterface {
  name = 'RemoveIctAssetRegisterSidebarItem1782001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;

    await queryRunner.query(`
      DELETE FROM "admin_sidebar_items"
      WHERE "href" = '/admin/ict/assets'
         OR "label" = 'IT Asset Register'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;

    await queryRunner.query(`
      INSERT INTO "admin_sidebar_items" ("id", "label", "href", "icon", "order", "categoryId", "created_at", "updated_at")
      SELECT uuid_generate_v4(), 'IT Asset Register', '/admin/ict/assets', 'Layers', 2, c."id", now(), now()
      FROM "admin_sidebar_categories" c
      WHERE c."title" = 'Communication & Support'
        AND NOT EXISTS (
          SELECT 1
          FROM "admin_sidebar_items" i
          WHERE i."href" = '/admin/ict/assets'
        )
    `);
  }
}
