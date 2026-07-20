import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  addColumnIfNotExists,
  addConstraintIfNotExists,
  createEnumIfNotExists,
} from '../migration-helpers';

/**
 * Phase 0 of merging Complaints & Compliments into the ICT Service Desk.
 * Widens ict_tickets / ict_categories so a single IctTicket can hold everything the
 * campus_feedback model carried (feedback type, sentiment, submitter identity,
 * anonymity/consent, incident date, keywords, AI confidence, owning department).
 * Additive only — existing ICT tickets default to feedback_type = 'service_request'.
 */
export class ExtendIctForFeedbackMerge1782000500000 implements MigrationInterface {
  name = 'ExtendIctForFeedbackMerge1782000500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createEnumIfNotExists(queryRunner, 'ict_tickets_feedback_type_enum', [
      'service_request',
      'complaint',
      'compliment',
    ]);
    await createEnumIfNotExists(queryRunner, 'ict_tickets_sentiment_enum', [
      'Positive',
      'Neutral',
      'Negative',
      'Urgent',
    ]);

    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'requester_phone',
      'character varying',
    );
    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'identification_number',
      'character varying',
    );
    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'is_anonymous',
      'boolean NOT NULL DEFAULT false',
    );
    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'consent_given',
      'boolean NOT NULL DEFAULT false',
    );
    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'feedback_type',
      `"public"."ict_tickets_feedback_type_enum" NOT NULL DEFAULT 'service_request'`,
    );
    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'sentiment',
      `"public"."ict_tickets_sentiment_enum"`,
    );
    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'department_id',
      'uuid',
    );
    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'incident_date',
      'date',
    );
    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'keywords',
      `jsonb DEFAULT '[]'`,
    );
    await addColumnIfNotExists(
      queryRunner,
      'ict_tickets',
      'ai_confidence_score',
      'double precision',
    );

    await addColumnIfNotExists(
      queryRunner,
      'ict_categories',
      'is_infrastructure',
      'boolean NOT NULL DEFAULT false',
    );
    await addColumnIfNotExists(
      queryRunner,
      'ict_categories',
      'applicable_types',
      'jsonb',
    );
    await addColumnIfNotExists(
      queryRunner,
      'ict_categories',
      'department_id',
      'uuid',
    );

    await addConstraintIfNotExists(
      queryRunner,
      'FK_ict_tickets_department',
      `ALTER TABLE "ict_tickets" ADD CONSTRAINT "FK_ict_tickets_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await addConstraintIfNotExists(
      queryRunner,
      'FK_ict_categories_department',
      `ALTER TABLE "ict_categories" ADD CONSTRAINT "FK_ict_categories_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ict_categories" DROP CONSTRAINT "FK_ict_categories_department"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP CONSTRAINT "FK_ict_tickets_department"`,
    );

    await queryRunner.query(
      `ALTER TABLE "ict_categories" DROP COLUMN "department_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_categories" DROP COLUMN "applicable_types"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_categories" DROP COLUMN "is_infrastructure"`,
    );

    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP COLUMN "ai_confidence_score"`,
    );
    await queryRunner.query(`ALTER TABLE "ict_tickets" DROP COLUMN "keywords"`);
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP COLUMN "incident_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP COLUMN "department_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP COLUMN "sentiment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP COLUMN "feedback_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP COLUMN "consent_given"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP COLUMN "is_anonymous"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP COLUMN "identification_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP COLUMN "requester_phone"`,
    );

    await queryRunner.query(`DROP TYPE "public"."ict_tickets_sentiment_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."ict_tickets_feedback_type_enum"`,
    );
  }
}
