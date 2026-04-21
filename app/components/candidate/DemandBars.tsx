"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Job } from "../../lib/skills/types";

interface DemandBarsProps {
  jobs: Job[];
  userSkills: string[];
  limit?: number;
}

export function DemandBars({ jobs, userSkills, limit = 6 }: DemandBarsProps) {
  const reduce = useReducedMotion();
  const totalJobs = jobs.length;
  if (totalJobs === 0) return null;

  const counts = new Map<string, number>();
  for (const job of jobs) {
    for (const req of job.skills_required) {
      counts.set(req.name, (counts.get(req.name) ?? 0) + 1);
    }
  }

  const ranked = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);

  if (ranked.length === 0) return null;

  const userSet = new Set(userSkills);
  const maxCount = ranked[0].count;

  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted mb-2">
        Market demand · top skills
      </div>
      <ul className="space-y-1.5">
        {ranked.map((row, i) => {
          const owned = userSet.has(row.name);
          const fillPct = Math.max(6, (row.count / maxCount) * 100);
          return (
            <li
              key={row.name}
              title={`${row.count} of ${totalJobs} jobs need this skill`}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span
                  className={`text-[11px] truncate ${owned ? "text-apollo-ink" : "text-apollo-muted"}`}
                >
                  {row.name}
                </span>
                <span className="text-[10px] font-mono tabular-nums text-apollo-muted shrink-0">
                  {row.count}/{totalJobs}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-apollo-border/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: owned
                      ? "var(--apollo-verify)"
                      : "var(--apollo-border-strong)",
                  }}
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${fillPct}%` }}
                  transition={{
                    duration: 0.9,
                    delay: i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
