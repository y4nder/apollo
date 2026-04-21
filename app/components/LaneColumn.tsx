"use client";

import { useMemo } from "react";
import type { LaneState } from "../context/AnalysisContext";
import LaneHeader from "./LaneHeader";
import AgentTrace from "./AgentTrace";
import ClaimStatusCard from "./ClaimStatusCard";

export default function LaneColumn({ lane }: { lane: LaneState }) {
  const currentUrl = useMemo(() => {
    for (let i = lane.trace.length - 1; i >= 0; i--) {
      const step = lane.trace[i];
      if (step.link) return step.link;
    }
    return undefined;
  }, [lane.trace]);

  return (
    <div className="apollo-card-strong overflow-hidden flex flex-col">
      <LaneHeader lane={lane} currentUrl={currentUrl} />
      <div className="flex-1 min-h-0">
        <AgentTrace trace={lane.trace} tall />
      </div>
      {lane.findings.length > 0 && (
        <div className="border-t border-apollo-border bg-apollo-paper/40 px-3 py-2.5 space-y-1.5">
          {lane.findings.map((f, i) => (
            <ClaimStatusCard key={i} finding={f} />
          ))}
        </div>
      )}
      {lane.notes && lane.status !== "ok" && (
        <div className="border-t border-apollo-border bg-apollo-contradict/5 px-3 py-2 text-[11px] text-apollo-contradict">
          {lane.notes}
        </div>
      )}
    </div>
  );
}
