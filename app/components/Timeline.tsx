"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { TraceStep } from "../lib/schemas";
import TimelineStep from "./TimelineStep";

interface Props {
  trace: TraceStep[];
  tall?: boolean;
}

export default function Timeline({ trace, tall }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [trace.length]);

  const start = trace[0]?.timestamp;

  return (
    <div
      ref={ref}
      className={`apollo-scrollbar overflow-y-auto px-3 py-2 bg-white ${
        tall ? "max-h-[480px] min-h-[320px]" : "max-h-64 min-h-32"
      }`}
    >
      {trace.length === 0 ? (
        <div className="flex items-center gap-2 text-[11px] text-apollo-muted font-mono uppercase tracking-[0.22em] py-10">
          <span className="w-1.5 h-1.5 rounded-full bg-apollo-muted apollo-pulse-dot" />
          Waiting for first step…
        </div>
      ) : (
        <motion.ol
          className="relative apollo-rail"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: reduce ? 0 : 0.04 } },
          }}
        >
          {trace.map((step) => (
            <TimelineStep key={step.id} step={step} lineStartMs={start} />
          ))}
        </motion.ol>
      )}
    </div>
  );
}
