import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Legacy campus-feedback and complaints admin routes are kept as fallbacks (direct URL).
 * Sidebar entries are not removed here so bookmarks/deep links stay discoverable if present;
 * primary navigation is ICT Service Desk via admin-sidebar-seed.
 */
export class RetireCampusFeedbackSidebarItems1782000900000 implements MigrationInterface {
  name = 'RetireCampusFeedbackSidebarItems1782000900000';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // Intentional no-op: fallback UIs remain at /admin/campus-feedback and /admin/complaints.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;
    // Restore the two entries under "Communication & Support" (best-effort).
    await queryRunner.query(`
      INSERT INTO "admin_sidebar_items" ("id", "label", "href", "icon", "order", "categoryId", "created_at", "updated_at")
      SELECT uuid_generate_v4(), 'Complaints & Compliments', '/admin/campus-feedback', 'AlertCircle', 2, c."id", now(), now()
      FROM "admin_sidebar_categories" c
      WHERE c."title" = 'Communication & Support'
        AND NOT EXISTS (SELECT 1 FROM "admin_sidebar_items" i WHERE i."href" = '/admin/campus-feedback')
    `);
    await queryRunner.query(`
      INSERT INTO "admin_sidebar_items" ("id", "label", "href", "icon", "order", "categoryId", "created_at", "updated_at")
      SELECT uuid_generate_v4(), 'Feedback Reports', '/admin/campus-feedback/reports', 'BarChart3', 3, c."id", now(), now()
      FROM "admin_sidebar_categories" c
      WHERE c."title" = 'Communication & Support'
        AND NOT EXISTS (SELECT 1 FROM "admin_sidebar_items" i WHERE i."href" = '/admin/campus-feedback/reports')
    `);
  }
}
