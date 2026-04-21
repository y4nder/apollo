"use client";

import type { LaneState } from "../../context/AnalysisContext";

const STATUS_COLOR: Record<LaneState["status"], { bg: string; dot: string; label: string }> = {
  pending: { bg: "bg-apollo-paper text-apollo-muted border-apollo-border", dot: "bg-apollo-muted", label: "Waiting" },
  running: { bg: "bg-apollo-navy/5 text-apollo-navy border-apollo-navy/15", dot: "bg-apollo-navy apollo-pulse-dot", label: "Investigating" },
  ok: { bg: "bg-apollo-verify/10 text-apollo-verify border-apollo-verify/20", dot: "bg-apollo-verify", label: "Complete" },
  partial: { bg: "bg-apollo-flag/10 text-apollo-flag border-apollo-flag/20", dot: "bg-apollo-flag", label: "Partial" },
  failed: { bg: "bg-apollo-contradict/10 text-apollo-contradict border-apollo-contradict/20", dot: "bg-apollo-contradict", label: "Failed" },
};

interface Props {
  status: LaneState["status"];
  size?: "xs" | "sm";
  labelOverride?: string;
}

export function StatusPill({ status, size = "sm", labelOverride }: Props) {
  const cfg = STATUS_COLOR[status];
  const pad = size === "xs" ? "px-2 py-0.5 text-[9.5px]" : "px-2.5 py-1 text-[10px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${pad} rounded-full border font-mono uppercase tracking-[0.18em] shrink-0 ${cfg.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {labelOverride ?? cfg.label}
    </span>
  );
}
