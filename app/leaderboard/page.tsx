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

  const [loading, setLoading] = useState(true);

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
      } finally {
        if (!cancelled) setLoading(false);
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
    <div className="relative min-h-screen py-12">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern [mask-image:linear-gradient(to_bottom,white,transparent)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                Global Leaderboard
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
              Real-world telemetry from the community.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-mono text-green-400 font-bold tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>LIVE_FEED</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded border border-red-500/50 bg-red-950/30 p-4 text-sm text-red-300 font-mono">
            [ERROR]: {error}
          </div>
        )}

        {dbEnabled === false && (
          <div className="rounded border border-yellow-500/50 bg-yellow-950/30 p-4 text-sm text-yellow-200/80 font-mono">
            [WARN]: Database connection unavailable. Displaying local/cached data.
          </div>
        )}

        {/* Status Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Network Status", value: "ONLINE", icon: Activity, color: "text-green-400", border: "group-hover:border-green-500/50", bg: "group-hover:from-green-500/10" },
            { label: "Total Runs", value: rows?.reduce((acc, r) => acc + r.runs, 0) ?? 0, icon: Database, color: "text-blue-400", border: "group-hover:border-blue-500/50", bg: "group-hover:from-blue-500/10" },
            { label: "Active Models", value: rows?.length ?? 0, icon: Server, color: "text-purple-400", border: "group-hover:border-purple-500/50", bg: "group-hover:from-purple-500/10" },
            { label: "Global Refusal Rate", value: (rows && rows.length > 0 ? Math.round(rows.reduce((acc, r) => acc + r.refusalRate, 0) / rows.length * 100) : 0) + "%", icon: Shield, color: "text-red-400", border: "group-hover:border-red-500/50", bg: "group-hover:from-red-500/10" }
          ].map((item, i) => (
            <div key={i} className={`group relative p-6 bg-gray-900/40 border border-white/5 ${item.border} transition-all duration-300 backdrop-blur-sm overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-transparent ${item.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <item.icon size={16} className={`text-gray-500 group-hover:text-white transition-colors`} />
                  <span className="text-xs font-mono uppercase tracking-widest text-gray-500">{item.label}</span>
                </div>
                <div className={`text-3xl font-bold font-mono ${item.color}`}>
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Table */}
          <div className="lg:col-span-2 overflow-hidden rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-md">
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-gray-200 flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
                <Hash size={16} className="text-green-500" /> Model_Rankings
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/20 text-xs uppercase tracking-wider text-gray-400 font-mono">
                  <tr>
                    <th className="px-6 py-4 font-medium">#</th>
                    <th className="px-6 py-4 font-medium">Model ID</th>
                    <th className="px-6 py-4 font-medium text-right">Runs</th>
                    <th className="px-6 py-4 font-medium text-right">Score</th>
                    <th className="px-6 py-4 font-medium text-right">Refusal %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-green-500 animate-pulse font-mono flex flex-col items-center gap-2">
                        <span>_LOADING_DATA_STREAM...</span>
                      </td>
                    </tr>
                  ) : (sortedRows ?? []).map((r, i) => (
                    <tr key={r.model} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-gray-600 font-mono">{String(i + 1).padStart(2, '0')}</td>
                      <td className="px-6 py-4 font-medium text-gray-300 group-hover:text-green-400 transition-colors font-mono">
                        {r.model}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500 font-mono">{r.runs}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-200 font-mono">{r.avgScore}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${r.refusalRate > 0.5 ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
                          {Math.round(r.refusalRate * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loading && (!sortedRows || sortedRows.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        [NULL] No benchmark data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Column */}
          <div className="rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-md p-6">
            <h3 className="mb-6 font-bold text-gray-200 text-sm uppercase flex items-center gap-2 font-mono tracking-wider">
              <Activity size={16} className="text-red-500" /> Refusal_Probabilities
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" stroke="#666" tick={{ fontSize: 10, fill: "#666", fontFamily: "monospace" }} domain={[0, 100]} />
                  <YAxis
                    dataKey="model"
                    type="category"
                    stroke="#888"
                    width={90}
                    tick={{ fontSize: 10, fill: "#888", fontFamily: "monospace" }}
                  />
                  <Tooltip
                    cursor={{ fill: '#ffffff', opacity: 0.05 }}
                    contentStyle={{ background: "#000", border: "1px solid #333", color: "#eee", fontFamily: "monospace" }}
                  />
                  <Bar dataKey="refusalPct" fill="#ef4444" radius={[0, 2, 2, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
