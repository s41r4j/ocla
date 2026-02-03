"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import type { ProviderPreset } from "@/lib/types";

export type ProviderSelection = {
  providerId: string;
  baseUrl: string;
  model: string;
  apiKey: string;
};

type LoadedModelsState =
  | { status: "idle"; models: string[] }
  | { status: "loading"; models: string[] }
  | { status: "loaded"; models: string[] }
  | { status: "error"; models: string[]; message: string };

function uniqSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function parseModelIds(json: any): string[] {
  const data = json?.data;
  if (Array.isArray(data)) {
    return uniqSorted(
      data
        .map((x) => (typeof x?.id === "string" ? x.id : typeof x?.name === "string" ? x.name : ""))
        .filter(Boolean)
    );
  }
  if (Array.isArray(json?.models)) {
    return uniqSorted(
      json.models
        .map((x: any) => (typeof x?.id === "string" ? x.id : typeof x?.name === "string" ? x.name : ""))
        .filter(Boolean)
    );
  }
  if (Array.isArray(json)) {
    return uniqSorted(
      json
        .map((x: any) => (typeof x?.id === "string" ? x.id : typeof x?.name === "string" ? x.name : ""))
        .filter(Boolean)
    );
  }
  return [];
}

export function ProviderSelector({
  presets,
  value,
  onChange
}: {
  presets: ProviderPreset[];
  value: ProviderSelection;
  onChange: (next: ProviderSelection) => void;
}) {
  const preset = presets.find((p) => p.id === value.providerId) ?? presets[0]!;
  const isCustom = preset.id === "custom";
  const modelsUrl = useMemo(() => {
    const base = value.baseUrl.trim();
    if (!base) return "";
    return `${base.replace(/\/$/, "")}/models`;
  }, [value.baseUrl]);
  const [loadedModels, setLoadedModels] = useState<LoadedModelsState>({ status: "idle", models: [] });

  async function loadModels({ silent }: { silent?: boolean } = {}) {
    if (!modelsUrl) return;
    setLoadedModels((s) => ({ status: "loading", models: s.models }));
    try {
      const headers: Record<string, string> = {};
      if (preset.apiKind === "anthropic-messages") {
        if (value.apiKey.trim()) headers["x-api-key"] = value.apiKey.trim();
        headers["anthropic-version"] = "2023-06-01";
      } else {
        if (value.apiKey.trim()) headers.Authorization = `Bearer ${value.apiKey.trim()}`;
      }

      const res = await fetch(modelsUrl, { headers, method: "GET" });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Model list failed (${res.status}).`);
      const json = JSON.parse(text) as any;
      const models = parseModelIds(json);
      if (models.length === 0) throw new Error("No models returned.");
      setLoadedModels({ status: "loaded", models });
      if (!value.model.trim()) onChange({ ...value, model: models[0]! });
      if (!silent) toast.success(`Loaded ${models.length} models.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load models.";
      if (silent) {
        setLoadedModels((s) => ({ status: s.models.length ? "loaded" : "idle", models: s.models }));
        return;
      }
      setLoadedModels((s) => ({ status: "error", models: s.models, message }));
      toast.error(message);
    }
  }

  useEffect(() => {
    setLoadedModels({ status: "idle", models: [] });
    if (isCustom) return;
    if (!modelsUrl) return;
    void loadModels({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.providerId]);

  useEffect(() => {
    if (isCustom) return;
    if (!modelsUrl) return;
    if (loadedModels.status === "loaded" && loadedModels.models.length) return;
    if (!value.apiKey.trim()) return;
    const id = setTimeout(() => {
      void loadModels({ silent: true });
    }, 650);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.apiKey]);

  return (
    <div className="space-y-3 rounded-lg border border-gray-800 bg-gray-950/40 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[220px] flex-col gap-1 text-sm">
          <span className="text-gray-300">Provider</span>
          <select
            className="rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
            value={value.providerId}
            onChange={(e) => {
              const nextPreset = presets.find((p) => p.id === e.target.value) ?? preset;
              onChange({
                ...value,
                providerId: nextPreset.id,
                baseUrl: nextPreset.baseUrl || value.baseUrl,
                model: nextPreset.id === value.providerId ? value.model : nextPreset.defaultModel ?? ""
              });
            }}
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[320px] flex-1 flex-col gap-1 text-sm">
          <span className="text-gray-300">Base URL</span>
          <input
            className="rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100 placeholder:text-gray-600"
            value={value.baseUrl}
            onChange={(e) => onChange({ ...value, baseUrl: e.target.value })}
            disabled={!isCustom && Boolean(preset.baseUrl)}
            placeholder="https://…/v1 or http://localhost:11434/v1"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[360px] flex-1 flex-col gap-1 text-sm">
          <span className="text-gray-300">API key</span>
          <input
            className="rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100 placeholder:text-gray-600"
            value={value.apiKey}
            onChange={(e) => onChange({ ...value, apiKey: e.target.value })}
            placeholder="Used only in this tab (never uploaded)"
            type="password"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="text-xs text-gray-500">
            Sent directly to the provider from your browser. OCLA never receives it.
          </div>
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[320px] flex-1 flex-col gap-1 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-300">Model</span>
            <div className="flex items-center gap-2">
              {loadedModels.status === "loaded" ? (
                <span className="text-xs text-gray-500">{loadedModels.models.length} loaded</span>
              ) : null}
              <button
                type="button"
                className="rounded-md border border-gray-800 bg-gray-950 px-2 py-1 text-xs text-gray-200 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => loadModels()}
                disabled={!modelsUrl || loadedModels.status === "loading"}
                title={modelsUrl ? "Fetch /models from the provider" : "Enter a Base URL first"}
              >
                {loadedModels.status === "loading" ? "Loading…" : "Load models"}
              </button>
            </div>
          </div>

          <input
            className="rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100 placeholder:text-gray-600"
            value={value.model}
            onChange={(e) => onChange({ ...value, model: e.target.value })}
            placeholder="e.g. gpt-4o-mini, llama3.1, deepseek-chat"
            list={loadedModels.models.length ? "ocla-models" : undefined}
          />

          {loadedModels.models.length ? (
            <datalist id="ocla-models">
              {loadedModels.models.slice(0, 500).map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>
          ) : null}

          {loadedModels.status === "loaded" ? (
            <div className="text-xs text-gray-500">
              Start typing to search models (suggestions come from <span className="font-mono">/models</span>).
            </div>
          ) : loadedModels.status === "error" ? (
            <div className="text-xs text-gray-400">
              Couldn’t load models (CORS or missing key). You can still type a model name manually.
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              Tip: paste your key first, then click “Load models” to auto-fill the list.
            </div>
          )}
        </label>
      </div>

      {preset.browserNotes ? (
        <div className="rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-xs text-gray-300">
          {preset.browserNotes}
        </div>
      ) : null}
    </div>
  );
}
