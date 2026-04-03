import InputForm from '@/components/InputForm';

export default function Home() {
  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center w-full px-6 py-3 sticky top-0 z-50 bg-[#131314]">
        <div className="text-xl font-bold tracking-tighter text-primary">
          Messaging A/B
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container p-2 rounded transition-all text-sm">
            help
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-24">
        {/* Hero */}
        <section className="py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-white mb-6">
            Predict which messaging wins with A/B tests on digital ICPs
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            50 AI buyer personas simulate how your market reacts to your messaging.
            Get results in ~20 minutes.
          </p>
          <div className="flex items-center justify-center gap-6 text-on-surface-variant mono-label text-[10px] uppercase tracking-widest opacity-60">
            <span>Free</span>
            <span className="w-1 h-1 bg-outline-variant rounded-full" />
            <span>No signup</span>
            <span className="w-1 h-1 bg-outline-variant rounded-full" />
            <span>Powered by swarm intelligence</span>
          </div>
          <div className="mt-16 animate-bounce">
            <span className="material-symbols-outlined text-outline-variant">
              expand_more
            </span>
          </div>
        </section>

        {/* Form */}
        <InputForm />
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/15 bg-[#131314] py-8 w-full mt-24">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto w-full mono-label text-[10px] uppercase tracking-widest">
          <div className="text-on-surface-variant mb-4 md:mb-0">
            Built by{' '}
            <a
              href="https://www.linkedin.com/in/hayk-kocharyan/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Hayk Kocharyan
            </a>
          </div>
          <div className="flex gap-8">
            <a
              href="https://github.com/666ghj/MiroFish"
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant hover:text-primary transition-all"
            >
              Powered by MiroFish
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
