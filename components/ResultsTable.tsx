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
            <th className="px-3 py-2">Score</th>
            <th className="px-3 py-2">Refused</th>
            <th className="px-3 py-2">Latency</th>
            <th className="px-3 py-2">Keywords</th>
            <th className="px-3 py-2">Response</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rows.map((row) => {
            const expanded = expandedPromptId === row.promptId;
            return (
              <tr key={row.promptId} className="align-top">
                <td className={`px-3 py-2 font-medium ${categoryColor(row.category)}`}>
                  {row.category.toUpperCase()}
                </td>
                <td className="px-3 py-2 text-gray-100">{row.title}</td>
                <td className="px-3 py-2 font-mono text-gray-100">{row.score}</td>
                <td className="px-3 py-2 font-mono text-gray-100">{row.refused ? "yes" : "no"}</td>
                <td className="px-3 py-2 font-mono text-gray-100">{row.latencyMs}ms</td>
                <td className="px-3 py-2 text-gray-300">
                  {row.matchedKeywords.length}/{row.expectedKeywords.length}
                </td>
                <td className="px-3 py-2">
                  <button
                    className="rounded-md border border-gray-800 bg-gray-950 px-2 py-1 text-xs text-gray-200 hover:bg-gray-900"
                    onClick={() => setExpandedPromptId(expanded ? null : row.promptId)}
                    type="button"
                  >
                    {expanded ? "Hide" : "Show"}
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

