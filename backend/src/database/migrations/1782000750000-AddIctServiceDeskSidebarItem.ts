import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the unified ICT Service Desk entry to the admin sidebar.
 * Idempotent; no-op when sidebar tables are not seeded yet.
 */
export class AddIctServiceDeskSidebarItem1782000750000 implements MigrationInterface {
  name = 'AddIctServiceDeskSidebarItem1782000750000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;

    await queryRunner.query(`
      INSERT INTO "admin_sidebar_items" ("id", "label", "href", "icon", "order", "categoryId", "created_at", "updated_at")
      SELECT uuid_generate_v4(), 'ICT Service Desk', '/admin/ict', 'Headset', 2, c."id", now(), now()
      FROM "admin_sidebar_categories" c
      WHERE c."title" = 'Communication & Support'
        AND NOT EXISTS (
          SELECT 1 FROM "admin_sidebar_items" i WHERE i."href" = '/admin/ict'
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;
    await queryRunner.query(
      `DELETE FROM "admin_sidebar_items" WHERE "href" = '/admin/ict'`,
    );
  }
}
