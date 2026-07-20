import { QueryRunner } from 'typeorm';

export async function createEnumIfNotExists(
  queryRunner: QueryRunner,
  name: string,
  values: string[],
): Promise<void> {
  const rows = await queryRunner.query(
    `SELECT 1 FROM pg_type WHERE typname = $1`,
    [name],
  );
  if (rows?.length) return;
  const quoted = values.map((v) => `'${v.replace(/'/g, "''")}'`).join(', ');
  await queryRunner.query(`CREATE TYPE "public"."${name}" AS ENUM(${quoted})`);
}

export async function addColumnIfNotExists(
  queryRunner: QueryRunner,
  table: string,
  column: string,
  definition: string,
): Promise<void> {
  if (!(await queryRunner.hasColumn(table, column))) {
    await queryRunner.query(
      `ALTER TABLE "${table}" ADD "${column}" ${definition}`,
    );
  }
}

export async function addConstraintIfNotExists(
  queryRunner: QueryRunner,
  name: string,
  sql: string,
): Promise<void> {
  const rows = await queryRunner.query(
    `SELECT 1 FROM pg_constraint WHERE conname = $1`,
    [name],
  );
  if (!rows?.length) {
    await queryRunner.query(sql);
  }
}
