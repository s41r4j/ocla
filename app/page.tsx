import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="mx-auto max-w-3xl space-y-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 sm:text-6xl">
          Open Cyber LLM Arena
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed mx-auto max-w-2xl">
          The crowdsourced benchmarking platform for evaluating LLMs on <span className="text-gray-200 font-medium">real-world cybersecurity tasks</span>.
          Run privacy-first benchmarks directly in your browser.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/benchmark"
            className="group flex items-center gap-2 rounded-full bg-green-500 px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20"
          >
            Start Benchmark
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-full border border-gray-700 bg-gray-900/50 px-8 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
          >
            View Leaderboard
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-500/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="relative mb-2 text-xl font-bold text-gray-100 group-hover:text-blue-200">High Trust & Privacy</h3>
          <p className="relative text-sm font-medium leading-relaxed text-gray-400 group-hover:text-gray-300">
            Your API keys never leave your browser. Benchmarks run locally on your device, sending requests directly to the provider.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:bg-purple-500/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="relative mb-2 text-xl font-bold text-gray-100 group-hover:text-purple-200">Local Model Support</h3>
          <p className="relative text-sm font-medium leading-relaxed text-gray-400 group-hover:text-gray-300">
            Seamlessly benchmark local models via Ollama, LM Studio, or llama.cpp. Just point OCLA to your localhost endpoint.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-500/30">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="relative mb-2 text-xl font-bold text-gray-100 group-hover:text-emerald-200">Anonymous Sharing</h3>
          <p className="relative text-sm font-medium leading-relaxed text-gray-400 group-hover:text-gray-300">
            Contribute to the community by sharing aggregated scores. No prompt text, response content, or IP addresses are ever recorded.
          </p>
        </div>
      </section>

      {/* Info Banner */}
      <section className="relative overflow-hidden rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-transparent p-6 backdrop-blur-sm transition-all hover:border-yellow-500/40">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500 ring-1 ring-yellow-500/30">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-yellow-200">Pre-loaded Safety Prompts</h3>
            <p className="mt-1 text-base text-yellow-200/80 leading-relaxed">
              OCLA ships with a curated &quot;Safe Pack&quot; containing educational cybersecurity prompts.
              You can also import your own custom packs (JSON) for internal red-teaming and evaluation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
