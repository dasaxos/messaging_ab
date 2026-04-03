export default function StatusLoading() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#131314] flex justify-between items-center w-full px-6 h-14">
        <div className="text-lg font-bold tracking-tighter text-primary">
          Messaging A/B
        </div>
      </header>
      <main className="pt-24 pb-20 px-6 max-w-[600px] mx-auto flex flex-col items-center animate-pulse">
        <div className="w-full text-center mb-12">
          <div className="h-8 bg-surface-container rounded w-3/4 mx-auto mb-4" />
          <div className="h-4 bg-surface-container rounded w-1/3 mx-auto mb-8" />
          <div className="h-1 bg-surface-container rounded-full w-full" />
        </div>
        <div className="w-full space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-6">
              <div className="w-6 h-6 rounded-full bg-surface-container" />
              <div className="flex-1 h-5 bg-surface-container rounded" />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
