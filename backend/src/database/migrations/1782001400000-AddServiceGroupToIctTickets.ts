import { MigrationInterface, QueryRunner } from 'typeorm';
import { addColumnIfNotExists } from '../migration-helpers';

/**
 * Persists the HelpDesk vs IT Technical Support lane on each ticket for
 * filtered queues and role-scoped analytics.
 */
export class AddServiceGroupToIctTickets1782001400000 implements MigrationInterface {
  name = 'AddServiceGroupToIctTickets1782001400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."ict_tickets_service_group_enum" AS ENUM('helpdesk', 'it_technical_support');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'service_group',
      `"public"."ict_tickets_service_group_enum" NOT NULL DEFAULT 'it_technical_support'`,
    );

    // Backfill from category flags (same rules as isHelpDeskCategory).
    await queryRunner.query(`
      UPDATE "ict_tickets" t
      SET "service_group" = 'helpdesk'::"public"."ict_tickets_service_group_enum"
      FROM "ict_categories" c
      WHERE t."category_id" = c."id"
        AND (
          c."is_infrastructure" = true
          OR c."slug" IN ('student-services', 'general-inquiry')
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP COLUMN IF EXISTS "service_group"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."ict_tickets_service_group_enum"`,
    );
  }
}
