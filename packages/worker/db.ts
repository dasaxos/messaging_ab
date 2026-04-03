import { eq } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import type {
  FormInput,
  ParsedResults,
  ComparisonResult,
  PipelineStage,
  JobStatus,
} from '@ab-predictor/shared';

// Mirror of packages/web/lib/schema.ts — worker needs its own connection
export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  status: text('status').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  email: text('email').notNull(),
  name: text('name'),
  formInput: text('form_input', { mode: 'json' }).notNull().$type<FormInput>(),
  projectId: text('project_id'),
  projectIdB: text('project_id_b'),
  graphId: text('graph_id'),
  graphIdB: text('graph_id_b'),
  simulationIdA: text('simulation_id_a'),
  simulationIdB: text('simulation_id_b'),
  reportIdA: text('report_id_a'),
  reportIdB: text('report_id_b'),
  currentStage: text('current_stage'),
  resultsA: text('results_a', { mode: 'json' }).$type<ParsedResults>(),
  resultsB: text('results_b', { mode: 'json' }).$type<ParsedResults>(),
  comparison: text('comparison', { mode: 'json' }).$type<ComparisonResult>(),
  errorMessage: text('error_message'),
  errorStage: text('error_stage'),
});

type AnyDb = ReturnType<typeof initDb>;

function initDb() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;

  if (tursoUrl) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/libsql');

    const client = createClient({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return drizzle(client, { schema: { jobs } });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/better-sqlite3');

    // Resolve relative to project root (two levels up from packages/worker/)
    const rawPath = process.env.DATABASE_PATH || './data/db.sqlite';
    const dbPath = require('path').resolve(__dirname, '../..', rawPath);
    const dbDir = require('path').dirname(dbPath);
    if (!require('fs').existsSync(dbDir)) {
      require('fs').mkdirSync(dbDir, { recursive: true });
    }
    const sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        completed_at INTEGER,
        email TEXT NOT NULL,
        name TEXT,
        form_input TEXT NOT NULL,
        project_id TEXT,
        graph_id TEXT,
        simulation_id_a TEXT,
        simulation_id_b TEXT,
        report_id_a TEXT,
        report_id_b TEXT,
        current_stage TEXT,
        results_a TEXT,
        results_b TEXT,
        comparison TEXT,
        error_message TEXT,
        error_stage TEXT
      );
    `);
    return drizzle(sqlite, { schema: { jobs } });
  }
}

let _db: AnyDb | null = null;
function getDb(): AnyDb {
  if (!_db) _db = initDb();
  return _db;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new Proxy({} as any, {
  get(_target: unknown, prop: string | symbol) {
    return (getDb() as Record<string | symbol, unknown>)[prop];
  },
});

export async function getJob(jobId: string) {
  const rows = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  return rows[0] ?? null;
}

export async function updateJob(
  jobId: string,
  fields: Partial<{
    status: JobStatus;
    currentStage: PipelineStage;
    projectId: string;
    projectIdB: string;
    graphId: string;
    graphIdB: string;
    simulationIdA: string;
    simulationIdB: string;
    reportIdA: string;
    reportIdB: string;
    resultsA: ParsedResults;
    resultsB: ParsedResults;
    comparison: ComparisonResult;
    completedAt: Date;
    errorMessage: string;
    errorStage: string;
  }>
) {
  await db
    .update(jobs)
    .set({ ...fields, updatedAt: new Date() } as Record<string, unknown>)
    .where(eq(jobs.id, jobId));
}
