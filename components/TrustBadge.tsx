"use client";

export function TrustBadge({
  trustLevel,
  reason
}: {
  trustLevel: 1 | 2 | 3;
  reason?: string;
}) {
  const stars = trustLevel === 3 ? "★★★" : trustLevel === 2 ? "★★" : "★";
  const color =
    trustLevel === 3
      ? "border-green-900/60 bg-green-950/30 text-green-200"
      : trustLevel === 2
        ? "border-yellow-900/60 bg-yellow-950/30 text-yellow-200"
        : "border-red-900/60 bg-red-950/30 text-red-200";

  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${color}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium">Trust</div>
        <div className="font-mono">{stars}</div>
      </div>
      {reason ? <div className="mt-1 text-xs opacity-90">{reason}</div> : null}
    </div>
  );
}

