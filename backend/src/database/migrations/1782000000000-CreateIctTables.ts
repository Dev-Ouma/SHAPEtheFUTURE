import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  addConstraintIfNotExists,
  createEnumIfNotExists,
} from '../migration-helpers';

export class CreateIctTables1782000000000 implements MigrationInterface {
  name = 'CreateIctTables1782000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('ict_categories')) {
      return;
    }

    await createEnumIfNotExists(
      queryRunner,
      'ict_categories_default_priority_enum',
      ['Low', 'Medium', 'High', 'Critical'],
    );
    await createEnumIfNotExists(queryRunner, 'ict_tickets_priority_enum', [
      'Low',
      'Medium',
      'High',
      'Critical',
    ]);
    await createEnumIfNotExists(queryRunner, 'ict_tickets_status_enum', [
      'Open',
      'Acknowledged',
      'In Progress',
      'On Hold',
      'Resolved',
      'Closed',
      'Cancelled',
    ]);
    await createEnumIfNotExists(
      queryRunner,
      'ict_tickets_requester_type_enum',
      ['Staff', 'Student', 'Faculty', 'Other'],
    );

    // ict_categories
    await queryRunner.query(`
      CREATE TABLE "ict_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "default_priority" "public"."ict_categories_default_priority_enum" NOT NULL DEFAULT 'Medium',
        "sla_hours" integer NOT NULL DEFAULT 48,
        "is_active" boolean NOT NULL DEFAULT true,
        "subcategories" jsonb DEFAULT '[]',
        "default_assignee_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_ict_categories_name" UNIQUE ("name"),
        CONSTRAINT "UQ_ict_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_ict_categories" PRIMARY KEY ("id")
      )
    `);

    // ict_tickets
    await queryRunner.query(`
      CREATE TABLE "ict_tickets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "reference_number" character varying NOT NULL,
        "requester_id" uuid,
        "requester_name" character varying,
        "requester_email" character varying,
        "requester_type" "public"."ict_tickets_requester_type_enum" NOT NULL DEFAULT 'Staff',
        "category_id" uuid,
        "subcategory" character varying,
        "subject" character varying NOT NULL,
        "description" text NOT NULL,
        "location" character varying,
        "asset_tag" character varying,
        "attachment_urls" jsonb DEFAULT '[]',
        "status" "public"."ict_tickets_status_enum" NOT NULL DEFAULT 'Open',
        "priority" "public"."ict_tickets_priority_enum" NOT NULL DEFAULT 'Medium',
        "tags" jsonb DEFAULT '[]',
        "is_escalated" boolean NOT NULL DEFAULT false,
        "escalation_reason" character varying,
        "assigned_to_id" uuid,
        "resolution" text,
        "resolved_at" TIMESTAMP,
        "sla_due_date" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_ict_tickets_reference_number" UNIQUE ("reference_number"),
        CONSTRAINT "PK_ict_tickets" PRIMARY KEY ("id")
      )
    `);

    // ict_ticket_responses
    await queryRunner.query(`
      CREATE TABLE "ict_ticket_responses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ticket_id" uuid,
        "message" text NOT NULL,
        "responded_by_id" uuid,
        "is_internal" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ict_ticket_responses" PRIMARY KEY ("id")
      )
    `);

    // Foreign keys
    await addConstraintIfNotExists(
      queryRunner,
      'FK_ict_categories_default_assignee',
      `ALTER TABLE "ict_categories" ADD CONSTRAINT "FK_ict_categories_default_assignee" FOREIGN KEY ("default_assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await addConstraintIfNotExists(
      queryRunner,
      'FK_ict_tickets_requester',
      `ALTER TABLE "ict_tickets" ADD CONSTRAINT "FK_ict_tickets_requester" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await addConstraintIfNotExists(
      queryRunner,
      'FK_ict_tickets_category',
      `ALTER TABLE "ict_tickets" ADD CONSTRAINT "FK_ict_tickets_category" FOREIGN KEY ("category_id") REFERENCES "ict_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await addConstraintIfNotExists(
      queryRunner,
      'FK_ict_tickets_assigned_to',
      `ALTER TABLE "ict_tickets" ADD CONSTRAINT "FK_ict_tickets_assigned_to" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await addConstraintIfNotExists(
      queryRunner,
      'FK_ict_ticket_responses_ticket',
      `ALTER TABLE "ict_ticket_responses" ADD CONSTRAINT "FK_ict_ticket_responses_ticket" FOREIGN KEY ("ticket_id") REFERENCES "ict_tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await addConstraintIfNotExists(
      queryRunner,
      'FK_ict_ticket_responses_responded_by',
      `ALTER TABLE "ict_ticket_responses" ADD CONSTRAINT "FK_ict_ticket_responses_responded_by" FOREIGN KEY ("responded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ict_ticket_responses" DROP CONSTRAINT "FK_ict_ticket_responses_responded_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_ticket_responses" DROP CONSTRAINT "FK_ict_ticket_responses_ticket"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP CONSTRAINT "FK_ict_tickets_assigned_to"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP CONSTRAINT "FK_ict_tickets_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_tickets" DROP CONSTRAINT "FK_ict_tickets_requester"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_categories" DROP CONSTRAINT "FK_ict_categories_default_assignee"`,
    );

    await queryRunner.query(`DROP TABLE "ict_ticket_responses"`);
    await queryRunner.query(`DROP TABLE "ict_tickets"`);
    await queryRunner.query(`DROP TABLE "ict_categories"`);

    await queryRunner.query(
      `DROP TYPE "public"."ict_tickets_requester_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."ict_tickets_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ict_tickets_priority_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."ict_categories_default_priority_enum"`,
    );
  }
}
