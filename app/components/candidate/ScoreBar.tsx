"use client";

import { motion, useReducedMotion } from "framer-motion";

function bandFor(score: number): {
  label: string;
  color: string;
  text: string;
} {
  if (score >= 75)
    return {
      label: "Strong match",
      color: "var(--apollo-verify)",
      text: "text-apollo-verify",
    };
  if (score >= 50)
    return {
      label: "Partial match",
      color: "var(--apollo-navy)",
      text: "text-apollo-navy",
    };
  if (score >= 25)
    return {
      label: "Stretch",
      color: "var(--apollo-flag)",
      text: "text-apollo-flag",
    };
  return {
    label: "Off-target",
    color: "var(--apollo-contradict)",
    text: "text-apollo-contradict",
  };
}

interface ScoreBarProps {
  score: number;
  showLabel?: boolean;
  compact?: boolean;
}

export function ScoreBar({ score, showLabel = true, compact }: ScoreBarProps) {
  const reduce = useReducedMotion();
  const band = bandFor(score);
  const h = compact ? 5 : 7;

  return (
    <div className="w-full">
      <div
        className="w-full overflow-hidden rounded-full bg-apollo-border/60"
        style={{ height: h }}
      >
        <motion.div
          className="h-full"
          style={{ background: band.color }}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {showLabel && (
        <div className="mt-1.5 flex items-center justify-between text-[10.5px] font-mono uppercase tracking-[0.2em]">
          <span className={band.text}>{band.label}</span>
          <span className="text-apollo-muted tabular-nums">{score} / 100</span>
        </div>
      )}
    </div>
  );
}
