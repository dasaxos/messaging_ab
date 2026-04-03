'use client';

import type { EmailEngagement } from '@ab-predictor/shared';

function relativeLabel(a: number, b: number): string {
  if (a === 0 && b === 0) return 'Comparable';
  if (b === 0) return `${a}x more`;
  const ratio = a / b;
  if (ratio > 1.05) return `${ratio.toFixed(1)}x more`;
  if (ratio < 0.95) return `${(1 / ratio).toFixed(1)}x more`;
  return 'Comparable';
}

function MetricCard({
  label,
  icon,
  valA,
  valB,
  labelA,
  labelB,
  suffix,
}: {
  label: string;
  icon: string;
  valA: number;
  valB: number;
  labelA: string;
  labelB: string;
  suffix: string;
}) {
  const winner = valA > valB ? 'A' : valB > valA ? 'B' : null;
  const winnerLabel = winner === 'A' ? labelA : winner === 'B' ? labelB : null;
  const delta = relativeLabel(
    winner === 'A' ? valA : valB,
    winner === 'A' ? valB : valA
  );
  const winnerColor = winner === 'A' ? 'text-primary' : winner === 'B' ? 'text-secondary' : 'text-on-surface-variant';

  return (
    <div className="bg-surface-container p-6 rounded-xl flex items-center justify-between">
      <div>
        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1">
          {label}
        </span>
        {winnerLabel ? (
          <>
            <div className={`text-lg font-bold ${winnerColor}`}>
              {winnerLabel}
            </div>
            <div className="text-sm text-on-surface-variant mt-1">
              {delta} {suffix}
            </div>
          </>
        ) : (
          <div className="text-lg font-bold text-on-surface-variant">
            Comparable {suffix.replace('likely to ', '').replace('click-through', 'click rates')}
          </div>
        )}
      </div>
      <span className="material-symbols-outlined text-primary/30 text-4xl">
        {icon}
      </span>
    </div>
  );
}

export default function EmailMetricsCard({
  emailEngagementA,
  emailEngagementB,
  labelA,
  labelB,
}: {
  emailEngagementA?: EmailEngagement;
  emailEngagementB?: EmailEngagement;
  labelA: string;
  labelB: string;
}) {
  if (!emailEngagementA || !emailEngagementB) return null;

  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold tracking-tight mb-2">
        Predicted Email Performance
      </h2>
      <p className="text-sm text-on-surface-variant mb-8">
        Inferred from simulation — how these personas would likely respond to a cold email with each subject line.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <MetricCard
          label="Predicted Opens"
          icon="mail"
          valA={emailEngagementA.opens}
          valB={emailEngagementB.opens}
          labelA={labelA}
          labelB={labelB}
          suffix="likely to open"
        />
        <MetricCard
          label="Predicted Clicks"
          icon="ads_click"
          valA={emailEngagementA.clicks}
          valB={emailEngagementB.clicks}
          labelA={labelA}
          labelB={labelB}
          suffix="click-through"
        />
      </div>
    </section>
  );
}
