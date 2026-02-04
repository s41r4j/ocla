"use client";

import { z } from "zod";
import toast from "react-hot-toast";

import type { PromptPack } from "@/lib/types";

const promptSchema = z.object({
  id: z.string().min(1),
  category: z.enum(["red", "blue", "purple"]),
  title: z.string().min(1),
  text: z.string().min(1),
  expectedKeywords: z.array(z.string()).optional()
});

const promptPackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  prompts: z.array(promptSchema).min(1)
});

export function PromptPackSelector({
  packs,
  value,
  onChange
}: {
  packs: PromptPack[];
  value: PromptPack;
  onChange: (pack: PromptPack) => void;
}) {
  const isCustom = !packs.some((p) => p.id === value.id);

  return (
    <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-950/40 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Benchmark Configuration
        </h3>
        <span className="text-xs text-green-500/70">
          {value.prompts.length} Prompts Loaded
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pack Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            Select Prompt Pack
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-green-500/50 focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-green-500/10"
              value={value.id}
              onChange={(e) => {
                const next = packs.find((p) => p.id === e.target.value);
                if (next) onChange(next);
              }}
            >
              {packs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.prompts.length} prompts)
                </option>
              ))}
              {isCustom && (
                <option key={value.id} value={value.id}>
                  Custom: {value.name}
                </option>
              )}
            </select>
            <div className="pointer-events-none absolute right-4 top-3.5 text-gray-500">
              ▼
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Standard packs include Red/Blue/Purple teaming scenarios.
          </p>
        </div>

        {/* Import Custom */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            Import Custom Pack (JSON)
          </label>
          <div className="relative">
            <input
              className="block w-full cursor-pointer rounded-lg border border-gray-800 bg-gray-900 text-sm text-gray-300 file:mr-4 file:cursor-pointer file:border-0 file:bg-gray-800 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-green-500 hover:file:bg-gray-700"
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const text = await file.text();
                  const parsed = JSON.parse(text) as unknown;
                  const pack = promptPackSchema.parse(parsed) as PromptPack;
                  onChange(pack);
                  toast.success(`Imported ${pack.name}`);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Invalid prompt pack JSON.");
                } finally {
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
          <p className="text-xs text-gray-500">
            Useful for internal red-teaming with proprietary datasets.
          </p>
        </div>
      </div>
    </div>
  );
}
