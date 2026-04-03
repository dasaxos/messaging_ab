'use client';

export default function ResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <nav className="flex justify-between items-center w-full px-6 py-3 sticky top-0 z-50 bg-[#131314]">
        <a href="/" className="text-xl font-bold tracking-tighter text-primary">
          Messaging A/B
        </a>
      </nav>
      <main className="max-w-[600px] mx-auto px-6 py-24 text-center">
        <span className="material-symbols-outlined text-error text-5xl mb-6 block">
          error
        </span>
        <h1 className="text-2xl font-bold mb-4">
          Something went wrong
        </h1>
        <p className="text-on-surface-variant mb-8">
          We couldn&apos;t load your results. This might be a temporary issue.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          >
            Try again
          </button>
          <a
            href="/"
            className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all"
          >
            Run a new test
          </a>
        </div>
      </main>
    </>
  );
}
