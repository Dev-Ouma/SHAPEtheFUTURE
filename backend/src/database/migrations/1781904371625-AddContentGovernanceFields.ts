import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContentGovernanceFields1781904371625 implements MigrationInterface {
  name = 'AddContentGovernanceFields1781904371625';

  private async addColumnIfMissing(
    queryRunner: QueryRunner,
    table: string,
    column: string,
    sql: string,
  ) {
    if (!(await queryRunner.hasColumn(table, column))) {
      await queryRunner.query(sql);
    }
  }

  private async addConstraintIfMissing(
    queryRunner: QueryRunner,
    name: string,
    sql: string,
  ) {
    const rows = await queryRunner.query(
      `SELECT 1 FROM pg_constraint WHERE conname = $1`,
      [name],
    );
    if (!rows?.length) {
      await queryRunner.query(sql);
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.addColumnIfMissing(
      queryRunner,
      'programs',
      'review_notes',
      `ALTER TABLE "programs" ADD "review_notes" text`,
    );
    await this.addColumnIfMissing(
      queryRunner,
      'programs',
      'author_id',
      `ALTER TABLE "programs" ADD "author_id" uuid`,
    );
    await this.addColumnIfMissing(
      queryRunner,
      'programs',
      'approver_id',
      `ALTER TABLE "programs" ADD "approver_id" uuid`,
    );
    await this.addColumnIfMissing(
      queryRunner,
      'pages',
      'review_notes',
      `ALTER TABLE "pages" ADD "review_notes" text`,
    );
    await this.addColumnIfMissing(
      queryRunner,
      'pages',
      'author_id',
      `ALTER TABLE "pages" ADD "author_id" uuid`,
    );
    await this.addColumnIfMissing(
      queryRunner,
      'pages',
      'approver_id',
      `ALTER TABLE "pages" ADD "approver_id" uuid`,
    );
    await this.addColumnIfMissing(
      queryRunner,
      'news',
      'review_notes',
      `ALTER TABLE "news" ADD "review_notes" text`,
    );
    await this.addColumnIfMissing(
      queryRunner,
      'news',
      'author_id',
      `ALTER TABLE "news" ADD "author_id" uuid`,
    );
    await this.addColumnIfMissing(
      queryRunner,
      'news',
      'approver_id',
      `ALTER TABLE "news" ADD "approver_id" uuid`,
    );

    await this.addConstraintIfMissing(
      queryRunner,
      'FK_1595f30ec0c44fcb25bc0a25768',
      `ALTER TABLE "programs" ADD CONSTRAINT "FK_1595f30ec0c44fcb25bc0a25768" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'FK_f26863c337cf27b69edbc2d1880',
      `ALTER TABLE "programs" ADD CONSTRAINT "FK_f26863c337cf27b69edbc2d1880" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'FK_4cfa4caf7f1c553220d70987fb2',
      `ALTER TABLE "pages" ADD CONSTRAINT "FK_4cfa4caf7f1c553220d70987fb2" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'FK_1ed8a2543836a1ee6e7385734e2',
      `ALTER TABLE "pages" ADD CONSTRAINT "FK_1ed8a2543836a1ee6e7385734e2" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'FK_173d93468ebf142bb3424c2fd63',
      `ALTER TABLE "news" ADD CONSTRAINT "FK_173d93468ebf142bb3424c2fd63" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await this.addConstraintIfMissing(
      queryRunner,
      'FK_94b868112303db57f1575e5bc3b',
      `ALTER TABLE "news" ADD CONSTRAINT "FK_94b868112303db57f1575e5bc3b" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "news" DROP CONSTRAINT IF EXISTS "FK_94b868112303db57f1575e5bc3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" DROP CONSTRAINT IF EXISTS "FK_173d93468ebf142bb3424c2fd63"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pages" DROP CONSTRAINT IF EXISTS "FK_1ed8a2543836a1ee6e7385734e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pages" DROP CONSTRAINT IF EXISTS "FK_4cfa4caf7f1c553220d70987fb2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "programs" DROP CONSTRAINT IF EXISTS "FK_f26863c337cf27b69edbc2d1880"`,
    );
    await queryRunner.query(
      `ALTER TABLE "programs" DROP CONSTRAINT IF EXISTS "FK_1595f30ec0c44fcb25bc0a25768"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" DROP COLUMN IF EXISTS "approver_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" DROP COLUMN IF EXISTS "author_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "news" DROP COLUMN IF EXISTS "review_notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pages" DROP COLUMN IF EXISTS "approver_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pages" DROP COLUMN IF EXISTS "author_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pages" DROP COLUMN IF EXISTS "review_notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "programs" DROP COLUMN IF EXISTS "approver_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "programs" DROP COLUMN IF EXISTS "author_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "programs" DROP COLUMN IF EXISTS "review_notes"`,
    );
  }
}
