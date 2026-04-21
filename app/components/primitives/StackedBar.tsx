"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface BarSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface Props {
  segments: BarSegment[];
  height?: number;
  showLegend?: boolean;
  compact?: boolean;
}

export function StackedBar({ segments, height = 8, showLegend = true, compact }: Props) {
  const reduce = useReducedMotion();
  const total = segments.reduce((a, s) => a + s.value, 0);

  return (
    <div className="w-full">
      <div
        className="flex w-full overflow-hidden rounded-full bg-apollo-border/60"
        style={{ height }}
      >
        {total === 0 ? null : (
          segments.map((s, i) => {
            const pct = (s.value / total) * 100;
            if (pct === 0) return null;
            return (
              <motion.div
                key={s.key}
                style={{ background: s.color }}
                initial={reduce ? false : { width: "0%" }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              />
            );
          })
        )}
      </div>
      {showLegend && (
        <div
          className={`${compact ? "mt-1.5 gap-x-3 gap-y-0.5 text-[10px]" : "mt-2 gap-x-4 gap-y-1 text-[11px]"} flex flex-wrap`}
        >
          {segments.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5 text-apollo-muted">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="text-apollo-ink">{s.label}</span>
              <span className="tabular-nums">{s.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
