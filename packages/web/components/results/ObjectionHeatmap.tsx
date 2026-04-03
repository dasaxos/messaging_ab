'use client';

import type { Objection } from '@ab-predictor/shared';

interface Props {
  objectionsA: Objection[];
  objectionsB: Objection[];
}

const CATEGORIES = ['pricing', 'trust', 'switching_cost', 'relevance', 'competition'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  pricing: 'Pricing',
  trust: 'Trust',
  switching_cost: 'Switching Cost',
  relevance: 'Relevance',
  competition: 'Competition',
};

function aggregate(objections: Objection[], category: string) {
  const matches = objections.filter((o) => o.category === category);
  const total = matches.reduce((sum, o) => sum + o.frequency, 0);
  const worst =
    matches.find((o) => o.severity === 'blocking')?.severity ??
    matches.find((o) => o.severity === 'concern')?.severity ??
    'minor';
  return { total, severity: worst as 'blocking' | 'concern' | 'minor' };
}

function severityLabel(a: ReturnType<typeof aggregate>, b: ReturnType<typeof aggregate>) {
  if (a.total === 0 && b.total === 0) return 'No objections';
  if (a.total < b.total) return 'A: Lower Risk';
  if (b.total < a.total) return 'B: Lower Risk';
  return 'Equal';
}

export default function ObjectionHeatmap({ objectionsA, objectionsB }: Props) {
  const maxTotal = Math.max(
    ...CATEGORIES.map((c) => Math.max(aggregate(objectionsA, c).total, aggregate(objectionsB, c).total)),
    1
  );

  return (
    <div className="lg:col-span-2 bg-surface-container rounded-xl p-8">
      <h2 className="text-xl font-bold tracking-tight mb-8">
        Objection Breakdown
      </h2>
      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const a = aggregate(objectionsA, cat);
          const b = aggregate(objectionsB, cat);
          const pctA = Math.max((a.total / maxTotal) * 100, 2);
          const pctB = Math.max((b.total / maxTotal) * 100, 2);

          return (
            <div key={cat}>
              <div className="flex justify-between text-xs font-mono uppercase mb-2">
                <span>{CATEGORY_LABELS[cat]}</span>
                <span className="text-on-surface-variant">
                  {severityLabel(a, b)}
                </span>
              </div>
              <div className="flex gap-1 h-3">
                <div
                  className="h-full bg-primary rounded-sm transition-all"
                  style={{ width: `${pctA}%`, opacity: a.severity === 'blocking' ? 1 : a.severity === 'concern' ? 0.7 : 0.4 }}
                />
                <div
                  className="h-full bg-secondary rounded-sm transition-all"
                  style={{ width: `${pctB}%`, opacity: b.severity === 'blocking' ? 1 : b.severity === 'concern' ? 0.7 : 0.4 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
