"use client";

import {
  motion,
  useReducedMotion,
  animate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";

interface Breakdown {
  verified: number;
  flagged: number;
  contradicted: number;
  unverified: number;
}

interface Props {
  score: number;
  breakdown: Breakdown;
  size?: number;
  label?: string;
}

const START_ANGLE = -135;
const TOTAL_ANGLE = 270;

export function Gauge({ score, breakdown, size = 200, label = "Trust score" }: Props) {
  const reduce = useReducedMotion();
  const total =
    breakdown.verified + breakdown.flagged + breakdown.contradicted + breakdown.unverified;

  const mv = useMotionValue(reduce ? score : 0);
  const displayed = useTransform(mv, (v) => String(Math.round(v)));

  useEffect(() => {
    if (reduce) {
      mv.set(score);
      return;
    }
    const controls = animate(mv, score, { duration: 1.2, ease: "easeOut" });
    return () => controls.stop();
  }, [score, reduce, mv]);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-center text-apollo-muted font-mono text-[11px] uppercase tracking-[0.22em]"
        style={{ width: size, height: size }}
      >
        No claims assessed
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;

  const segments = [
    { key: "verified", frac: breakdown.verified / total, color: "var(--apollo-verify)" },
    { key: "flagged", frac: breakdown.flagged / total, color: "var(--apollo-flag)" },
    { key: "contradicted", frac: breakdown.contradicted / total, color: "var(--apollo-contradict)" },
    { key: "unverified", frac: breakdown.unverified / total, color: "var(--apollo-border-strong)" },
  ].filter((s) => s.frac > 0);

  let cumulative = 0;
  const paths = segments.map((s) => {
    const segStart = START_ANGLE + cumulative * TOTAL_ANGLE;
    const segEnd = START_ANGLE + (cumulative + s.frac) * TOTAL_ANGLE;
    cumulative += s.frac;
    return {
      ...s,
      d: describeArc(cx, cy, r, segStart, segEnd),
    };
  });

  const trackD = describeArc(cx, cy, r, START_ANGLE, START_ANGLE + TOTAL_ANGLE);

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <path
          d={trackD}
          stroke="var(--apollo-border)"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
        {paths.map((p, i) => (
          <motion.path
            key={p.key}
            d={p.d}
            stroke={p.color}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.2,
              delay: 0.1 * i,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="apollo-serif text-[56px] text-apollo-ink tabular-nums leading-none">
          {displayed}
        </motion.span>
        <span className="text-[9px] font-mono uppercase tracking-[0.28em] text-apollo-muted mt-2">
          {label}
        </span>
      </div>
    </div>
  );
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const span = endAngleDeg - startAngleDeg;
  if (Math.abs(span) < 0.1) return "";
  const start = polarToCartesian(cx, cy, r, startAngleDeg);
  const end = polarToCartesian(cx, cy, r, endAngleDeg);
  const largeArc = Math.abs(span) > 180 ? 1 : 0;
  const sweep = span > 0 ? 1 : 0;
  return `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
