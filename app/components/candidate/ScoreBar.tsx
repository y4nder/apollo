"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

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

interface Breakdown {
  matched: number;
  adjacent: number;
  gaps: number;
}

interface ScoreBarProps {
  score: number;
  showLabel?: boolean;
  compact?: boolean;
  breakdown?: Breakdown;
  suppressTooltip?: boolean;
}

export function ScoreBar({
  score,
  showLabel = true,
  compact,
  breakdown,
  suppressTooltip,
}: ScoreBarProps) {
  const reduce = useReducedMotion();
  const band = bandFor(score);
  const h = compact ? 5 : 7;

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<{ visible: boolean; x: number }>({
    visible: false,
    x: 0,
  });

  const canTooltip = !!breakdown && !suppressTooltip;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!canTooltip || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setHover({ visible: true, x });
  }

  return (
    <div className="w-full">
      <div className="relative">
        <div
          ref={trackRef}
          onMouseEnter={() => canTooltip && setHover((p) => ({ ...p, visible: true }))}
          onMouseLeave={() => setHover({ visible: false, x: 0 })}
          onMouseMove={handleMove}
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
        <AnimatePresence>
          {canTooltip && hover.visible && breakdown && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-md border border-apollo-border bg-white px-2 py-1 text-[10.5px] font-mono tracking-[0.06em] text-apollo-ink shadow-sm"
              style={{
                left: hover.x,
                transform: "translateX(-50%)",
              }}
            >
              <span className="text-apollo-verify">{breakdown.matched}</span> matched
              <span className="text-apollo-muted"> · </span>
              <span className="text-apollo-navy">{breakdown.adjacent}</span> adjacent
              <span className="text-apollo-muted"> · </span>
              <span className="text-apollo-contradict">{breakdown.gaps}</span> gaps
            </motion.div>
          )}
        </AnimatePresence>
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
