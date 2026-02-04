"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";

import type { ProviderPreset } from "@/lib/types";
import {
  IconOpenAI,
  IconAnthropic,
  IconGemini,
  IconMistral,
  IconGroq,
  IconTogether,
  IconFireworks,
  IconOpenRouter,
  IconPerplexity,
  IconDeepseek,
  IconCohere,
  IconXAI,
  IconOllama,
  IconCpu,
  IconServer
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
  gemini: IconGemini,
  mistral: IconMistral,
  groq: IconGroq,
  together: IconTogether,
  fireworks: IconFireworks,
  openrouter: IconOpenRouter,
  perplexity: IconPerplexity,
  deepseek: IconDeepseek,
  cohere: IconCohere,
  xai: IconXAI,
  ollama: IconOllama,
  lmstudio: IconCpu,
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
  }, []);

  return (
    <div className="space-y-6">
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Select Provider</span>
        <span className="text-xs text-gray-600">← Scroll →</span>
      </div>

      {/* Infinite-like Horizontal Scrolling Provider Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
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
              className={`group relative flex shrink-0 snap-center flex-col items-center justify-center gap-3 rounded-2xl border-2 p-5 min-w-[100px] transition-all duration-300 ${isActive
                  ? "border-green-500 bg-gradient-to-br from-green-500/20 to-green-600/10 shadow-xl shadow-green-900/30 scale-105"
                  : "border-gray-800/50 bg-gray-900/30 hover:border-gray-600 hover:bg-gray-800/50 hover:scale-[1.02]"
                }`}
            >
              <div className={`rounded-xl p-3 transition-all duration-300 ${isActive
                  ? "bg-green-500/30 text-green-400 shadow-lg shadow-green-500/20"
                  : "bg-gray-800/50 text-gray-500 group-hover:bg-gray-700/50 group-hover:text-gray-300"
                }`}>
                <Icon className="h-7 w-7" />
              </div>

              <span className={`text-xs font-bold tracking-tight whitespace-nowrap transition-colors ${isActive
                  ? "text-green-300"
                  : "text-gray-500 group-hover:text-gray-300"
                }`}>
                {p.name.replace(" (OpenAI-compatible)", "").replace(" (localhost)", "").split(" ")[0]}
              </span>

              {isActive && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-black shadow-lg">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Configuration Panel */}
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-950/80 to-gray-900/50 p-6 shadow-xl backdrop-blur">
        <div className="mb-4 flex items-center gap-3">
          {(() => {
            const Icon = PROVIDER_ICONS[preset.id] || IconServer;
            return <Icon className="h-5 w-5 text-green-500" />;
          })()}
          <span className="font-semibold text-gray-200">{preset.name}</span>
        </div>

        <div className="flex flex-col gap-5">
          {/* Top Row: API Key & Base URL */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* API Key */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                API Key
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-gray-800 bg-gray-900/70 px-4 py-3 font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-green-500/50 focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
                placeholder={preset.id === "ollama" || preset.id === "lmstudio" ? "Not required" : "Enter API key..."}
                value={value.apiKey}
                onChange={(e) => onChange({ ...value, apiKey: e.target.value })}
                autoComplete="off"
              />
            </div>

            {/* Base URL */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Base URL
              </label>
              <input
                className="w-full rounded-xl border border-gray-800 bg-gray-900/70 px-4 py-3 font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-green-500/50 focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                value={value.baseUrl}
                onChange={(e) => onChange({ ...value, baseUrl: e.target.value })}
                disabled={!isCustom && Boolean(preset.baseUrl)}
                placeholder="https://api.example.com/v1"
              />
            </div>
          </div>

          {/* Model Selection Row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Model
              </label>
              {modelsUrl && (
                <button
                  type="button"
                  onClick={() => loadModels()}
                  disabled={loadedModels.status === "loading"}
                  className="text-xs font-semibold text-green-500 hover:text-green-400 disabled:opacity-50 transition-colors"
                >
                  {loadedModels.status === "loading" ? "Loading..." : "🔄 Fetch Models"}
                </button>
              )}
            </div>

            <div className="relative">
              <input
                className="w-full rounded-xl border border-gray-800 bg-gray-900/70 px-4 py-3 font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-green-500/50 focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
                value={value.model}
                onChange={(e) => onChange({ ...value, model: e.target.value })}
                onFocus={() => setShowModels(true)}
                onBlur={() => setTimeout(() => setShowModels(false), 200)}
                placeholder={preset.defaultModel || "Enter model name..."}
              />

              {/* Dropdown for models */}
              {showModels && loadedModels.models.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-700 bg-gray-900 p-1.5 shadow-2xl">
                  {loadedModels.models
                    .filter(m => m.toLowerCase().includes(value.model.toLowerCase()))
                    .slice(0, 15)
                    .map((model) => (
                      <button
                        key={model}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-green-400 transition-colors"
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
              {preset.browserNotes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
