import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const CREATE_TABLE_SQL = `
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
`;

// Use BetterSQLite3Database as the canonical type — libsql drizzle is API-compatible
type DbType = BetterSQLite3Database<typeof schema>;

let _db: DbType | null = null;

function initDb(): DbType {
  const tursoUrl = process.env.TURSO_DATABASE_URL;

  if (tursoUrl) {
    // Production: Turso (libSQL)
    // Dynamic require to avoid bundling both drivers
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/libsql');

    const client = createClient({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    return drizzle(client, { schema }) as DbType;
  } else {
    // Local dev: better-sqlite3
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/better-sqlite3');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');

    const dbPath = process.env.DATABASE_PATH || './data/db.sqlite';
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.exec(CREATE_TABLE_SQL);

    return drizzle(sqlite, { schema }) as DbType;
  }
}

export function getDb(): DbType {
  if (!_db) {
    _db = initDb();
  }
  return _db;
}

// Lazy proxy so the module doesn't init DB at import time
export const db = new Proxy({} as DbType, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
