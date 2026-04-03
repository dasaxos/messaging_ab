'use client';

import type { ResultsResponse } from '@ab-predictor/shared';
import ObjectionHeatmap from './ObjectionHeatmap';
import AgentQuotes from './AgentQuotes';
import { WordOfMouthCards } from './SentimentComparison';
import EmailMetricsCard from './EmailMetricsCard';
import { useState } from 'react';

function ConfidenceBadge({ confidence }: { confidence: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
      <span
        className="material-symbols-outlined text-[18px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        verified
      </span>
      <span className="font-mono text-[11px] uppercase tracking-widest font-bold">
        {confidence} Confidence Result
      </span>
    </div>
  );
}

function MessageCard({
  variant,
  label,
  headline,
  copy,
  isWinner,
}: {
  variant: 'A' | 'B';
  label: string;
  headline: string;
  copy?: string;
  isWinner: boolean;
}) {
  const borderColor = variant === 'A' ? 'border-primary' : 'border-secondary';
  const monoColor = variant === 'A' ? 'text-primary' : 'text-secondary';

  return (
    <div
      className={`group relative overflow-hidden p-8 rounded-xl bg-surface-container border-l-4 ${borderColor} transition-all hover:bg-surface-container-high`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <span
            className={`font-mono text-[10px] ${monoColor} uppercase tracking-widest font-bold mb-1 block`}
          >
            Variant {variant}
          </span>
          <h3 className="text-2xl font-bold">{label}</h3>
        </div>
        {isWinner ? (
          <div className="bg-primary/20 text-primary px-3 py-1 rounded text-sm font-bold">
            WINNER
          </div>
        ) : (
          <div className="bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded text-sm font-bold">
            CHALLENGER
          </div>
        )}
      </div>
      <p className="text-on-surface-variant mb-6 leading-relaxed italic">
        &ldquo;{headline}&rdquo;
      </p>
      {copy && (
        <p className="text-on-surface-variant/60 text-sm leading-relaxed">
          {copy}
        </p>
      )}
    </div>
  );
}

export default function Dashboard({ data }: { data: ResultsResponse }) {
  const { formInput, resultsA, resultsB, comparison } = data;
  const [copied, setCopied] = useState(false);

  const winnerHeading =
    comparison.winner === 'tie'
      ? 'Too close to call'
      : `${comparison.winnerLabel || `Message ${comparison.winner}`} resonated more strongly`;

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* 0. Credibility Disclaimer */}
      <div className="text-center mb-12 px-4">
        <p className="text-[11px] text-on-surface-variant/50 max-w-2xl mx-auto leading-relaxed">
          These results show relative performance between your two messages
          based on 50 simulated buyer personas. They predict which message
          resonates better, not exact conversion rates. Think of it as a
          high-fidelity focus group, not a market forecast.
        </p>
      </div>

      {/* 1. Hero / Winner Announcement */}
      <header className="mb-16 text-center">
        <ConfidenceBadge confidence={comparison.confidence} />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          {winnerHeading}
        </h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">
          {comparison.summary}
        </p>
      </header>

      {/* Message Cards */}
      <section className="grid md:grid-cols-2 gap-6 mb-16">
        <MessageCard
          variant="A"
          label={formInput.approachLabelA || 'Message A'}
          headline={formInput.headlineA}
          copy={formInput.supportingCopyA}
          isWinner={comparison.winner === 'A'}
        />
        <MessageCard
          variant="B"
          label={formInput.approachLabelB || 'Message B'}
          headline={formInput.headlineB}
          copy={formInput.supportingCopyB}
          isWinner={comparison.winner === 'B'}
        />
      </section>

      {/* 2. Email Metrics */}
      <EmailMetricsCard
        emailEngagementA={resultsA.emailEngagement}
        emailEngagementB={resultsB.emailEngagement}
        labelA={formInput.approachLabelA || 'Message A'}
        labelB={formInput.approachLabelB || 'Message B'}
      />

      {/* 3. Objection Breakdown + 4. Word of Mouth */}
      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        <ObjectionHeatmap
          objectionsA={resultsA.objections}
          objectionsB={resultsB.objections}
        />
        <WordOfMouthCards
          womA={resultsA.wordOfMouth}
          womB={resultsB.wordOfMouth}
        />
      </div>

      {/* 6. Agent Quotes */}
      <AgentQuotes
        quotesA={resultsA.agentQuotes}
        quotesB={resultsB.agentQuotes}
      />

      {/* 7. Dominant Narrative Comparison */}
      <section className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-surface-container p-8 rounded-xl border border-primary/10">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">
              psychology
            </span>
            <h3 className="font-bold text-lg">Variant A Narrative</h3>
          </div>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {resultsA.dominantNarrative}
          </p>
        </div>
        <div className="bg-surface-container p-8 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-secondary">
              inventory_2
            </span>
            <h3 className="font-bold text-lg">Variant B Narrative</h3>
          </div>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {resultsB.dominantNarrative}
          </p>
        </div>
      </section>

      {/* 8. Key Insight Callout */}
      <section className="bg-gradient-to-br from-primary-container/20 to-surface-container p-1 rounded-xl mb-16">
        <div className="bg-surface-container-lowest p-8 rounded-[10px] flex flex-col md:flex-row gap-8 items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-3 tracking-tight">
              {comparison.keyInsight}
            </h3>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              {comparison.recommendation}
            </p>
          </div>
        </div>
      </section>

      {/* 9. Footer Actions */}
      <footer className="flex flex-col md:flex-row justify-between items-center py-8 border-t border-outline-variant/15">
        <div className="flex items-center gap-4 mb-6 md:mb-0">
          <a
            href="/"
            className="bg-on-surface text-background px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2"
          >
            Run another test
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </a>
          <button
            onClick={handleShare}
            className="bg-surface-container-high text-on-surface px-8 py-3 rounded-xl font-bold hover:bg-surface-container-highest transition-all"
          >
            {copied ? 'Copied!' : 'Share results'}
          </button>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex gap-4 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            <a
              href="https://www.linkedin.com/in/hayk-kocharyan/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-all"
            >
              Built by Hayk Kocharyan
            </a>
            <a
              href="https://github.com/666ghj/MiroFish"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-all"
            >
              Powered by MiroFish
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
