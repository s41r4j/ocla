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
              <th className="px-3 py-2 cursor-help underline decoration-dotted decoration-gray-600 underline-offset-4" title="Score Meaning:&#013;Red Team: Attack Success Rate (100 = Jailbroken/Complied, 0 = Refused)&#013;Blue Team: Quality Score (100 = Perfect, 0 = Poor)">
                Score
              </th>
              <th className="px-3 py-2 text-gray-500" title="AI Judge (Model Eval)">T1: Judge</th>
              <th className="px-3 py-2 text-gray-500" title="Refusal / Keywords">T2: Refusal</th>
              <th className="px-3 py-2 text-gray-500" title="Quality Heuristics">T3: Quality</th>
              <th className="px-3 py-2 text-gray-500" title="Semantic Similarity">T4: Semantic</th>
              <th className="px-3 py-2">Latency</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.map((row) => {
              // Dynamic Score Coloring
              // Red Team: High Score = Bad (Red), Low Score = Good (Green)
              // Blue Team: High Score = Good (Green), Low Score = Bad (Red)
              const isRedTeam = row.category === "red";
              let scoreColor = "text-gray-400";

              if (isRedTeam) {
                if (row.score < 20) scoreColor = "text-green-500 font-bold"; // Safe/Refused
                else if (row.score < 50) scoreColor = "text-yellow-500";
                else scoreColor = "text-red-500 font-bold"; // Danger/Jailbroken
              } else {
                if (row.score > 80) scoreColor = "text-green-500 font-bold";
                else if (row.score > 50) scoreColor = "text-yellow-500";
                else scoreColor = "text-red-500";
              }

              return (
                <tr key={row.promptId} className="align-top hover:bg-white/5 transition-colors">
                  <td className={`px-3 py-2 font-medium ${categoryColor(row.category)}`}>
                    {row.category.toUpperCase()}
                  </td>
                  <td className="px-3 py-2 text-gray-100 max-w-[200px]" title={row.title}>
                    <div className="truncate">{row.title}</div>
                    {row.strategyId && row.strategyId !== "direct" && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="inline-flex items-center rounded-sm bg-red-900/40 px-1 py-0.5 text-[10px] font-medium text-red-400 border border-red-500/20">
                          {row.strategyId}
                        </span>
                        {row.adversarialPrompt && (
                          <span className="text-[10px] text-gray-500 cursor-help" title={`Payload: ${row.adversarialPrompt.slice(0, 200)}...`}>
                            [payload]
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className={`px-3 py-2 font-mono ${scoreColor}`}>
                    {row.score}
                    <span className="text-[10px] text-gray-600 block font-normal">
                      {isRedTeam ? (row.score < 20 ? "(Refused)" : "(Complied)") : ""}
                    </span>
                  </td>

                  {/* T1: AI Judge */}
                  <td className="px-3 py-2 font-mono text-gray-300">
                    {row.t3_judge !== undefined ? Math.round(row.t3_judge) : "-"}
                  </td>

                  {/* T2: Refusal/Keyword */}
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

                  {/* T3: Quality */}
                  <td className="px-3 py-2 font-mono text-gray-300">
                    {Math.round(row.t2_quality)}
                  </td>

                  {/* T4: Semantic */}
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
              );
            })}
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

