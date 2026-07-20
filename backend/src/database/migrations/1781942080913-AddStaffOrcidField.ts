import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStaffOrcidField1781942080913 implements MigrationInterface {
  name = 'AddStaffOrcidField1781942080913';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('staff_members', 'orcid_id'))) {
      await queryRunner.query(
        `ALTER TABLE "staff_members" ADD "orcid_id" character varying`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('staff_members', 'orcid_id')) {
      await queryRunner.query(
        `ALTER TABLE "staff_members" DROP COLUMN "orcid_id"`,
      );
    }
  }
}
