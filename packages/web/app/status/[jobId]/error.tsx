'use client';

export default function StatusError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#131314] flex justify-between items-center w-full px-6 h-14">
        <a href="/" className="text-lg font-bold tracking-tighter text-primary">
          Messaging A/B
        </a>
      </header>
      <main className="pt-24 pb-20 px-6 max-w-[600px] mx-auto text-center">
        <span className="material-symbols-outlined text-error text-5xl mb-6 block">
          error
        </span>
        <h1 className="text-2xl font-bold mb-4">
          Couldn&apos;t load simulation status
        </h1>
        <p className="text-on-surface-variant mb-8">
          There was a problem fetching your simulation status.
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
