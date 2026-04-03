import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import type { FormInput, ParsedResults, ComparisonResult } from '@ab-predictor/shared';

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  status: text('status').notNull(), // JobStatus
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),

  // User info
  email: text('email').notNull(),
  name: text('name'),

  // Form inputs (stored as JSON)
  formInput: text('form_input', { mode: 'json' }).notNull().$type<FormInput>(),

  // MiroFish tracking
  projectId: text('project_id'),
  projectIdB: text('project_id_b'),
  graphId: text('graph_id'),
  graphIdB: text('graph_id_b'),
  simulationIdA: text('simulation_id_a'),
  simulationIdB: text('simulation_id_b'),
  reportIdA: text('report_id_a'),
  reportIdB: text('report_id_b'),

  // Current pipeline stage
  currentStage: text('current_stage'),

  // Results (stored as JSON after parsing)
  resultsA: text('results_a', { mode: 'json' }).$type<ParsedResults>(),
  resultsB: text('results_b', { mode: 'json' }).$type<ParsedResults>(),
  comparison: text('comparison', { mode: 'json' }).$type<ComparisonResult>(),

  // Error tracking
  errorMessage: text('error_message'),
  errorStage: text('error_stage'),
});
