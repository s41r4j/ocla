"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Terminal, Shield, Database, Activity, Server, Hash } from "lucide-react";

type LeaderboardRow = {
  model: string;
  runs: number;
  avgScore: number;
  refusalRate: number; // 0..1
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [dbEnabled, setDbEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const json = (await res.json()) as { rows: LeaderboardRow[]; dbEnabled?: boolean };
        if (cancelled) return;
        setRows(json.rows);
        setDbEnabled(Boolean(json.dbEnabled));
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load leaderboard.";
        setError(message);
        toast.error(message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedRows = useMemo(() => {
    if (!rows) return [];
    return [...rows].sort((a, b) => b.avgScore - a.avgScore); // Default sort by score
  }, [rows]);

  const topModel = sortedRows[0];

  const chartData = useMemo(() => {
    if (!rows) return [];
    // Show top 10 models by refusal rate for the chart
    return rows
      .slice()
      .sort((a, b) => b.refusalRate - a.refusalRate)
      .slice(0, 10)
      .map((r) => ({ model: r.model, refusalPct: Math.round(r.refusalRate * 100) }));
  }, [rows]);

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          Global Leaderboard
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Aggregated anonymous benchmark results from the community. Comparisons are based on self-reported local runs.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-200">
          Error: {error}
        </div>
      )}

      {dbEnabled === false && (
        <div className="rounded-lg border border-yellow-900/50 bg-yellow-950/20 p-4 text-sm text-yellow-200/80">
          ⚠️ Leaderboard storage not configured. Set <code className="bg-yellow-900/50 px-1 rounded">DATABASE_URL</code> to enable global text sharing.
        </div>
      )}

      {/* Stats Cards */}
      {topModel && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-950/40 p-6">
            <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Top Model</div>
            <div className="mt-2 text-2xl font-bold text-green-400">{topModel.model}</div>
            <div className="mt-1 text-sm text-gray-400">Score: {topModel.avgScore}</div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950/40 p-6">
            <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Runs</div>
            <div className="mt-2 text-2xl font-bold text-gray-100">
              {rows?.reduce((acc, r) => acc + r.runs, 0) ?? 0}
            </div>
            <div className="mt-1 text-sm text-gray-400">Across {rows?.length ?? 0} models</div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950/40 p-6">
            <div className="text-xs font-medium uppercase tracking-wider text-gray-500">Avg Refusal Rate</div>
            <div className="mt-2 text-2xl font-bold text-gray-100">
              {rows && rows.length > 0
                ? Math.round(rows.reduce((acc, r) => acc + r.refusalRate, 0) / rows.length * 100)
                : 0}%
            </div>
            <div className="mt-1 text-sm text-gray-400">Global Average</div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Table */}
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-gray-800 bg-gray-950/20 shadow-sm">
          <div className="border-b border-gray-800 bg-gray-900/40 px-6 py-4">
            <h3 className="font-semibold text-gray-200">Model Rankings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/20 text-xs font-medium uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Model</th>
                  <th className="px-6 py-4 text-right">Runs</th>
                  <th className="px-6 py-4 text-right">Avg Score</th>
                  <th className="px-6 py-4 text-right">Refusal %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {(sortedRows ?? []).map((r, i) => (
                  <tr key={r.model} className="group hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4 text-gray-500">#{i + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-200 group-hover:text-green-400 transition-colors">
                      {r.model}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-gray-400">{r.runs}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-gray-200">{r.avgScore}</td>
                    <td className="px-6 py-4 text-right font-mono text-gray-400">
                      <span className={r.refusalRate > 0.5 ? "text-red-400" : "text-gray-400"}>
                        {Math.round(r.refusalRate * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
                {(!sortedRows || sortedRows.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No data available yet. Be the first to run a benchmark!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Column */}
        <div className="rounded-xl border border-gray-800 bg-gray-950/20 shadow-sm p-6">
          <h3 className="mb-6 font-semibold text-gray-200">Refusal Rate (Top 10)</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <YAxis
                  dataKey="model"
                  type="category"
                  stroke="#9ca3af"
                  tick={{ fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: '#1f2937', opacity: 0.4 }}
                  contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "0.5rem", color: "#f3f4f6" }}
                />
                <Bar dataKey="refusalPct" fill="#f87171" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
