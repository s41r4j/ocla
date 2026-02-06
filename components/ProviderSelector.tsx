"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import {
  SiOpenai,
  SiAnthropic,
  SiGooglegemini,
  SiPerplexity,
  SiX,
  SiOllama,
  SiNvidia
} from "react-icons/si";
import {
  Zap,
  Users,
  Flame,
  Network,
  Brain,
  Layers,
  Monitor,
  Settings2,
  Cpu,
  Wind
} from "lucide-react";

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
  return [];
}

// Map provider IDs to React components
const PROVIDER_ICONS: Record<string, React.ElementType> = {
  openai: SiOpenai,
  anthropic: SiAnthropic,
  gemini: SiGooglegemini,
  mistral: Wind, // Mistral = Wind
  groq: Zap, // Groq = Fast
  together: Users, // Together = Users/Handshake
  fireworks: Flame,
  openrouter: Network,
  perplexity: SiPerplexity,
  deepseek: Brain,
  cohere: Layers, // Cohere = Layers/Embeddings
  xai: SiX,
  ollama: SiOllama,
  lmstudio: Monitor,
  custom: Settings2
};

// Fallback icon if ID missing
const DefaultIcon = Cpu;

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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const autoScrollRef = useRef<number | null>(null);

  // Edge hover auto-scroll
  const handleEdgeScroll = useCallback((e: React.MouseEvent) => {
    if (isDragging || !scrollRef.current) return;

    const container = scrollRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const containerWidth = rect.width;
    const edgeZone = 80; // pixels from edge to trigger scroll

    // Clear any existing animation
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }

    let scrollSpeed = 0;

    if (mouseX < edgeZone) {
      // Left edge - scroll left, speed based on proximity
      scrollSpeed = -((edgeZone - mouseX) / edgeZone) * 8;
    } else if (mouseX > containerWidth - edgeZone) {
      // Right edge - scroll right, speed based on proximity
      scrollSpeed = ((mouseX - (containerWidth - edgeZone)) / edgeZone) * 8;
    }

    if (scrollSpeed !== 0) {
      const scroll = () => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft += scrollSpeed;
          autoScrollRef.current = requestAnimationFrame(scroll);
        }
      };
      autoScrollRef.current = requestAnimationFrame(scroll);
    }
  }, [isDragging]);

  const handleMouseLeaveCarousel = useCallback(() => {
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  // Drag to scroll handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    handleMouseLeaveCarousel(); // Stop edge scrolling when dragging starts
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, [handleMouseLeaveCarousel]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scrollRef.current) {
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    } else {
      handleEdgeScroll(e);
    }
  }, [isDragging, startX, scrollLeft, handleEdgeScroll]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Navigation arrows
  const scrollToDirection = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  }, []);


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

  // Auto-load models when API key is provided
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
  }, [value.apiKey, value.providerId]);

  // Scroll to active provider on mount
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  const ActiveIcon = PROVIDER_ICONS[preset.id] || DefaultIcon;

  return (
    <div className="space-y-5">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Select Provider</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollToDirection("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
            type="button" // Add explicit type
            aria-label="Scroll left"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollToDirection("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
            type="button" // Add explicit type
            aria-label="Scroll right"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Provider Carousel */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { handleMouseUp(); handleMouseLeaveCarousel(); }}
        className={`flex gap-3 overflow-x-auto pb-2 scroll-smooth ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {presets.map((p) => {
          const isActive = p.id === value.providerId;
          const Icon = PROVIDER_ICONS[p.id] || DefaultIcon;

          return (
            <button
              key={p.id}
              data-active={isActive}
              onClick={() => {
                if (!isDragging) {
                  onChange({
                    ...value,
                    providerId: p.id,
                    baseUrl: p.baseUrl || value.baseUrl,
                    model: p.id === value.providerId ? value.model : p.defaultModel ?? ""
                  });
                }
              }}
              className={`group relative flex shrink-0 flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 min-w-[90px] transition-all duration-200 ${isActive
                ? "border-green-500 bg-green-500/15 shadow-lg shadow-green-900/20"
                : "border-gray-800 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/70"
                }`}
            >
              <div className={`flex items-center justify-center h-10 w-10 rounded-lg transition-all ${isActive
                ? "bg-green-500/20"
                : "bg-gray-800/50 group-hover:bg-gray-700/50"
                }`}>
                <Icon className={`h-6 w-6 ${isActive ? "text-green-400" : "text-gray-500 group-hover:text-gray-300"}`} />
              </div>

              <span className={`text-xs font-semibold tracking-tight whitespace-nowrap transition-colors ${isActive
                ? "text-green-300"
                : "text-gray-500 group-hover:text-gray-300"
                }`}>
                {p.name.replace(" (OpenAI-compatible)", "").replace(" (localhost)", "").split(" ")[0]}
              </span>

              {isActive && (
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[8px] font-bold text-black shadow">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Configuration Panel */}
      <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-5 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
            <ActiveIcon className="h-5 w-5 text-green-400" />
          </div>
          <span className="font-semibold text-gray-200">{preset.name}</span>
        </div>

        <div className="flex flex-col gap-4">
          {/* Top Row: API Key & Base URL */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                API Key
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-800 bg-gray-900/70 px-3 py-2.5 font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-green-500/50 focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                placeholder={preset.id === "ollama" || preset.id === "lmstudio" ? "Not required" : "Enter API key..."}
                value={value.apiKey}
                onChange={(e) => onChange({ ...value, apiKey: e.target.value })}
                autoComplete="off"
              />
            </div>

            {/* Base URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Base URL
              </label>
              <input
                className="w-full rounded-lg border border-gray-800 bg-gray-900/70 px-3 py-2.5 font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-green-500/50 focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                value={value.baseUrl}
                onChange={(e) => onChange({ ...value, baseUrl: e.target.value })}
                disabled={!isCustom && Boolean(preset.baseUrl)}
                placeholder="https://api.example.com/v1"
              />
            </div>
          </div>

          {/* Model Selection Row */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Model
              </label>
              {modelsUrl && (
                <button
                  type="button"
                  onClick={() => loadModels()}
                  disabled={loadedModels.status === "loading"}
                  className="flex items-center gap-1 text-xs font-semibold text-green-500 hover:text-green-400 disabled:opacity-50 transition-colors"
                >
                  <svg className={`h-3 w-3 ${loadedModels.status === "loading" ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loadedModels.status === "loading" ? "Loading..." : "Fetch Models"}
                </button>
              )}
            </div>

            <div className="relative">
              <input
                className="w-full rounded-lg border border-gray-800 bg-gray-900/70 px-3 py-2.5 font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-green-500/50 focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                value={value.model}
                onChange={(e) => onChange({ ...value, model: e.target.value })}
                onFocus={() => setShowModels(true)}
                onBlur={() => setTimeout(() => setShowModels(false), 200)}
                placeholder={preset.defaultModel || "Enter model name..."}
              />

              {/* Dropdown for models */}
              {showModels && loadedModels.models.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-1 shadow-xl">
                  {loadedModels.models
                    .filter(m => m.toLowerCase().includes(value.model.toLowerCase()))
                    .slice(0, 100)
                    .map((model) => (
                      <button
                        key={model}
                        className="w-full rounded px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-green-400 transition-colors"
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
