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
import type { BenchmarkRun } from "@/lib/types";
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
  const { state, startBenchmark, cancelBenchmark } = useBenchmark();

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
  const [isSharing, setIsSharing] = useState(false);
  const [dbEnabled, setDbEnabled] = useState<boolean | null>(null);

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

  async function onRun() {
    if (!providerSelection.baseUrl.trim()) {
      toast.error("Base URL is required.");
      return;
    }
    if (!providerSelection.model.trim()) {
      toast.error("Model is required.");
      return;
    }

    // Start via Context
    startBenchmark({
      providerId: preset.id,
      baseUrl: providerSelection.baseUrl.trim(),
      model: providerSelection.model.trim(),
      apiKey: providerSelection.apiKey || "",
      prompts: promptPack.prompts,
      runFn: runBenchmarkItem, // Pass the singe-item runner
      onComplete: () => {
        toast.success("Benchmark complete.");
      }
    });
  }

  async function onShare() {
    if (!run) return;
    setIsSharing(true);
    try {
      // Re-calculate robust values for sharing
      const promptPackSha256 = await sha256Hex(JSON.stringify(promptPack));
      const finalRun: BenchmarkRun = {
        ...run,
        promptPackId: promptPack.id,
        promptPackSha256,
        userHash: getOrCreateUserHash()
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sharePayload(finalRun))
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Upload failed (${res.status})`);
      toast.success("Shared anonymously.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Share failed.");
    } finally {
      setIsSharing(false);
    }
  }

  const isRunning = state.status === "running";
  const progress = isRunning && state.progress.total > 0 ? {
    completed: state.progress.current,
    total: state.progress.total,
    label: state.progress.currentPrompt || "Processing..."
  } : null;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Benchmark</h1>
        <p className="text-gray-400">
          Runs client-side. API keys are never sent to OCLA server routes.
        </p>
      </div>

      <ProviderSelector presets={PROVIDER_PRESETS} value={providerSelection} onChange={setProviderSelection} />
      <PromptPackSelector packs={DEFAULT_PROMPT_PACKS} value={promptPack} onChange={setPromptPack} />

      {dbEnabled === false ? (
        <div className="rounded-lg border border-yellow-900/60 bg-yellow-950/30 p-4 text-sm text-yellow-100/90">
          Uploads/leaderboard are disabled (missing <span className="font-mono">DATABASE_URL</span>).
          Your results stay local unless you configure Postgres.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {isRunning ? (
          <button
            className="rounded-md bg-red-500/10 border border-red-500/50 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20"
            onClick={cancelBenchmark}
            type="button"
          >
            Stop Benchmark
          </button>
        ) : (
          <div className="flex gap-2">
            {state.results.length > 0 && state.status !== "completed" && (
              <button
                className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400"
                onClick={() => {
                  if (!providerSelection.baseUrl.trim() || !providerSelection.model.trim()) {
                    toast.error("Configure provider to resume");
                    return;
                  }
                  startBenchmark({
                    providerId: preset.id,
                    baseUrl: providerSelection.baseUrl.trim(),
                    model: providerSelection.model.trim(),
                    apiKey: providerSelection.apiKey || "",
                    prompts: promptPack.prompts,
                    runFn: runBenchmarkItem,
                    onComplete: () => toast.success("Benchmark complete."),
                    resume: true
                  });
                }}
                type="button"
              >
                Resume Run ({state.results.length}/{state.progress.total || promptPack.prompts.length})
              </button>
            )}

            <button
              className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-black hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onRun}
              disabled={isRunning}
              type="button"
            >
              {state.status === "completed" ? "Run again" : (state.results.length > 0 ? "Restart (Clear)" : "Run benchmark")}
            </button>
          </div>
        )}

        {run && state.results.length > 0 ? (
          <>
            <button
              className="rounded-md border border-gray-800 bg-gray-950 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-900"
              onClick={() =>
                downloadTextFile(
                  `ocla-${run.model}-${run.createdAt.replace(/[:.]/g, "-")}.json`,
                  JSON.stringify(run, null, 2)
                )
              }
              type="button"
            >
              Download JSON
            </button>
            <button
              className="rounded-md border border-gray-800 bg-gray-950 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-900"
              onClick={() =>
                downloadTextFile(
                  `ocla-${run.model}-${run.createdAt.replace(/[:.]/g, "-")}.csv`,
                  toCsv(run),
                  "text/csv"
                )
              }
              type="button"
            >
              Download CSV
            </button>
            <button
              className="rounded-md border border-gray-800 bg-gray-950 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onShare}
              disabled={isSharing || dbEnabled === false}
              type="button"
              title={dbEnabled === false ? "Configure DATABASE_URL to enable uploads" : undefined}
            >
              {isSharing ? "Sharing…" : "Share anon summary"}
            </button>
          </>
        ) : null}
      </div>

      {progress ? (
        <div className="rounded-lg border border-gray-800 bg-gray-950/40 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="text-gray-200">{progress.label}</div>
            <div className="font-mono text-gray-400">
              {progress.completed}/{progress.total}
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-900">
            <div
              className="h-full bg-green-500 transition-[width]"
              style={{
                width: `${Math.round((progress.completed / Math.max(1, progress.total)) * 100)}%`
              }}
            />
          </div>
        </div>
      ) : null}

      {run && run.summary ? (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-gray-800 bg-gray-950/40 p-4">
              <div className="text-xs text-gray-400">Overall avg score</div>
              <div className="mt-1 text-2xl font-semibold">{run.summary.totals.avgScore}</div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-950/40 p-4">
              <div className="text-xs text-gray-400">Overall refusal rate</div>
              <div className="mt-1 text-2xl font-semibold">
                {Math.round(run.summary.totals.refusalRate * 100)}%
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-950/40 p-4">
              <div className="text-xs text-gray-400">Prompts</div>
              <div className="mt-1 text-2xl font-semibold">{run.summary.totals.promptCount}</div>
            </div>
          </div>

          <ResultsTable items={run.items} />
        </div>
      ) : null}

      <div className="rounded-lg border border-yellow-900/60 bg-yellow-950/30 p-4 text-sm text-yellow-100/90">
        <div className="font-medium text-yellow-200">CORS note</div>
        <p className="mt-1">
          Some hosted providers block browser requests. For local models (Ollama / LM Studio), enable
          CORS on your server.
        </p>
      </div>
    </div>
  );
}
