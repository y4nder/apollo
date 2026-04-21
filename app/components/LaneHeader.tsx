"use client";

import { useMemo } from "react";
import type { LaneState } from "../context/AnalysisContext";
import { LaneIcon, LANE_TITLE } from "./primitives/Icon";
import { StatusPill } from "./primitives/StatusPill";
import SiteCard from "./SiteCard";

const LANE_INDEX: Record<LaneState["laneId"], string> = {
  employer: "01",
  linkedin: "02",
  github: "03",
  news: "04",
};

interface Props {
  lane: LaneState;
  currentUrl?: string;
}

export default function LaneHeader({ lane, currentUrl }: Props) {
  const Icon = LaneIcon[lane.laneId];
  const { urls, findings } = useMemo(() => {
    const urlSet = new Set<string>();
    for (const s of lane.trace) if (s.link) urlSet.add(s.link);
    return { urls: urlSet.size, findings: lane.findings.length };
  }, [lane.trace, lane.findings]);

  const isRunning = lane.status === "running";

  return (
    <div
      className={`px-4 py-3 border-b border-apollo-border space-y-2 ${
        isRunning ? "bg-apollo-navy/[0.02]" : "bg-apollo-paper/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
            isRunning
              ? "bg-apollo-navy text-white"
              : lane.status === "ok"
              ? "bg-apollo-verify/10 text-apollo-verify"
              : lane.status === "failed"
              ? "bg-apollo-contradict/10 text-apollo-contradict"
              : lane.status === "partial"
              ? "bg-apollo-flag/10 text-apollo-flag"
              : "bg-white border border-apollo-border text-apollo-muted"
          }`}
        >
          <Icon className="w-4 h-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] tracking-[0.24em] uppercase text-apollo-muted font-mono tabular-nums">
              {LANE_INDEX[lane.laneId]}
            </span>
            <span className="apollo-serif text-[17px] text-apollo-ink truncate leading-none">
              {LANE_TITLE[lane.laneId]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-apollo-muted tabular-nums">
            <span>
              <span className="text-apollo-ink">{urls}</span> visited
            </span>
            <span className="text-apollo-border-strong">·</span>
            <span>
              <span className="text-apollo-ink">{findings}</span> findings
            </span>
          </div>
        </div>
        <StatusPill status={lane.status} />
      </div>
      {currentUrl && (
        <div className="pl-12">
          <SiteCard url={currentUrl} label={isRunning ? "Currently viewing" : "Last viewed"} />
        </div>
      )}
    </div>
  );
}
