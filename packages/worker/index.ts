import { config } from 'dotenv';
import path from 'path';

// Load .env FIRST — must happen before any dynamic imports
config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  // Dynamic imports so they run AFTER dotenv has loaded
  const { Worker, Queue } = await import('bullmq');
  const IORedis = (await import('ioredis')).default;
  const { processJob } = await import('./orchestrator');

  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
  const QUEUE_NAME = 'ab-simulation';

  const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { jobId } = job.data as { jobId: string };
      console.log(`[worker] Processing job ${jobId}`);
      await processJob(jobId);
      console.log(`[worker] Completed job ${jobId}`);
    },
    {
      connection,
      concurrency: 1,
      lockDuration: 600_000, // 10 min lock — prevents BullMQ from thinking job is stalled during long polls
      stalledInterval: 300_000, // check stalled every 5 min
    }
  );

  worker.on('failed', (job, err) => {
    const attempt = job?.attemptsMade ?? 0;
    const maxAttempts = job?.opts?.attempts ?? 0;
    if (attempt < maxAttempts) {
      console.warn(`[worker] Job ${job?.id} attempt ${attempt}/${maxAttempts} failed (will retry): ${err.message}`);
    } else {
      console.error(`[worker] Job ${job?.id} failed permanently:`, err.message);
    }
  });

  worker.on('completed', (job) => {
    console.log(`[worker] Job ${job.id} completed`);
  });

  console.log(`[worker] Listening on queue "${QUEUE_NAME}" (redis: ${REDIS_URL})`);
}

main().catch((err) => {
  console.error('[worker] Fatal error:', err);
  process.exit(1);
});
