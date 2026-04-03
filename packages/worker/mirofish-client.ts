/**
 * MiroFish API client — built from actual Flask route inspection.
 *
 * Blueprint prefixes:
 *   /api/graph        — graph_bp
 *   /api/simulation   — simulation_bp
 *   /api/report       — report_bp
 */

import fs from 'fs';
import path from 'path';
import http from 'http';

function getMirofishBase(): string {
  return process.env.MIROFISH_URL || 'http://127.0.0.1:5001';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Low-level HTTP request that avoids Node 18's fetch IPv6 bugs.
 * Used for all MiroFish calls.
 */
function httpRequest(
  urlStr: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string | Buffer;
  } = {}
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: options.headers,
        ...(isLocalhost ? { family: 4 as const } : {}),
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 500,
            body: Buffer.concat(chunks).toString('utf-8'),
          });
        });
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function mfJson<T = unknown>(
  endpoint: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string | Buffer;
  } = {}
): Promise<T> {
  const url = `${getMirofishBase()}${endpoint}`;
  const res = await httpRequest(url, options);
  const parsed = JSON.parse(res.body) as Record<string, unknown>;
  if (res.status >= 400 || parsed.success === false) {
    throw new Error(
      (parsed.error as string) || `MiroFish ${endpoint} returned ${res.status}`
    );
  }
  return (parsed.data ?? parsed) as T;
}

// ─── Graph endpoints ───────────────────────────────────────

/**
 * POST /api/graph/ontology/generate  (multipart/form-data)
 * Uploads a seed document file and simulation requirement.
 * Returns { project_id, ontology, ... }
 */
export async function createProjectFromSeedDoc(
  seedFilePath: string,
  simulationRequirement: string,
  projectName: string
): Promise<{ projectId: string }> {
  const fileBuffer = fs.readFileSync(seedFilePath);
  const fileName = path.basename(seedFilePath);

  // Build multipart/form-data manually to avoid Node 18 fetch+FormData IPv6 bug
  const boundary = `----MiroFish${Date.now()}`;
  const parts: Buffer[] = [];

  // File part
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="${fileName}"\r\nContent-Type: text/markdown\r\n\r\n`
  ));
  parts.push(fileBuffer);
  parts.push(Buffer.from('\r\n'));

  // simulation_requirement part
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="simulation_requirement"\r\n\r\n${simulationRequirement}\r\n`
  ));

  // project_name part
  parts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="project_name"\r\n\r\n${projectName}\r\n`
  ));

  parts.push(Buffer.from(`--${boundary}--\r\n`));
  const body = Buffer.concat(parts);

  const url = `${getMirofishBase()}/api/graph/ontology/generate`;
  const res = await httpRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body,
  });
  const parsed = JSON.parse(res.body) as Record<string, unknown>;
  if (res.status >= 400 || parsed.success === false) {
    throw new Error((parsed.error as string) || `ontology/generate returned ${res.status}`);
  }
  const data = parsed.data as { project_id: string };
  return { projectId: data.project_id };
}

/**
 * POST /api/graph/build
 * Starts async graph build. Returns task_id.
 */
export async function startGraphBuild(
  projectId: string
): Promise<{ taskId: string }> {
  const data = await mfJson<{ task_id: string }>('/api/graph/build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: projectId }),
  });
  return { taskId: data.task_id };
}

/**
 * GET /api/graph/task/{taskId}
 * Returns task status: { status, progress, message, result? }
 */
export async function getGraphTaskStatus(taskId: string): Promise<{
  status: string;
  progress: number;
  message: string;
  result?: { graph_id: string };
}> {
  return mfJson(`/api/graph/task/${taskId}`);
}

/**
 * Polls graph build task until completed.
 * Returns the graph_id.
 */
export async function waitForGraphBuild(
  taskId: string,
  timeoutMs = 900_000
): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const task = await getGraphTaskStatus(taskId);
    if (task.status === 'completed' && task.result?.graph_id) {
      return task.result.graph_id;
    }
    if (task.status === 'failed') {
      throw new Error(`Graph build failed: ${task.message}`);
    }
    await sleep(5000);
  }
  throw new Error('Graph build timed out');
}

/**
 * GET /api/graph/project/{projectId}
 */
export async function getProject(
  projectId: string
): Promise<{ graph_id?: string; status: string }> {
  return mfJson(`/api/graph/project/${projectId}`);
}

// ─── Simulation endpoints ──────────────────────────────────

/**
 * POST /api/simulation/create
 * Creates a simulation under a project. Returns simulation_id.
 */
export async function createSimulation(
  projectId: string,
  options?: { enableTwitter?: boolean; enableReddit?: boolean }
): Promise<string> {
  const data = await mfJson<{ simulation_id: string }>(
    '/api/simulation/create',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        enable_twitter: options?.enableTwitter ?? true,
        enable_reddit: options?.enableReddit ?? false,
      }),
    }
  );
  return data.simulation_id;
}

/**
 * POST /api/simulation/prepare
 * Starts async env setup (persona generation, config). Returns task_id.
 */
export async function startPrepare(
  simulationId: string
): Promise<{ taskId: string; alreadyPrepared: boolean }> {
  const data = await mfJson<{
    task_id?: string;
    already_prepared?: boolean;
    status: string;
  }>('/api/simulation/prepare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ simulation_id: simulationId }),
  });

  if (data.already_prepared) {
    return { taskId: '', alreadyPrepared: true };
  }
  return { taskId: data.task_id ?? '', alreadyPrepared: false };
}

/**
 * POST /api/simulation/prepare/status
 * Polls preparation progress. Can query by task_id or simulation_id.
 */
export async function getPrepareStatus(
  simulationId: string,
  taskId?: string
): Promise<{ status: string; progress: number; alreadyPrepared: boolean }> {
  const data = await mfJson<{
    status: string;
    progress?: number;
    already_prepared?: boolean;
  }>('/api/simulation/prepare/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      simulation_id: simulationId,
      ...(taskId ? { task_id: taskId } : {}),
    }),
  });
  return {
    status: data.status,
    progress: data.progress ?? 0,
    alreadyPrepared: data.already_prepared ?? false,
  };
}

/**
 * Polls preparation until ready.
 */
export async function waitForPrepare(
  simulationId: string,
  taskId: string,
  timeoutMs = 600_000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ps = await getPrepareStatus(simulationId, taskId || undefined);
    if (ps.status === 'ready' || ps.status === 'completed' || ps.alreadyPrepared) {
      return;
    }
    if (ps.status === 'failed') {
      throw new Error('Simulation preparation failed');
    }
    await sleep(5000);
  }
  throw new Error('Simulation preparation timed out');
}

/**
 * POST /api/simulation/start
 * Starts the actual simulation run.
 */
export async function startSimulation(
  simulationId: string,
  options?: { platform?: string; maxRounds?: number }
): Promise<void> {
  await mfJson('/api/simulation/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      simulation_id: simulationId,
      platform: options?.platform ?? 'twitter',
      ...(options?.maxRounds ? { max_rounds: options.maxRounds } : {}),
    }),
  });
}

/**
 * GET /api/simulation/{simulationId}/run-status
 * Returns current run state.
 */
export async function getRunStatus(simulationId: string): Promise<{
  runner_status: string;
  current_round: number;
  total_rounds: number;
  progress_percent: number;
}> {
  return mfJson(`/api/simulation/${simulationId}/run-status`);
}

/**
 * Polls simulation until completed/stopped.
 */
export async function waitForSimulationComplete(
  simulationId: string,
  timeoutMs = 7_200_000 // 2 hours — simulations with 30+ agents on free tier LLMs can be slow
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const rs = await getRunStatus(simulationId);
    if (
      rs.runner_status === 'completed' ||
      rs.runner_status === 'stopped'
    ) {
      return;
    }
    if (rs.runner_status === 'failed' || rs.runner_status === 'error') {
      throw new Error('Simulation run failed');
    }
    await sleep(5000);
  }
  throw new Error('Simulation timed out');
}

/**
 * GET /api/simulation/{simulationId}/actions
 * Returns action log.
 */
export async function getActions(
  simulationId: string,
  limit = 500
): Promise<{ count: number; actions: unknown[] }> {
  return mfJson(
    `/api/simulation/${simulationId}/actions?limit=${limit}`
  );
}

// ─── Report endpoints ──────────────────────────────────────

/**
 * POST /api/report/generate
 * Starts async report generation. Returns task_id + report_id.
 */
export async function startReportGeneration(
  simulationId: string
): Promise<{ taskId: string; reportId: string; alreadyGenerated: boolean }> {
  const data = await mfJson<{
    task_id?: string;
    report_id: string;
    already_generated?: boolean;
    status: string;
  }>('/api/report/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ simulation_id: simulationId }),
  });

  if (data.already_generated) {
    return {
      taskId: '',
      reportId: data.report_id,
      alreadyGenerated: true,
    };
  }
  return {
    taskId: data.task_id ?? '',
    reportId: data.report_id,
    alreadyGenerated: false,
  };
}

/**
 * POST /api/report/generate/status
 * Polls report generation progress.
 */
export async function getReportGenerationStatus(
  simulationId: string,
  taskId?: string
): Promise<{
  status: string;
  progress: number;
  alreadyCompleted: boolean;
  reportId?: string;
}> {
  const data = await mfJson<{
    status: string;
    progress?: number;
    already_completed?: boolean;
    report_id?: string;
  }>('/api/report/generate/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      simulation_id: simulationId,
      ...(taskId ? { task_id: taskId } : {}),
    }),
  });
  return {
    status: data.status,
    progress: data.progress ?? 0,
    alreadyCompleted: data.already_completed ?? false,
    reportId: data.report_id,
  };
}

/**
 * Polls report generation until completed.
 */
export async function waitForReportComplete(
  simulationId: string,
  taskId: string,
  timeoutMs = 1_800_000 // 30 min
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const rs = await getReportGenerationStatus(
      simulationId,
      taskId || undefined
    );
    if (
      rs.status === 'completed' ||
      rs.alreadyCompleted
    ) {
      return;
    }
    if (rs.status === 'failed') {
      throw new Error('Report generation failed');
    }
    await sleep(5000);
  }
  throw new Error('Report generation timed out');
}

/**
 * GET /api/report/{reportId}
 * Returns full report with markdown_content.
 */
export async function getReport(reportId: string): Promise<{
  report_id: string;
  simulation_id: string;
  status: string;
  markdown_content: string;
}> {
  return mfJson(`/api/report/${reportId}`);
}

/**
 * GET /api/report/by-simulation/{simulationId}
 * Returns report for a given simulation.
 */
export async function getReportBySimulation(simulationId: string): Promise<{
  report_id: string;
  markdown_content: string;
}> {
  return mfJson(`/api/report/by-simulation/${simulationId}`);
}
