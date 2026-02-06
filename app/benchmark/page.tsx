"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";

import { ProviderSelector, type ProviderSelection } from "@/components/ProviderSelector";
import { PromptPackSelector } from "@/components/PromptPackSelector";
import { ResultsTable } from "@/components/ResultsTable";

import { runBenchmarkItem, summarize } from "@/lib/benchmarkRunner";
import { useBenchmark } from "@/lib/BenchmarkContext";
import { DEFAULT_PROMPT_PACKS } from "@/lib/prompts";
import { PROVIDER_PRESETS } from "@/lib/providers";
import { ATTACK_STRATEGIES, type AttackStrategy } from "@/lib/strategies";
import type { BenchmarkRun, BenchmarkItem } from "@/lib/types";
import { downloadTextFile, getOrCreateUserHash, nowIso, sha256Hex } from "@/lib/utils";

function toCsv(run: BenchmarkRun) {
  const header = ["prompt_id", "category", "title", "score", "refused", "latency_ms"].join(",");
  const lines = run.items.map((i) =>
    [
      i.promptId,
      i.category,
      JSON.stringify(i.title),
      i.score,
      i.refused ? 1 : 0,
      i.latencyMs
    ].join(",")
  );
  return [header, ...lines].join("\n");
}

function sharePayload(run: BenchmarkRun) {
  const { items: _items, ...payload } = run;
  return payload;
}

export default function BenchmarkPage() {
  const { state, startBenchmark, cancelBenchmark, resetState } = useBenchmark();

  // Default to OpenAI (gpt-4o)
  const [providerSelection, setProviderSelection] = useState<ProviderSelection>(() => {
    const preset = PROVIDER_PRESETS.find((p) => p.id === "openai") ?? PROVIDER_PRESETS[0]!;
    return {
      providerId: preset.id,
      baseUrl: preset.baseUrl,
      model: preset.defaultModel ?? "",
      apiKey: ""
    };
  });

  const [promptPack, setPromptPack] = useState(DEFAULT_PROMPT_PACKS[0]!);
  const [dbEnabled, setDbEnabled] = useState<boolean | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("direct");

  const preset = PROVIDER_PRESETS.find((p) => p.id === providerSelection.providerId) ?? PROVIDER_PRESETS[0]!;

  // Sync state from context if resuming
  useEffect(() => {
    if (state.config && state.status !== "idle") {
      setProviderSelection(prev => ({
        ...prev,
        providerId: state.config!.providerId,
        baseUrl: state.config!.baseUrl,
        model: state.config!.model,
        apiKey: state.config!.apiKey // Restore key if saved? Context saves it.
      }));
    }
  }, [state.config, state.status]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const json = (await res.json()) as { dbEnabled?: boolean };
        if (cancelled) return;
        setDbEnabled(Boolean(json.dbEnabled));
      } catch {
        if (cancelled) return;
        setDbEnabled(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reconstruct BenchmarkRun object from context state
  // We need to async calculate hashes/ids to make it a valid run object
  const [run, setRun] = useState<BenchmarkRun | null>(null);

  useEffect(() => {
    if (state.results.length === 0) {
      setRun(null);
      return;
    }

    const summary = summarize(state.results);

    // We construct a partial run object synchronously for UI
    // For specific fields like hashes, we might need to recalculate or store them in context
    // For now, we generate ad-hoc for display
    const mockRun: BenchmarkRun = {
      runId: "restored_" + (state.startedAt || Date.now()),
      createdAt: new Date(state.startedAt || Date.now()).toISOString(),
      execution: "browser",
      trustLevel: 3,
      trustReason: "In-browser execution",
      providerId: state.config?.providerId || providerSelection.providerId,
      baseUrl: state.config?.baseUrl || providerSelection.baseUrl,
      model: state.config?.model || providerSelection.model,
      promptPackId: promptPack.id, // Assumption
      promptPackSha256: "unknown", // Would need async calc
      buildSha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
      userHash: "local",
      summary,
      items: state.results
    };

    setRun(mockRun);
  }, [state.results, state.config, state.startedAt, providerSelection, promptPack.id]);

  async function handleBenchmarkComplete(results: BenchmarkItem[]) {
    toast.success("Benchmark complete.");

    // Auto-submit if DB is enabled
    if (dbEnabled !== false) {
      const toastId = toast.loading("Submitting results...");
      try {
        const summary = summarize(results);
        const promptPackSha256 = await sha256Hex(JSON.stringify(promptPack));

        const runId = globalThis.crypto?.randomUUID?.() ?? `run_${Math.random().toString(16).slice(2)}`;

        // Ensure accurate metadata even if resuming
        const finalRun: BenchmarkRun = {
          runId,
          createdAt: nowIso(),
          execution: "browser",
          trustLevel: 3,
          trustReason: "In-browser execution (API key never sent to server routes).",
          providerId: preset.id,
          baseUrl: providerSelection.baseUrl.trim(),
          model: providerSelection.model.trim(),
          promptPackId: promptPack.id,
          promptPackSha256,
          buildSha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
          userHash: getOrCreateUserHash(),
          summary,
          items: results
        };

        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sharePayload(finalRun))
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Auto-submit failed:", text);
          toast.error("Failed to submit results", { id: toastId });
        } else {
          toast.success("Results uploaded to Leaderboard!", { id: toastId });
        }
      } catch (error) {
        console.error("Auto-submit error", error);
        toast.error("Submission error", { id: toastId });
      }
    }
  }

  async function onRun() {
    if (!providerSelection.baseUrl.trim()) {
      toast.error("Base URL is required.");
      return;
    }
    if (!providerSelection.model.trim()) {
      toast.error("Model is required.");
      return;
    }

    // API Key check (skip for local providers)
    if (!providerSelection.apiKey && !["ollama", "lmstudio", "custom"].includes(preset.id)) {
      toast.error(`API Key is required for ${preset.name}`);
      return;
    }

    // Start via Context
    startBenchmark({
      providerId: preset.id,
      provider: preset,
      baseUrl: providerSelection.baseUrl.trim(),
      model: providerSelection.model.trim(),
      apiKey: providerSelection.apiKey || "",
      prompts: promptPack.prompts,
      runFn: runBenchmarkItem,
      onComplete: handleBenchmarkComplete,
      // Pass the selected strategy ID
      // @ts-ignore - Context types might need update, but runtime will work if we pass extra props
      strategyId: selectedStrategy
    });
  }

  const isRunning = state.status === "running";
  const progress = isRunning && state.progress.total > 0 ? {
    completed: state.progress.current,
    total: state.progress.total,
    label: state.progress.currentPrompt || "Processing..."
  } : null;

  // ... imports and previous code ...

  return (
    <div className="relative min-h-screen py-12">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 space-y-8">
        <div className="space-y-2 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
              Benchmark Terminal
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            Client-side evaluation. API keys remain local.
          </p>
        </div>

        {/* Section 1: Provider Configuration (Full Width) */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider font-mono">
            1. Target Model
          </h2>
          <div className="rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-md p-6">
            <ProviderSelector presets={PROVIDER_PRESETS} value={providerSelection} onChange={setProviderSelection} />
          </div>
        </section>

        {/* Section 2: Test Protocol (Grid) */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider font-mono">
            2. Test Protocol
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Col 1: Content Source */}
            <div className="space-y-4 rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-md p-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">
                Prompt Source
              </h3>
              <PromptPackSelector packs={DEFAULT_PROMPT_PACKS} value={promptPack} onChange={setPromptPack} />
            </div>

            {/* Col 2: Adversarial Strategy */}
            <div className="space-y-4 rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-md p-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">
                Red Team Layer
              </h3>
              <div className="space-y-2">
                <select
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-gray-200 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                >
                  {ATTACK_STRATEGIES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="min-h-[40px]">
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {ATTACK_STRATEGIES.find(s => s.id === selectedStrategy)?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Col 3: Controls */}
            <div className="space-y-4 rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-md p-6 flex flex-col justify-between">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">
                Execution Control
              </h3>

              <div className="space-y-3">
                {dbEnabled === false && (
                  <div className="rounded p-2 bg-yellow-950/30 text-xs text-yellow-200/80 font-mono border border-yellow-500/20 text-center">
                    ⚠ Database Disconnected
                  </div>
                )}

                {isRunning ? (
                  <button
                    className="w-full rounded-lg bg-red-500/10 border border-red-500/50 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/20 font-mono transition-all"
                    onClick={cancelBenchmark}
                    type="button"
                  >
                    ABORT_BENCHMARK
                  </button>
                ) : (
                  <>
                    {state.results.length > 0 && state.status !== "completed" ? (
                      <button
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500 font-mono shadow-lg shadow-blue-900/20 transition-all"
                        onClick={() => {
                          if (!providerSelection.baseUrl.trim() || !providerSelection.model.trim()) {
                            toast.error("Configure provider to resume");
                            return;
                          }
                          startBenchmark({
                            providerId: preset.id,
                            provider: preset,
                            baseUrl: providerSelection.baseUrl.trim(),
                            model: providerSelection.model.trim(),
                            apiKey: providerSelection.apiKey || "",
                            prompts: promptPack.prompts,
                            runFn: runBenchmarkItem,
                            onComplete: handleBenchmarkComplete,
                            resume: true,
                            strategyId: selectedStrategy
                          });
                        }}
                        type="button"
                      >
                        RESUME ({state.results.length}/{state.progress.total || promptPack.prompts.length})
                      </button>
                    ) : (
                      <div className="grid gap-2">
                        {state.status === "completed" || state.results.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              className="rounded-lg bg-green-500 px-3 py-3 text-sm font-bold text-gray-950 hover:bg-green-400 font-mono transition-all"
                              onClick={onRun}
                              disabled={isRunning}
                              type="button"
                            >
                              RERUN
                            </button>
                            <button
                              className="rounded-lg bg-red-500/10 border border-red-500/50 px-3 py-3 text-sm font-bold text-red-500 hover:bg-red-500/20 font-mono transition-all"
                              onClick={resetState}
                              disabled={isRunning}
                              type="button"
                            >
                              CLEAR
                            </button>
                          </div>
                        ) : (
                          <button
                            className="w-full rounded-lg bg-green-500 px-4 py-3 text-sm font-bold text-gray-950 hover:bg-green-400 font-mono shadow-lg shadow-green-900/20 transition-all"
                            onClick={onRun}
                            disabled={isRunning}
                            type="button"
                          >
                            INITIATE_BENCHMARK
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Downloads (Only if run exists) */}
        {run && state.results.length > 0 && (
          <div className="flex justify-end gap-3">
            <button
              className="rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-xs font-mono text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              onClick={() =>
                downloadTextFile(
                  `ocla-${run.model}-${run.createdAt.replace(/[:.]/g, "-")}.json`,
                  JSON.stringify(run, null, 2)
                )
              }
              type="button"
            >
              DOWNLOAD_JSON
            </button>
            <button
              className="rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-xs font-mono text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              onClick={() =>
                downloadTextFile(
                  `ocla-${run.model}-${run.createdAt.replace(/[:.]/g, "-")}.csv`,
                  toCsv(run),
                  "text/csv"
                )
              }
              type="button"
            >
              DOWNLOAD_CSV
            </button>
          </div>
        )}

        {/* Section 4: Progress Bar (Full Width) */}
        {progress && (
          <div className="rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-md p-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between gap-3 text-sm mb-3">
              <div className="text-gray-200 font-mono flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {progress.label}
              </div>
              <div className="font-mono text-green-400 font-bold">
                {progress.completed}/{progress.total}
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full bg-green-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                style={{
                  width: `${Math.round((progress.completed / Math.max(1, progress.total)) * 100)}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Section 5: Results Feed */}
        <div className="space-y-6">
          {/* Stats Grid */}
          {run && run.summary ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {[
                { label: "Avg Score", value: run.summary.totals.avgScore, color: "text-green-400" },
                { label: "Refusal Rate", value: `${Math.round(run.summary.totals.refusalRate * 100)}%`, color: "text-red-400" },
                { label: "Prompts", value: run.summary.totals.promptCount, color: "text-blue-400" }
              ].map((stat, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-gray-900/40 p-4 backdrop-blur-md">
                  <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">{stat.label}</div>
                  <div className={`mt-1 text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gray-900/20 backdrop-blur-sm p-8 text-center h-[120px]">
              <h3 className="text-gray-400 font-bold mb-1">Waiting for Stats...</h3>
              <p className="text-xs text-gray-600">Metrics will appear here when benchmark starts.</p>
            </div>
          )}

          {/* Live Results Feed */}
          {run && run.summary ? (
            <div className="rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-white/5">
                <h3 className="font-bold text-gray-200 font-mono text-sm uppercase tracking-wider">
                  Live_Results_Feed
                </h3>
              </div>
              <ResultsTable items={run.items} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-gray-900/20 backdrop-blur-sm p-12 text-center h-[250px]">
              <div className="h-16 w-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-gray-300 font-bold">Results Feed</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Detailed prompt-response metrics will appear here once the benchmark begins.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
