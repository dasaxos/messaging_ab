'use client';

import type { AgentQuote } from '@ab-predictor/shared';

interface Props {
  quotesA: AgentQuote[];
  quotesB: AgentQuote[];
}

const SENTIMENT_STYLES: Record<string, { bg: string; text: string }> = {
  positive: { bg: 'bg-green-900/30', text: 'text-green-400' },
  negative: { bg: 'bg-red-900/30', text: 'text-red-400' },
  neutral: { bg: 'bg-yellow-900/30', text: 'text-yellow-400' },
};

function QuoteCard({
  quote,
  variant,
}: {
  quote: AgentQuote;
  variant: 'A' | 'B';
}) {
  const style = SENTIMENT_STYLES[quote.sentiment] ?? SENTIMENT_STYLES.neutral;

  return (
    <div className="min-w-[280px] md:min-w-[340px] bg-surface-container-low p-6 rounded-xl border border-white/5 flex-shrink-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-sm font-bold text-on-surface-variant">
          {quote.agentName
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)}
        </div>
        <div>
          <div className="font-bold text-sm">{quote.agentName}</div>
          <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
            {quote.agentRole}
          </div>
        </div>
      </div>
      <p className="text-sm leading-relaxed mb-6 italic">
        &ldquo;{quote.quote}&rdquo;
      </p>
      <div className="flex justify-between items-center">
        <span
          className={`px-2 py-0.5 rounded ${style.bg} ${style.text} text-[10px] font-mono font-bold uppercase tracking-widest`}
        >
          {quote.sentiment}
        </span>
        <span
          className={`font-mono text-[10px] px-2 py-0.5 rounded ${
            variant === 'A'
              ? 'bg-primary/20 text-primary'
              : 'bg-secondary/20 text-secondary'
          }`}
        >
          {variant}
        </span>
      </div>
    </div>
  );
}

export default function AgentQuotes({ quotesA, quotesB }: Props) {
  // Interleave quotes, ensuring we include negative/skeptic ones
  const all: { quote: AgentQuote; variant: 'A' | 'B' }[] = [];
  const maxLen = Math.max(quotesA.length, quotesB.length);
  for (let i = 0; i < maxLen; i++) {
    if (quotesA[i]) all.push({ quote: quotesA[i], variant: 'A' });
    if (quotesB[i]) all.push({ quote: quotesB[i], variant: 'B' });
  }

  if (all.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-xl font-bold tracking-tight mb-8">
        Synthesis of Agent Feedback
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar">
        {all.map((item, i) => (
          <QuoteCard key={i} quote={item.quote} variant={item.variant} />
        ))}
      </div>
    </section>
  );
}
