import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Open Cyber LLM Arena</h1>
        <p className="max-w-3xl text-gray-300">
          OCLA is a transparent, crowdsourced benchmarking platform for evaluating Large Language
          Models (LLMs) on cybersecurity tasks. Runs are local-first and can be shared anonymously
          to power a public leaderboard.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/benchmark"
            className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-black hover:bg-green-400"
          >
            Run a benchmark
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-md border border-gray-800 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-900"
          >
            View leaderboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-4">
          <h2 className="font-medium">High trust</h2>
          <p className="mt-2 text-sm text-gray-300">
            Benchmark runs entirely in your browser. Your API key is sent only to the provider and
            never to OCLA.
          </p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-4">
          <h2 className="font-medium">Local models</h2>
          <p className="mt-2 text-sm text-gray-300">
            Point OCLA at a localhost OpenAI-compatible endpoint (Ollama / LM Studio / llama.cpp).
            You may need to enable CORS.
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Offline runner: <a href="/ocla-runner.mjs">download</a> ·{" "}
            <a href="/ocla-runner.sha256">pinned hash</a>
          </p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-4">
          <h2 className="font-medium">Optional sharing</h2>
          <p className="mt-2 text-sm text-gray-300">
            Share only aggregated scores (no prompts, no responses, no API keys, no IP logging) to
            improve the public leaderboard.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-yellow-900/60 bg-yellow-950/30 p-4">
        <h2 className="font-medium text-yellow-200">Important</h2>
        <p className="mt-2 text-sm text-yellow-100/90">
          OCLA ships with a safe example prompt pack. You can import your own prompt packs for
          internal testing.
        </p>
      </section>
    </div>
  );
}
