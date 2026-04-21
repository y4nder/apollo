"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Brain, MousePointerClick, Eye, CircleCheck, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TraceStep } from "../lib/schemas";
import { SourceChip } from "./primitives/SourceChip";

const STYLES: Record<
  TraceStep["type"],
  { Icon: LucideIcon; label: string; ring: string; text: string; bg: string }
> = {
  thought: {
    Icon: Brain,
    label: "Thought",
    ring: "ring-apollo-muted/30",
    text: "text-apollo-muted",
    bg: "bg-white",
  },
  action: {
    Icon: MousePointerClick,
    label: "Action",
    ring: "ring-apollo-navy/40",
    text: "text-apollo-navy",
    bg: "bg-apollo-navy/[0.04]",
  },
  observation: {
    Icon: Eye,
    label: "Observation",
    ring: "ring-apollo-ink/25",
    text: "text-apollo-ink",
    bg: "bg-white",
  },
  finding: {
    Icon: CircleCheck,
    label: "Finding",
    ring: "ring-apollo-verify/45",
    text: "text-apollo-verify",
    bg: "bg-apollo-verify/[0.06]",
  },
  error: {
    Icon: TriangleAlert,
    label: "Error",
    ring: "ring-apollo-contradict/45",
    text: "text-apollo-contradict",
    bg: "bg-apollo-contradict/[0.04]",
  },
};

const COLLAPSE_CHARS = 220;

interface Props {
  step: TraceStep;
  lineStartMs?: number;
  showLaneTag?: string;
  compact?: boolean;
}

export default function TimelineStep({ step, lineStartMs, showLaneTag, compact }: Props) {
  const reduce = useReducedMotion();
  const cfg = STYLES[step.type];
  const long = step.text.length > COLLAPSE_CHARS;
  const [expanded, setExpanded] = useState(false);

  const rel =
    lineStartMs !== undefined
      ? `+${((step.timestamp - lineStartMs) / 1000).toFixed(1)}s`
      : null;

  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`relative ${compact ? "pl-7" : "pl-8"} py-2`}
    >
      <span
        className={`absolute left-0 top-2 ${compact ? "w-5 h-5" : "w-6 h-6"} rounded-full bg-white ring-2 ${cfg.ring} flex items-center justify-center shadow-sm`}
      >
        <cfg.Icon
          className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"} ${cfg.text}`}
          strokeWidth={2}
        />
      </span>
      <div className={`${cfg.bg} rounded-md px-2.5 py-1.5 border border-apollo-border/70`}>
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`text-[9px] font-mono uppercase tracking-[0.22em] ${cfg.text}`}
          >
            {cfg.label}
          </span>
          {showLaneTag && (
            <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
              · {showLaneTag}
            </span>
          )}
          <span className="ml-auto text-[9.5px] font-mono text-apollo-muted tabular-nums">
            {rel}
          </span>
        </div>
        <div
          className={`text-[12.5px] text-apollo-ink leading-snug whitespace-pre-wrap break-words ${
            !expanded && long ? "line-clamp-3" : ""
          }`}
        >
          {step.text}
        </div>
        {long && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-[10.5px] font-mono uppercase tracking-[0.18em] text-apollo-muted hover:text-apollo-navy"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        )}
        {step.link && (
          <div className="mt-1.5">
            <SourceChip url={step.link} size="xs" />
          </div>
        )}
      </div>
    </motion.li>
  );
}
