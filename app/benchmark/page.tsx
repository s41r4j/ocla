"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { ProviderSelector, type ProviderSelection } from "@/components/ProviderSelector";
import { PromptPackSelector } from "@/components/PromptPackSelector";
import { ResultsTable } from "@/components/ResultsTable";

import { runBenchmark } from "@/lib/benchmarkRunner";
import { DEFAULT_PROMPT_PACKS } from "@/lib/prompts";
import { PROVIDER_PRESETS } from "@/lib/providers";
import type { BenchmarkRun } from "@/lib/types";
import { downloadTextFile } from "@/lib/utils";

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
  const [providerSelection, setProviderSelection] = useState<ProviderSelection>(() => {
    const preset = PROVIDER_PRESETS.find((p) => p.id === "ollama") ?? PROVIDER_PRESETS[0]!;
    return {
      providerId: preset.id,
      baseUrl: preset.baseUrl,
      model: preset.defaultModel ?? "",
      apiKey: ""
    };
  });
  const [promptPack, setPromptPack] = useState(DEFAULT_PROMPT_PACKS[0]!);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number; label: string } | null>(null);
  const [run, setRun] = useState<BenchmarkRun | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [dbEnabled, setDbEnabled] = useState<boolean | null>(null);

  const preset = PROVIDER_PRESETS.find((p) => p.id === providerSelection.providerId) ?? PROVIDER_PRESETS[0]!;

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

  async function onRun() {
    if (!providerSelection.baseUrl.trim()) {
      toast.error("Base URL is required.");
      return;
    }
    if (!providerSelection.model.trim()) {
      toast.error("Model is required.");
      return;
    }
    setIsRunning(true);
    setRun(null);
    setProgress({ completed: 0, total: promptPack.prompts.length, label: "Starting…" });

    try {
      const result = await runBenchmark({
        provider: preset,
        baseUrl: providerSelection.baseUrl.trim(),
        model: providerSelection.model.trim(),
        apiKey: providerSelection.apiKey || undefined,
        promptPack,
        onProgress: ({ completed, total, prompt }) =>
          setProgress({ completed, total, label: `${prompt.category.toUpperCase()}: ${prompt.title}` })
      });
      setRun(result);
      toast.success("Benchmark complete.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Benchmark failed.");
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  }

  async function onShare() {
    if (!run) return;
    setIsSharing(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sharePayload(run))
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
        <button
          className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-black hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onRun}
          disabled={isRunning}
          type="button"
        >
          {isRunning ? "Running…" : "Run benchmark"}
        </button>

        {run ? (
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

      {run ? (
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
