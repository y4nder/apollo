"use client";

import { useEffect, useRef } from "react";
import type { TraceStep } from "../lib/schemas";
import TraceStepItem from "./TraceStepItem";

interface Props {
  trace: TraceStep[];
  tall?: boolean;
}

export default function AgentTrace({ trace, tall }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [trace.length]);

  return (
    <div
      ref={ref}
      className={`apollo-scrollbar overflow-y-auto px-3 py-1 bg-white ${
        tall ? "max-h-[480px] min-h-[320px]" : "max-h-64 min-h-32"
      }`}
    >
      {trace.length === 0 ? (
        <div className="flex items-center gap-2 text-[11px] text-apollo-muted font-mono uppercase tracking-[0.2em] py-8">
          <span className="w-1.5 h-1.5 rounded-full bg-apollo-muted apollo-pulse-dot" />
          waiting for first step
        </div>
      ) : (
        trace.map((step) => <TraceStepItem key={step.id} step={step} />)
      )}
    </div>
  );
}
