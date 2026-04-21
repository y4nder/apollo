"use client";

import type { LaneState } from "../context/AnalysisContext";
import type { Phase } from "../context/AnalysisContext";
import type { LaneId } from "../lib/schemas";

function formatElapsed(ms: number) {
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`;
}

function progressFor(phase: Phase, lanes: Record<LaneId, LaneState>) {
  if (phase === "idle" || phase === "uploading") return 5;
  if (phase === "parsing") return 15;
  if (phase === "synthesizing") return 90;
  if (phase === "done") return 100;
  if (phase === "error") return 100;
  const weights = Object.values(lanes).reduce((sum, lane) => {
    if (lane.status === "pending") return sum;
    if (lane.status === "running") return sum + 0.5;
    return sum + 1;
  }, 0);
  const fraction = weights / 4;
  return 15 + Math.round(fraction * 70);
}

interface Props {
  phase: Phase;
  lanes: Record<LaneId, LaneState>;
  elapsedMs: number;
}

export default function ProgressBar({ phase, lanes, elapsedMs }: Props) {
  const pct = progressFor(phase, lanes);
  const label =
    phase === "uploading"
      ? "Uploading"
      : phase === "parsing"
      ? "Extracting claims"
      : phase === "synthesizing"
      ? "Synthesizing report"
      : phase === "done"
      ? "Complete"
      : phase === "error"
      ? "Halted"
      : "Investigating";

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-xs text-apollo-muted font-mono tabular-nums">
        <span className="w-1.5 h-1.5 rounded-full bg-apollo-navy apollo-pulse-dot" />
        <span className="uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="flex-1 h-[2px] bg-apollo-border relative overflow-hidden rounded-full max-w-md">
        <div
          className="absolute inset-y-0 left-0 bg-apollo-navy transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-apollo-muted font-mono tabular-nums w-14 text-right">
        {formatElapsed(elapsedMs)}
      </span>
    </div>
  );
}
