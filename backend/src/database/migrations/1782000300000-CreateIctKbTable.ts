import { MigrationInterface, QueryRunner } from 'typeorm';
import { addConstraintIfNotExists } from '../migration-helpers';

export class CreateIctKbTable1782000300000 implements MigrationInterface {
  name = 'CreateIctKbTable1782000300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('ict_kb_articles')) {
      return;
    }
    await queryRunner.query(`
      CREATE TABLE "ict_kb_articles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "summary" text,
        "body" text,
        "category" character varying,
        "tags" jsonb DEFAULT '[]',
        "is_published" boolean NOT NULL DEFAULT false,
        "views" integer NOT NULL DEFAULT 0,
        "helpful_yes" integer NOT NULL DEFAULT 0,
        "helpful_no" integer NOT NULL DEFAULT 0,
        "author_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_ict_kb_articles_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_ict_kb_articles" PRIMARY KEY ("id")
      )
    `);
    await addConstraintIfNotExists(
      queryRunner,
      'FK_ict_kb_articles_author',
      `ALTER TABLE "ict_kb_articles" ADD CONSTRAINT "FK_ict_kb_articles_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ict_kb_articles" DROP CONSTRAINT "FK_ict_kb_articles_author"`,
    );
    await queryRunner.query(`DROP TABLE "ict_kb_articles"`);
  }
}
