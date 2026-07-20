import { MigrationInterface, QueryRunner } from 'typeorm';
import { addColumnIfNotExists } from '../migration-helpers';

/**
 * Persists intake channel (Website / Mobile OUK APP / Admin / Email) for
 * enterprise provenance on the ICT Service Desk.
 */
export class AddSubmissionSourceToIctTickets1782001500000 implements MigrationInterface {
  name = 'AddSubmissionSourceToIctTickets1782001500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."ict_tickets_submission_source_enum" AS ENUM(
          'website', 'mobile_app', 'admin', 'email', 'unknown'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'submission_source',
      `"public"."ict_tickets_submission_source_enum" NOT NULL DEFAULT 'unknown'`,
    );

    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'client_platform',
      `character varying NULL`,
    );

    // Best-effort: OUK-CFB refs historically came from mobile/legacy CFB API.
    await queryRunner.query(`
      UPDATE "ict_tickets"
      SET "submission_source" = 'mobile_app'::"public"."ict_tickets_submission_source_enum"
      WHERE "reference_number" LIKE 'OUK-CFB-%'
        AND "submission_source" = 'unknown'::"public"."ict_tickets_submission_source_enum"
    `);

    // Align lane for expanded Helpdesk-only slugs.
    await queryRunner.query(`
      UPDATE "ict_tickets" t
      SET "service_group" = 'helpdesk'::"public"."ict_tickets_service_group_enum"
      FROM "ict_categories" c
      WHERE t."category_id" = c."id"
        AND (
          c."is_infrastructure" = true
          OR c."slug" IN (
            'student-services',
            'library-physical-resources',
            'health-wellness',
            'finance-payments-desk',
            'general-inquiry'
          )
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP COLUMN IF EXISTS "client_platform"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP COLUMN IF EXISTS "submission_source"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."ict_tickets_submission_source_enum"`,
    );
  }
}
