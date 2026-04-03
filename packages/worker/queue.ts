import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const QUEUE_NAME = 'ab-simulation';

let _queue: Queue | null = null;

export function getQueue(): Queue {
  if (!_queue) {
    const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
    _queue = new Queue(QUEUE_NAME, { connection });
  }
  return _queue;
}

export async function enqueueJob(jobId: string): Promise<void> {
  const queue = getQueue();
  await queue.add('process-simulation', { jobId }, { jobId });
}
