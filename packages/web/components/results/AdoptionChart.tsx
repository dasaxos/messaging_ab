'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { SentimentOverTime } from '@ab-predictor/shared';

interface Props {
  sentimentA: SentimentOverTime[];
  sentimentB: SentimentOverTime[];
}

export default function AdoptionChart({ sentimentA, sentimentB }: Props) {
  // Build cumulative positive signals per round
  const maxRounds = Math.max(sentimentA.length, sentimentB.length);
  const data: { round: string; A: number; B: number }[] = [];

  let cumA = 0;
  let cumB = 0;
  for (let i = 0; i < maxRounds; i++) {
    cumA += sentimentA[i]?.positive ?? 0;
    cumB += sentimentB[i]?.positive ?? 0;
    data.push({
      round: `Round ${i + 1}`,
      A: cumA,
      B: cumB,
    });
  }

  return (
    <section className="mb-16 bg-surface-container rounded-xl p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Adoption Velocity
          </h2>
          <p className="text-sm text-on-surface-variant">
            Cumulative positive buyer signals per round
          </p>
        </div>
        <div className="flex gap-4 font-mono text-[11px] uppercase tracking-tighter">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full" /> Message A
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary rounded-full" /> Message B
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid stroke="#424754" strokeOpacity={0.2} />
          <XAxis
            dataKey="round"
            tick={{ fill: '#8c909f', fontSize: 10, fontFamily: 'Berkeley Mono, monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            label={{
              value: 'Positive buyer signals',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#8c909f', fontSize: 10, fontFamily: 'Berkeley Mono, monospace' },
            }}
            tick={{ fill: '#8c909f', fontSize: 10, fontFamily: 'Berkeley Mono, monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#201f20',
              border: '1px solid rgba(66,71,84,0.3)',
              borderRadius: 8,
              color: '#e5e2e3',
              fontFamily: 'Berkeley Mono, monospace',
              fontSize: 11,
            }}
          />
          <Line
            type="monotone"
            dataKey="A"
            stroke="#adc6ff"
            strokeWidth={3}
            dot={false}
            name="Message A"
          />
          <Line
            type="monotone"
            dataKey="B"
            stroke="#ffb0cd"
            strokeWidth={3}
            strokeDasharray="8 4"
            dot={false}
            name="Message B"
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
