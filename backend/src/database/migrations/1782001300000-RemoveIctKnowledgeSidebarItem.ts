import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes ICT sub-module entries from the admin sidebar. These pages remain
 * reachable by direct URL (and via quick links on the ICT overview for staff
 * with the right permissions) but are hidden from the sidebar like MainWebsiteian.
 */
export class RemoveIctKnowledgeSidebarItem1782001300000 implements MigrationInterface {
  name = 'RemoveIctKnowledgeSidebarItem1782001300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;

    await queryRunner.query(`
      DELETE FROM "admin_sidebar_items"
      WHERE "href" IN (
        '/admin/ict/knowledge',
        '/admin/ict/status',
        '/admin/ict/password-reset',
        '/admin/ict/assets'
      )
      OR "label" IN (
        'IT Knowledge Base',
        'Knowledge Base',
        'System Status',
        'Account Assist Desk',
        'Password Reset Desk',
        'IT Asset Register'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('admin_sidebar_items'))) return;

    const inserts = [
      {
        label: 'System Status',
        href: '/admin/ict/status',
        icon: 'Activity',
        order: 3,
      },
      {
        label: 'IT Knowledge Base',
        href: '/admin/ict/knowledge',
        icon: 'BookOpen',
        order: 4,
      },
      {
        label: 'Account Assist Desk',
        href: '/admin/ict/password-reset',
        icon: 'KeyRound',
        order: 5,
      },
    ];

    for (const row of inserts) {
      await queryRunner.query(
        `
        INSERT INTO "admin_sidebar_items" ("id", "label", "href", "icon", "order", "categoryId", "created_at", "updated_at")
        SELECT uuid_generate_v4(), $1, $2, $3, $4, c."id", now(), now()
        FROM "admin_sidebar_categories" c
        WHERE c."title" = 'Communication & Support'
          AND NOT EXISTS (SELECT 1 FROM "admin_sidebar_items" i WHERE i."href" = $2)
      `,
        [row.label, row.href, row.icon, row.order],
      );
    }
  }
}
