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
        if (!res.ok) {
          const message = `Leaderboard unavailable (HTTP ${res.status}).`;
          setError(message);
        }
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

  const chartData = useMemo(() => {
    if (!rows) return [];
    return rows
      .slice()
      .sort((a, b) => b.refusalRate - a.refusalRate)
      .map((r) => ({ model: r.model, refusalPct: Math.round(r.refusalRate * 100) }));
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-sm text-gray-300">Aggregated anonymous runs (scores only).</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {dbEnabled === false ? (
        <div className="rounded-lg border border-yellow-900/60 bg-yellow-950/30 p-4 text-sm text-yellow-100/90">
          Leaderboard storage is not configured (missing `DATABASE_URL`). Your benchmark results stay
          local unless you set up Postgres and enable uploads.
        </div>
      ) : null}

      <div className="rounded-lg border border-gray-800 bg-gray-950/40 p-4">
        <div className="text-sm font-medium text-gray-200">Refusal rate by model</div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="model" stroke="#9ca3af" tick={{ fontSize: 12 }} interval={0} height={60} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "#0b1220", border: "1px solid #1f2937", color: "#e5e7eb" }}
              />
              <Bar dataKey="refusalPct" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-800">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-950/60 text-xs text-gray-300">
            <tr>
              <th className="px-3 py-2">Model</th>
              <th className="px-3 py-2">Runs</th>
              <th className="px-3 py-2">Avg score</th>
              <th className="px-3 py-2">Refusal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(rows ?? []).map((r) => (
              <tr key={r.model}>
                <td className="px-3 py-2 text-gray-100">{r.model}</td>
                <td className="px-3 py-2 font-mono text-gray-100">{r.runs}</td>
                <td className="px-3 py-2 font-mono text-gray-100">{r.avgScore}</td>
                <td className="px-3 py-2 font-mono text-gray-100">{Math.round(r.refusalRate * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows && rows.length === 0 ? (
          <div className="border-t border-gray-800 p-3 text-sm text-gray-300">
            {dbEnabled === false
              ? "No server-side data. Configure Postgres to enable uploads and the public leaderboard."
              : "No runs yet. Go run a benchmark and share an anonymous summary."}
          </div>
        ) : null}
      </div>
    </div>
  );
}
