export default function ResultsLoading() {
  return (
    <>
      <nav className="flex justify-between items-center w-full px-6 py-3 sticky top-0 z-50 bg-[#131314]">
        <div className="text-xl font-bold tracking-tighter text-primary">
          Messaging A/B
        </div>
      </nav>
      <main className="max-w-[1000px] mx-auto px-6 py-12 animate-pulse">
        {/* Disclaimer skeleton */}
        <div className="text-center mb-12">
          <div className="h-3 bg-surface-container rounded w-2/3 mx-auto" />
        </div>

        {/* Hero skeleton */}
        <div className="text-center mb-16">
          <div className="h-6 w-48 bg-surface-container rounded-full mx-auto mb-6" />
          <div className="h-10 bg-surface-container rounded w-3/4 mx-auto mb-4" />
          <div className="h-4 bg-surface-container rounded w-1/2 mx-auto" />
        </div>

        {/* Message cards skeleton */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="h-48 bg-surface-container rounded-xl border-l-4 border-primary/30" />
          <div className="h-48 bg-surface-container rounded-xl border-l-4 border-secondary/30" />
        </div>

        {/* Chart skeleton */}
        <div className="h-80 bg-surface-container rounded-xl mb-16" />

        {/* Tier breakdown skeleton */}
        <div className="h-64 bg-surface-container rounded-xl mb-16" />

        {/* Objection + WOM skeleton */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 h-64 bg-surface-container rounded-xl" />
          <div className="flex flex-col gap-4">
            <div className="h-20 bg-surface-container rounded-xl" />
            <div className="h-20 bg-surface-container rounded-xl" />
            <div className="h-20 bg-surface-container rounded-xl" />
          </div>
        </div>

        {/* Quotes skeleton */}
        <div className="flex gap-6 mb-16 overflow-hidden">
          <div className="min-w-[280px] md:min-w-[340px] h-48 bg-surface-container rounded-xl flex-shrink-0" />
          <div className="min-w-[280px] md:min-w-[340px] h-48 bg-surface-container rounded-xl flex-shrink-0" />
          <div className="min-w-[280px] md:min-w-[340px] h-48 bg-surface-container rounded-xl flex-shrink-0" />
        </div>
      </main>
    </>
  );
}
