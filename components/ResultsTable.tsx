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

import { BenchmarkDetailsModal } from "./BenchmarkDetailsModal";

export function ResultsTable({ items }: { items: BenchmarkItem[] }) {
  const [selectedItem, setSelectedItem] = useState<BenchmarkItem | null>(null);

  const rows = useMemo(() => items, [items]);

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-800">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-950/60 text-xs text-gray-300">
            <tr>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Prompt</th>
              <th className="px-3 py-2">Overall</th>
              <th className="px-3 py-2 text-gray-500" title="Refusal / Keywords">T1: Refusal / Key</th>
              <th className="px-3 py-2 text-gray-500" title="Quality Heuristics">T2</th>
              <th className="px-3 py-2 text-gray-500" title="AI Judge">T3</th>
              <th className="px-3 py-2 text-gray-500" title="Semantic Similarity">T4</th>
              <th className="px-3 py-2">Latency</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.map((row) => (
              <tr key={row.promptId} className="align-top hover:bg-white/5 transition-colors">
                <td className={`px-3 py-2 font-medium ${categoryColor(row.category)}`}>
                  {row.category.toUpperCase()}
                </td>
                <td className="px-3 py-2 text-gray-100 max-w-[200px] truncate" title={row.title}>{row.title}</td>
                <td className="px-3 py-2 font-mono font-bold text-green-400">{row.score}</td>

                {/* T1: Refusal/Keyword */}
                <td className="px-3 py-2 font-mono text-gray-400">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 text-center ${row.t1_refusal >= 50 ? "text-red-500 font-bold" :
                          row.t1_refusal > 0 ? "text-yellow-500" : "text-gray-600"
                        }`}
                      title={`Refusal Score: ${row.t1_refusal}`}
                    >
                      {row.t1_refusal >= 50 ? "R" : row.t1_refusal > 0 ? "H" : "•"}
                    </span>
                    <span className="text-gray-700">|</span>
                    <span title="Keyword Score">{Math.round(row.t1_keyword)}</span>
                  </div>
                </td>

                <td className="px-3 py-2 font-mono text-gray-300">
                  {Math.round(row.t2_quality)}
                </td>

                <td className="px-3 py-2 font-mono text-gray-300">
                  {row.t3_judge !== undefined ? Math.round(row.t3_judge) : "-"}
                </td>

                <td className="px-3 py-2 font-mono text-gray-300">
                  {row.t4_semantic !== undefined ? Math.round(row.t4_semantic) : "-"}
                </td>

                <td className="px-3 py-2 font-mono text-gray-500 text-xs">{row.latencyMs}ms</td>

                <td className="px-3 py-2 text-right">
                  <button
                    className="rounded border border-gray-700 bg-gray-900/50 px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    onClick={() => setSelectedItem(row)}
                    type="button"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BenchmarkDetailsModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}

