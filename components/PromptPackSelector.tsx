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
    <div className="space-y-3 rounded-lg border border-gray-800 bg-gray-950/40 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[260px] flex-col gap-1 text-sm">
          <span className="text-gray-300">Prompt pack</span>
          <select
            className="rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100"
            value={value.id}
            onChange={(e) => {
              const next = packs.find((p) => p.id === e.target.value);
              if (next) onChange(next);
            }}
          >
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            {isCustom ? (
              <option key={value.id} value={value.id}>
                Custom: {value.name}
              </option>
            ) : null}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-gray-300">Import custom pack (JSON)</span>
          <input
            className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-100 hover:file:bg-gray-800"
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
        </label>
      </div>

      <div className="text-xs text-gray-300">
        Prompts are executed locally. Sharing only uploads aggregated scores (never prompts or
        responses).
      </div>
    </div>
  );
}
