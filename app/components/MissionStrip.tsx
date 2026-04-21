"use client";

import { useMemo } from "react";
import { Activity, Link2, Sparkles, Gauge as GaugeIcon } from "lucide-react";
import type { LaneState, Phase } from "../context/AnalysisContext";
import { Stat } from "./primitives/Stat";
import { Counter } from "./primitives/Counter";
import CancelButton from "./CancelButton";
import ProgressConstellation from "./ProgressConstellation";

function formatElapsed(ms: number) {
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `0:${s.toString().padStart(2, "0")}`;
}

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Idle",
  uploading: "Uploading",
  parsing: "Extracting claims",
  analyzing: "Investigating",
  synthesizing: "Synthesizing",
  done: "Complete",
  error: "Halted",
};

const CONFIDENCE_WEIGHT: Record<"high" | "medium" | "low", number> = {
  high: 1,
  medium: 0.66,
  low: 0.33,
};

interface Props {
  phase: Phase;
  subject: string;
  lanes: Record<LaneState["laneId"], LaneState>;
  elapsedMs: number;
  sequential: boolean;
  onCancel: () => void;
}

export default function MissionStrip({
  phase,
  subject,
  lanes,
  elapsedMs,
  sequential,
  onCancel,
}: Props) {
  const { urls, findings, confidencePct, agentsActive } = useMemo(() => {
    const urlSet = new Set<string>();
    let findingCount = 0;
    let confSum = 0;
    let confN = 0;
    let active = 0;
    for (const lane of Object.values(lanes)) {
      if (lane.status === "running") active++;
      for (const step of lane.trace) {
        if (step.link) urlSet.add(step.link);
      }
      for (const f of lane.findings) {
        findingCount++;
        confSum += CONFIDENCE_WEIGHT[f.confidence];
        confN++;
      }
    }
    return {
      urls: urlSet.size,
      findings: findingCount,
      confidencePct: confN > 0 ? Math.round((confSum / confN) * 100) : 0,
      agentsActive: active,
    };
  }, [lanes]);

  const canCancel = phase === "analyzing" || phase === "synthesizing" || phase === "parsing" || phase === "uploading";

  return (
    <div className="apollo-glass border-b border-apollo-border">
      <div className="max-w-[1400px] mx-auto px-6 py-4 space-y-4">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <div className="flex items-center gap-2 text-[9.5px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  phase === "error" ? "bg-apollo-contradict" : phase === "done" ? "bg-apollo-verify" : "bg-apollo-navy apollo-pulse-dot"
                }`} />
                {PHASE_LABEL[phase]}
              </div>
              <div className="apollo-serif text-xl text-apollo-ink truncate mt-0.5">
                {subject}
              </div>
            </div>
            {sequential && (
              <span className="text-[9.5px] font-mono uppercase tracking-[0.18em] px-2 py-0.5 rounded bg-apollo-flag/10 text-apollo-flag border border-apollo-flag/20">
                Sequential
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <Stat
              label="Agents active"
              value={<Counter to={agentsActive} format={(n) => String(Math.round(n))} />}
              icon={Activity}
              tone={agentsActive > 0 ? "navy" : "default"}
              minWidth={88}
            />
            <Stat
              label="URLs visited"
              value={<Counter to={urls} />}
              icon={Link2}
              minWidth={88}
            />
            <Stat
              label="Findings"
              value={<Counter to={findings} />}
              icon={Sparkles}
              minWidth={76}
            />
            <Stat
              label="Confidence"
              value={<><Counter to={confidencePct} />%</>}
              icon={GaugeIcon}
              minWidth={96}
              tone={confidencePct >= 66 ? "verify" : confidencePct >= 33 ? "flag" : "default"}
            />
            <Stat
              label="Elapsed"
              value={formatElapsed(elapsedMs)}
              minWidth={60}
            />
            {canCancel && (
              <div className="pl-3 border-l border-apollo-border">
                <CancelButton onCancel={onCancel} />
              </div>
            )}
          </div>
        </div>

        <ProgressConstellation lanes={lanes} />
      </div>
    </div>
  );
}
