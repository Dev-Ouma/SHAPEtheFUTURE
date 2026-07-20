import { MigrationInterface, QueryRunner } from 'typeorm';
import { addConstraintIfNotExists } from '../migration-helpers';

export class CreateUserTemporaryGrants1782000400000 implements MigrationInterface {
  name = 'CreateUserTemporaryGrants1782000400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('user_temporary_grants')) {
      return;
    }
    await queryRunner.query(`
      CREATE TABLE "user_temporary_grants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "permission_id" uuid,
        "granted_by_id" uuid,
        "reason" text,
        "expires_at" TIMESTAMP NOT NULL,
        "revoked_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_temporary_grants" PRIMARY KEY ("id")
      )
    `);
    await addConstraintIfNotExists(
      queryRunner,
      'FK_utg_user',
      `ALTER TABLE "user_temporary_grants" ADD CONSTRAINT "FK_utg_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await addConstraintIfNotExists(
      queryRunner,
      'FK_utg_permission',
      `ALTER TABLE "user_temporary_grants" ADD CONSTRAINT "FK_utg_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await addConstraintIfNotExists(
      queryRunner,
      'FK_utg_granted_by',
      `ALTER TABLE "user_temporary_grants" ADD CONSTRAINT "FK_utg_granted_by" FOREIGN KEY ("granted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_temporary_grants" DROP CONSTRAINT "FK_utg_granted_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_temporary_grants" DROP CONSTRAINT "FK_utg_permission"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_temporary_grants" DROP CONSTRAINT "FK_utg_user"`,
    );
    await queryRunner.query(`DROP TABLE "user_temporary_grants"`);
  }
}
