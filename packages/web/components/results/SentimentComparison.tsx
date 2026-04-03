'use client';

import type { WordOfMouth, TierBreakdown } from '@ab-predictor/shared';

// ─── Word of Mouth ─────────────────────────────────────────

interface WomProps {
  womA: WordOfMouth;
  womB: WordOfMouth;
}

function WomCard({
  label,
  icon,
  valA,
  valB,
}: {
  label: string;
  icon: string;
  valA: number;
  valB: number;
}) {
  const winner = valA > valB ? 'A' : valB > valA ? 'B' : null;
  const winnerColor = winner === 'A' ? 'text-primary' : winner === 'B' ? 'text-secondary' : 'text-on-surface-variant';

  let delta = '';
  if (winner) {
    const high = Math.max(valA, valB);
    const low = Math.min(valA, valB);
    if (low === 0) {
      delta = `${high}x more for ${winner}`;
    } else {
      delta = `${(high / low).toFixed(1)}x more for ${winner}`;
    }
  }

  return (
    <div className="bg-surface-container p-6 rounded-xl flex items-center justify-between">
      <div>
        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1">
          {label}
        </span>
        <div className="text-lg font-bold font-mono">
          <span className="text-primary">A: {valA}</span>
          <span className="text-on-surface-variant mx-2">/</span>
          <span className="text-secondary">B: {valB}</span>
        </div>
        {delta ? (
          <div className={`text-sm mt-1 font-medium ${winnerColor}`}>
            {delta}
          </div>
        ) : (
          <div className="text-sm mt-1 text-on-surface-variant">Equal</div>
        )}
      </div>
      <span className="material-symbols-outlined text-primary/30 text-4xl">
        {icon}
      </span>
    </div>
  );
}

export function WordOfMouthCards({ womA, womB }: WomProps) {
  return (
    <div className="flex flex-col gap-4">
      <WomCard label="Shares" icon="share" valA={womA.shares} valB={womB.shares} />
      <WomCard
        label="Recommendations"
        icon="thumb_up"
        valA={womA.recommendations}
        valB={womB.recommendations}
      />
      <WomCard
        label="Warnings"
        icon="report"
        valA={womA.warnings}
        valB={womB.warnings}
      />
    </div>
  );
}

// ─── Persona Tier Breakdown ────────────────────────────────

interface TierProps {
  tiers: TierBreakdown[];
}

export function TierBreakdownTable({ tiers }: TierProps) {
  if (!tiers || tiers.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold tracking-tight mb-2">
        Persona Tier Breakdown
      </h2>
      <p className="text-sm text-on-surface-variant mb-8">
        How each buyer segment responded — most of the simulated market doesn&apos;t
        respond, and that&apos;s realistic.
      </p>
      <div className="bg-surface-container rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 px-4 md:px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/15">
          <span>Tier</span>
          <span className="text-center">Agents</span>
          <span className="text-center text-primary">A</span>
          <span className="text-center text-secondary">B</span>
        </div>
        {/* Rows */}
        {tiers.map((tier) => {
          const pctA = tier.totalAgents > 0 ? tier.engagedA / tier.totalAgents : 0;
          const pctB = tier.totalAgents > 0 ? tier.engagedB / tier.totalAgents : 0;

          return (
            <div
              key={tier.tier}
              className="grid grid-cols-4 gap-2 md:gap-4 px-4 md:px-6 py-4 items-center border-b border-outline-variant/10 last:border-b-0"
            >
              <span className="text-xs md:text-sm font-medium">{tier.tier}</span>
              <span className="text-center text-sm text-on-surface-variant font-mono">
                {tier.totalAgents}
              </span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-bold text-primary">
                  {tier.engagedA}
                </span>
                <div className="w-full h-1 bg-surface-container-low rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${pctA * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-bold text-secondary">
                  {tier.engagedB}
                </span>
                <div className="w-full h-1 bg-surface-container-low rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full"
                    style={{ width: `${pctB * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
