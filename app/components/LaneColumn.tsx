"use client";

import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import type { LaneState } from "../context/AnalysisContext";
import LaneHeader from "./LaneHeader";
import Timeline from "./Timeline";
import ClaimStatusCard from "./ClaimStatusCard";

export default function LaneColumn({ lane }: { lane: LaneState }) {
  const reduce = useReducedMotion();

  const currentUrl = useMemo(() => {
    for (let i = lane.trace.length - 1; i >= 0; i--) {
      const step = lane.trace[i];
      if (step.link) return step.link;
    }
    return undefined;
  }, [lane.trace]);

  const isRunning = lane.status === "running";

  return (
    <motion.div
      layout={!reduce}
      className={`relative apollo-card-strong overflow-hidden flex flex-col transition-shadow ${
        isRunning ? "apollo-ring-active" : ""
      }`}
    >
      {isRunning && (
        <span
          className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-apollo-navy apollo-pulse-dot z-10"
          aria-hidden
        />
      )}
      <LaneHeader lane={lane} currentUrl={currentUrl} />

      {lane.findings.length > 0 && (
        <div className="border-b border-apollo-border bg-apollo-paper/50 px-3 py-2.5 space-y-1.5">
          <div className="flex items-center gap-2 mb-1 px-0.5">
            <span className="text-[9.5px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
              Findings · {lane.findings.length}
            </span>
            <div className="flex-1 apollo-divider" />
          </div>
          <AnimatePresence initial={false}>
            {lane.findings.map((f, i) => (
              <ClaimStatusCard key={`${f.claimRef}-${i}`} finding={f} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="flex-1 min-h-0">
        <Timeline trace={lane.trace} tall />
      </div>

      {lane.notes && lane.status !== "ok" && (
        <div className="border-t border-apollo-border bg-apollo-contradict/[0.04] px-3 py-2 text-[11.5px] text-apollo-contradict flex items-start gap-2">
          <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2} />
          <span className="flex-1">{lane.notes}</span>
        </div>
      )}
    </motion.div>
  );
}
