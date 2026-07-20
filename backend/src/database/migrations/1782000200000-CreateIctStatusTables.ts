import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  addConstraintIfNotExists,
  createEnumIfNotExists,
} from '../migration-helpers';

export class CreateIctStatusTables1782000200000 implements MigrationInterface {
  name = 'CreateIctStatusTables1782000200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('ict_systems')) {
      return;
    }

    await createEnumIfNotExists(queryRunner, 'ict_systems_status_enum', [
      'Operational',
      'Degraded',
      'Partial Outage',
      'Major Outage',
      'Maintenance',
    ]);
    await createEnumIfNotExists(queryRunner, 'ict_incidents_type_enum', [
      'Incident',
      'Maintenance',
    ]);
    await createEnumIfNotExists(queryRunner, 'ict_incidents_impact_enum', [
      'Minor',
      'Major',
      'Critical',
      'Maintenance',
    ]);
    await createEnumIfNotExists(queryRunner, 'ict_incidents_status_enum', [
      'Investigating',
      'Identified',
      'Monitoring',
      'Resolved',
      'Scheduled',
      'In Progress',
      'Completed',
    ]);

    await queryRunner.query(`
      CREATE TABLE "ict_systems" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "category" character varying,
        "status" "public"."ict_systems_status_enum" NOT NULL DEFAULT 'Operational',
        "order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_ict_systems_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_ict_systems" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ict_incidents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "system_id" uuid,
        "title" character varying NOT NULL,
        "type" "public"."ict_incidents_type_enum" NOT NULL DEFAULT 'Incident',
        "impact" "public"."ict_incidents_impact_enum" NOT NULL DEFAULT 'Minor',
        "status" "public"."ict_incidents_status_enum" NOT NULL DEFAULT 'Investigating',
        "starts_at" TIMESTAMP,
        "ends_at" TIMESTAMP,
        "updates" jsonb DEFAULT '[]',
        "created_by_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ict_incidents" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `ALTER TABLE "ict_incidents" ADD CONSTRAINT "FK_ict_incidents_system" FOREIGN KEY ("system_id") REFERENCES "ict_systems"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_incidents" ADD CONSTRAINT "FK_ict_incidents_created_by" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ict_incidents" DROP CONSTRAINT "FK_ict_incidents_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ict_incidents" DROP CONSTRAINT "FK_ict_incidents_system"`,
    );
    await queryRunner.query(`DROP TABLE "ict_incidents"`);
    await queryRunner.query(`DROP TABLE "ict_systems"`);
    await queryRunner.query(`DROP TYPE "public"."ict_incidents_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ict_incidents_impact_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ict_incidents_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."ict_systems_status_enum"`);
  }
}
