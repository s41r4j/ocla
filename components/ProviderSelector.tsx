"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";

import type { ProviderPreset } from "@/lib/types";
import {
  IconOpenAI,
  IconAnthropic,
  IconOllama,
  IconDeepseek,
  IconServer,
  IconCpu
} from "@/components/Icons";

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
  return [];
}

const PROVIDER_ICONS: Record<string, any> = {
  openai: IconOpenAI,
  anthropic: IconAnthropic,
  deepseek: IconDeepseek,
  ollama: IconOllama,
  lmstudio: IconCpu,
  groq: IconServer,
  openrouter: IconServer,
  custom: IconServer
};

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
  const [showModels, setShowModels] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Auto-load retry logic
  useEffect(() => {
    if (isCustom) return;
    if (!modelsUrl) return;
    if (loadedModels.status === "loaded" && loadedModels.models.length) return;
    if (!value.apiKey.trim()) return;
    const id = setTimeout(() => {
      void loadModels({ silent: true });
    }, 800);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.apiKey]);

  // Scroll to active provider on mount
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [value.providerId]);

  return (
    <div className="space-y-6">
      {/* Horizontal Scrolling Provider Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {presets.map((p) => {
          const isActive = p.id === value.providerId;
          const Icon = PROVIDER_ICONS[p.id] || IconServer;

          return (
            <button
              key={p.id}
              data-active={isActive}
              onClick={() => {
                onChange({
                  ...value,
                  providerId: p.id,
                  baseUrl: p.baseUrl || value.baseUrl,
                  model: p.id === value.providerId ? value.model : p.defaultModel ?? ""
                });
              }}
              className={`group relative flex shrink-0 flex-col items-center justify-center gap-2 rounded-full border px-6 py-4 transition-all duration-200 ${isActive
                  ? "border-green-500 bg-green-500/20 shadow-lg shadow-green-900/20"
                  : "border-gray-800 bg-gray-900/40 hover:border-gray-600 hover:bg-gray-800/60"
                }`}
            >
              <div className={`rounded-full p-2 transition-colors ${isActive ? "bg-green-500/30 text-green-400" : "bg-gray-800 text-gray-400 group-hover:text-gray-200"}`}>
                <Icon className="h-6 w-6" />
              </div>

              <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? "text-green-300" : "text-gray-400 group-hover:text-gray-200"}`}>
                {p.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Configuration Panel */}
      <div className="rounded-xl border border-gray-800 bg-gray-950/50 p-6 shadow-lg">
        <div className="flex flex-col gap-6">

          {/* Top Row: API Key & Base URL */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* API Key */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 font-mono text-sm text-gray-100 placeholder:text-gray-700 focus:border-green-500/50 focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-green-500/10"
                  placeholder={preset.id === "ollama" ? "Not required for Ollama" : "sk-..."}
                  value={value.apiKey}
                  onChange={(e) => onChange({ ...value, apiKey: e.target.value })}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Base URL */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Base URL
              </label>
              <input
                className={`w-full rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 font-mono text-sm text-gray-100 placeholder:text-gray-700 focus:border-green-500/50 focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-green-500/10 disabled:opacity-50`}
                value={value.baseUrl}
                onChange={(e) => onChange({ ...value, baseUrl: e.target.value })}
                disabled={!isCustom && Boolean(preset.baseUrl) && preset.id !== "ollama"}
                placeholder="https://api.openai.com/v1"
              />
            </div>
          </div>

          {/* Model Selection Row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Model Name
              </label>
              {modelsUrl && (
                <button
                  type="button"
                  onClick={() => loadModels()}
                  disabled={loadedModels.status === "loading"}
                  className="text-xs font-medium text-green-500 hover:text-green-400 disabled:opacity-50"
                >
                  {loadedModels.status === "loading" ? "Fetching..." : "Refresh list"}
                </button>
              )}
            </div>

            <div className="relative group">
              <input
                className="w-full rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 font-mono text-sm text-gray-100 placeholder:text-gray-700 focus:border-green-500/50 focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-green-500/10"
                value={value.model}
                onChange={(e) => onChange({ ...value, model: e.target.value })}
                onFocus={() => setShowModels(true)}
                onBlur={() => setTimeout(() => setShowModels(false), 200)}
                placeholder="Required (e.g. gpt-4o, llama3)"
              />

              {/* Dropdown for models */}
              {showModels && loadedModels.models.length > 0 && (
                <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-800 bg-gray-900 p-1 shadow-xl">
                  {loadedModels.models.filter(m => m.toLowerCase().includes(value.model.toLowerCase())).slice(0, 20).map((model) => (
                    <button
                      key={model}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                      onMouseDown={() => onChange({ ...value, model })}
                      type="button"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600">
              {preset.browserNotes ?? "Keys are stored locally in your browser."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
