"use client";

import { useEffect } from "react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import type { Job } from "../../lib/skills/types";

interface CoverageDonutProps {
  userSkills: string[];
  jobs: Job[];
  size?: number;
}

export function CoverageDonut({
  userSkills,
  jobs,
  size = 150,
}: CoverageDonutProps) {
  const reduce = useReducedMotion();

  const demanded = new Set<string>();
  for (const job of jobs) {
    for (const req of job.skills_required) demanded.add(req.name);
  }

  const total = userSkills.length;
  const inDemand = userSkills.filter((s) => demanded.has(s)).length;
  const fraction = total === 0 ? 0 : inDemand / total;
  const pct = Math.round(fraction * 100);

  const stroke = 10;
  const r = size / 2 - stroke / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  const mv = useMotionValue(reduce ? pct : 0);
  const displayed = useTransform(mv, (v) => `${Math.round(v)}`);

  useEffect(() => {
    if (reduce) {
      mv.set(pct);
      return;
    }
    const controls = animate(mv, pct, { duration: 1.0, ease: "easeOut" });
    return () => controls.stop();
  }, [pct, reduce, mv]);

  return (
    <div className="flex items-center justify-center">
      <div
        className="relative inline-block"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="var(--apollo-border)"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="var(--apollo-verify)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={reduce ? false : { strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - circ * fraction }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="apollo-serif text-[40px] text-apollo-ink tabular-nums leading-none">
            {displayed}
          </motion.span>
          <span className="text-[8px] font-mono uppercase tracking-[0.22em] text-apollo-muted mt-1.5">
            % skills in demand
          </span>
          <span className="text-[9px] font-mono text-apollo-muted mt-0.5 tabular-nums">
            {inDemand} of {total}
          </span>
        </div>
      </div>
    </div>
  );
}
