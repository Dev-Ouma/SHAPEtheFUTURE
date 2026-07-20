import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the staff-facing "My Tickets" module to the admin sidebar (under
 * "Communication & Support"). The sidebar is DB-driven and only re-seeded by the
 * nuclear initial-seed, so this migration inserts the row on the live DB.
 * Idempotent (skips if the href already exists); no-op on databases that don't
 * yet have the sidebar seeded.
 */
export class AddMyTicketsSidebarItem1782000800000 implements MigrationInterface {
  name = 'AddMyTicketsSidebarItem1782000800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;

    await queryRunner.query(`
      INSERT INTO "admin_sidebar_items" ("id", "label", "href", "icon", "order", "categoryId", "created_at", "updated_at")
      SELECT uuid_generate_v4(), 'My Tickets', '/admin/my-tickets', 'Ticket', 0, c."id", now(), now()
      FROM "admin_sidebar_categories" c
      WHERE c."title" = 'Communication & Support'
        AND NOT EXISTS (
          SELECT 1 FROM "admin_sidebar_items" i WHERE i."href" = '/admin/my-tickets'
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;
    await queryRunner.query(
      `DELETE FROM "admin_sidebar_items" WHERE "href" = '/admin/my-tickets'`,
    );
  }
}
