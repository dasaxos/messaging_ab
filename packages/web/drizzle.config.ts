import type { Config } from 'drizzle-kit';

const tursoUrl = process.env.TURSO_DATABASE_URL;

export default (tursoUrl
  ? {
      schema: './lib/schema.ts',
      out: './drizzle',
      dialect: 'turso',
      dbCredentials: {
        url: tursoUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
      },
    }
  : {
      schema: './lib/schema.ts',
      out: './drizzle',
      dialect: 'sqlite',
      dbCredentials: {
        url: process.env.DATABASE_PATH || './data/db.sqlite',
      },
    }) satisfies Config;
