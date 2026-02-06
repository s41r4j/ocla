"use client";

import { useMemo, useState } from "react";

import type { BenchmarkItem, PromptCategory } from "@/lib/types";

function categoryColor(category: PromptCategory) {
  switch (category) {
    case "red":
      return "text-red-300";
    case "blue":
      return "text-blue-300";
    case "purple":
      return "text-purple-300";
  }
}

export function ResultsTable({ items }: { items: BenchmarkItem[] }) {
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);
  const rows = useMemo(() => items, [items]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-800">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-gray-950/60 text-xs text-gray-300">
          <tr>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Prompt</th>
            <th className="px-3 py-2">Overall</th>
            <th className="px-3 py-2 text-gray-500" title="Refusal & Keyword Match">T1</th>
            <th className="px-3 py-2 text-gray-500" title="Quality Heuristics">T2</th>
            <th className="px-3 py-2 text-gray-500" title="AI Judge">T3</th>
            <th className="px-3 py-2 text-gray-500" title="Semantic Similarity">T4</th>
            <th className="px-3 py-2">Latency</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rows.map((row) => {
            const expanded = expandedPromptId === row.promptId;
            return (
              <tr key={row.promptId} className="align-top hover:bg-white/5 transition-colors">
                <td className={`px-3 py-2 font-medium ${categoryColor(row.category)}`}>
                  {row.category.toUpperCase()}
                </td>
                <td className="px-3 py-2 text-gray-100 max-w-[200px] truncate" title={row.title}>{row.title}</td>
                <td className="px-3 py-2 font-mono font-bold text-green-400">{row.score}</td>

                {/* T1: Refusal/Keyword */}
                <td className="px-3 py-2 font-mono text-gray-400">
                  <span className={row.t1_refusal > 0 ? "text-red-400" : "text-gray-500"}>
                    {row.t1_refusal > 0 ? "R" : "•"}
                  </span>
                  <span className="mx-1 text-gray-600">/</span>
                  <span>{Math.round(row.t1_keyword)}</span>
                </td>

                {/* T2: Quality */}
                <td className="px-3 py-2 font-mono text-gray-300">
                  {Math.round(row.t2_quality)}
                </td>

                {/* T3: AI Judge */}
                <td className="px-3 py-2 font-mono text-gray-300">
                  {row.t3_judge !== undefined ? Math.round(row.t3_judge) : "-"}
                </td>

                {/* T4: Semantic */}
                <td className="px-3 py-2 font-mono text-gray-300">
                  {row.t4_semantic !== undefined ? Math.round(row.t4_semantic) : "-"}
                </td>

                <td className="px-3 py-2 font-mono text-gray-500 text-xs">{row.latencyMs}ms</td>

                <td className="px-3 py-2">
                  <button
                    className="rounded border border-gray-800 bg-gray-950 px-2 py-1 text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                    onClick={() => setExpandedPromptId(expanded ? null : row.promptId)}
                    type="button"
                  >
                    {expanded ? "Hide" : "View"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {expandedPromptId ? (
        <div className="border-t border-gray-800 bg-gray-950/40 p-3 text-sm text-gray-200">
          <pre className="whitespace-pre-wrap break-words font-sans">
            {rows.find((r) => r.promptId === expandedPromptId)?.responseText ?? ""}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

