import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-screen pt-12 pb-6">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <main className="relative z-10 mx-auto max-w-7xl px-6 space-y-12">

        {/* Hero Section */}
        <section className="space-y-8 text-center max-w-4xl mx-auto">

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 block md:inline">Open Cyber</span>
            <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 block md:inline md:ml-4">LLM Arena</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The crowdsourced benchmarking platform for evaluating LLMs on <span className="text-gray-200 font-medium">real-world cybersecurity tasks</span>.
            Privacy-first. Browser-based. Open-source.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 pt-8">
            <Link
              href="/benchmark"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-green-500/10 text-green-400 font-mono text-sm font-bold border border-green-500/50 hover:bg-green-500 hover:text-black hover:border-green-500 transition-all duration-200"
            >
              <span>./INITIATE_BENCHMARK</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-gray-400 font-mono text-sm font-bold border border-gray-800 hover:border-gray-600 hover:text-white transition-all duration-200"
            >
              <span>VIEW_LEADERBOARD</span>
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="group relative p-8 bg-gray-900/50 border border-white/10 hover:border-blue-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded bg-blue-500/10 text-blue-400 font-mono text-xl border border-blue-500/20">
              01
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-3 font-mono group-hover:text-blue-400 transition-colors">Trust & Privacy</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Your API keys never leave your browser. Benchmarks run locally on `localhost`, sending requests directly to the provider.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative p-8 bg-gray-900/50 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded bg-purple-500/10 text-purple-400 font-mono text-xl border border-purple-500/20">
              02
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-3 font-mono group-hover:text-purple-400 transition-colors">Local Support</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Seamlessly benchmark local models via Ollama, LM Studio, or llama.cpp. Just point OCLA to your endpoint.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative p-8 bg-gray-900/50 border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xl border border-emerald-500/20">
              03
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-3 font-mono group-hover:text-emerald-400 transition-colors">Anon Sharing</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Contribute to the community by sharing aggregated scores. No prompt text or IP addresses recorded.
            </p>
          </div>
        </section>

        {/* Info Banner */}
        <section className="relative overflow-hidden bg-gray-900 border-l-4 border-yellow-500 p-6">
          <div className="flex items-start gap-6">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center bg-yellow-500/10 text-yellow-500 font-mono font-bold border border-yellow-500/20">
              !
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-500 font-mono mb-2">SAFETY_PROTOCOLS_ACTIVE</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                OCLA operates on a strict <span className="text-gray-300 font-bold">No-Log / No-Store Policy</span>.
                All benchmarks run client-side. API keys and prompt data are <span className="text-gray-300 font-bold">never stored</span> on our servers.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
