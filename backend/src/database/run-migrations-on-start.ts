import { DataSource } from 'typeorm';
import { join } from 'path';

/**
 * Opt-in schema migrate before Nest boots.
 *
 * Enabled only when RUN_MIGRATIONS_ON_START=true.
 * Skipped when TYPEORM_SYNCHRONIZE=true (local/dev) so sync and migrate
 * never fight each other.
 *
 * Safe for existing production DBs that already track migrations; for dump-
 * restored DBs that never used TypeORM's migrations table, leave the flag
 * false until you have reconciled migration history.
 */
export async function runMigrationsOnStartIfEnabled(): Promise<void> {
  if (process.env.RUN_MIGRATIONS_ON_START !== 'true') {
    return;
  }

  if (process.env.TYPEORM_SYNCHRONIZE === 'true') {
    console.warn(
      '[migrations] Skipping: TYPEORM_SYNCHRONIZE=true (use sync in local/dev only).',
    );
    return;
  }

  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ouk_db',
    synchronize: false,
    logging: false,
    migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
  });

  await ds.initialize();
  try {
    const executed = await ds.runMigrations({ transaction: 'each' });
    console.log(
      `[migrations] Applied ${executed.length} migration(s)${
        executed.length
          ? `: ${executed.map((m) => m.name).join(', ')}`
          : ' (already up to date)'
      }`,
    );
  } finally {
    await ds.destroy();
  }
}
