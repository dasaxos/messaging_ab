'use client';

import type { AdoptionSignal } from '@ab-predictor/shared';

const INTENT_LEVELS = ['strong', 'moderate', 'weak', 'none'] as const;

const INTENT_CONFIG: Record<
  string,
  { label: string; description: string; color: string }
> = {
  strong: {
    label: 'Strong Intent',
    description: 'Ready to evaluate or trial',
    color: 'bg-green-500',
  },
  moderate: {
    label: 'Moderate Interest',
    description: 'Curious, wants to learn more',
    color: 'bg-blue-400',
  },
  weak: {
    label: 'Low Interest',
    description: 'Noticed but not compelled',
    color: 'bg-yellow-500',
  },
  none: {
    label: 'No Interest',
    description: 'Ignored or dismissed',
    color: 'bg-surface-container-highest',
  },
};

function relativeLabel(a: number, b: number): string {
  if (a === 0 && b === 0) return '';
  if (a === b) return '';
  if (b === 0) return `${a}x more`;
  if (a === 0) return `${b}x more`;
  const ratio = a > b ? a / b : b / a;
  return `${ratio.toFixed(1)}x more`;
}

interface Props {
  signalsA: AdoptionSignal[];
  signalsB: AdoptionSignal[];
}

export default function BuyerIntentComparison({ signalsA, signalsB }: Props) {
  if (!signalsA?.length && !signalsB?.length) return null;

  const countByIntent = (signals: AdoptionSignal[], intent: string) =>
    signals.filter((s) => s.intent === intent).length;

  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold tracking-tight mb-2">
        Buyer Intent Breakdown
      </h2>
      <p className="text-sm text-on-surface-variant mb-8">
        How personas responded to each message — from ready to buy to not interested.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INTENT_LEVELS.map((intent) => {
          const countA = countByIntent(signalsA, intent);
          const countB = countByIntent(signalsB, intent);
          const config = INTENT_CONFIG[intent];
          const winner = countA > countB ? 'A' : countB > countA ? 'B' : null;
          const delta = relativeLabel(
            winner === 'A' ? countA : countB,
            winner === 'A' ? countB : countA
          );
          // For "none", fewer is better
          const isNone = intent === 'none';
          const betterSide = isNone
            ? countA < countB ? 'A' : countB < countA ? 'B' : null
            : winner;

          return (
            <div
              key={intent}
              className="bg-surface-container rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${config.color}`} />
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                  {config.label}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant/50 mb-4">
                {config.description}
              </p>
              {betterSide ? (
                <>
                  <div
                    className={`text-lg font-bold ${
                      betterSide === 'A' ? 'text-primary' : 'text-secondary'
                    }`}
                  >
                    Message {betterSide}
                    {isNone ? ' fewer' : ' leads'}
                  </div>
                  {delta && (
                    <div className="text-sm text-on-surface-variant mt-1">
                      {delta}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-lg font-bold text-on-surface-variant">
                  Even
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
