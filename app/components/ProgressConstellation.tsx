"use client";

import { Check, X as IconX, TriangleAlert } from "lucide-react";
import type { LaneState } from "../context/AnalysisContext";
import { LANE_IDS } from "../context/AnalysisContext";
import { LaneIcon, LANE_SHORT } from "./primitives/Icon";

interface Props {
  lanes: Record<LaneState["laneId"], LaneState>;
}

export default function ProgressConstellation({ lanes }: Props) {
  return (
    <div className="relative flex items-center justify-between gap-4 max-w-2xl mx-auto w-full px-4">
      <div className="absolute left-4 right-4 top-1/2 h-px bg-apollo-border -translate-y-1/2 -z-0" />
      {LANE_IDS.map((id) => {
        const lane = lanes[id];
        const Icon = LaneIcon[id];
        const s = lane.status;
        const stateStyle =
          s === "running"
            ? "bg-apollo-navy text-white shadow-[0_0_0_4px_rgba(11,37,69,0.12)] apollo-pulse-dot"
            : s === "ok"
            ? "bg-apollo-verify text-white"
            : s === "partial"
            ? "bg-apollo-flag text-white"
            : s === "failed"
            ? "bg-apollo-contradict text-white"
            : "bg-white border border-apollo-border-strong text-apollo-muted";

        const labelStyle =
          s === "running"
            ? "text-apollo-navy"
            : s === "ok"
            ? "text-apollo-verify"
            : s === "partial"
            ? "text-apollo-flag"
            : s === "failed"
            ? "text-apollo-contradict"
            : "text-apollo-muted";

        return (
          <div key={id} className="relative flex flex-col items-center gap-1.5 z-10 bg-apollo-paper px-2">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${stateStyle}`}
              aria-label={`${LANE_SHORT[id]}: ${s}`}
            >
              {s === "ok" ? (
                <Check className="w-4 h-4" strokeWidth={2.5} />
              ) : s === "failed" ? (
                <IconX className="w-4 h-4" strokeWidth={2.5} />
              ) : s === "partial" ? (
                <TriangleAlert className="w-3.5 h-3.5" strokeWidth={2} />
              ) : (
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
              )}
            </span>
            <span className={`text-[9.5px] font-mono uppercase tracking-[0.18em] ${labelStyle}`}>
              {LANE_SHORT[id]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
