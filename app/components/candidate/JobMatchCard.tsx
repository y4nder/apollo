"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Job, MatchResult } from "../../lib/skills/types";
import { SkillChip } from "./SkillChip";
import { ScoreBar } from "./ScoreBar";

export interface JobWithEmployer extends Job {
  employer: {
    id: string;
    company_name: string;
    slug: string;
  };
}

interface JobMatchCardProps {
  match: MatchResult & { job: JobWithEmployer };
  rank: number;
  onApply: (job: JobWithEmployer) => void;
  alreadyApplied?: boolean;
}

export function JobMatchCard({
  match,
  rank,
  onApply,
  alreadyApplied,
}: JobMatchCardProps) {
  const [open, setOpen] = useState(rank === 1);
  const reduce = useReducedMotion();
  const { job, score, matched, adjacent, missing_core, missing_nice } = match;

  return (
    <motion.div
      layout
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="apollo-card-strong overflow-hidden"
    >
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
              <span className="tabular-nums">#{String(rank).padStart(2, "0")}</span>
              <span className="text-apollo-border-strong">·</span>
              <span>{job.category}</span>
              <span className="text-apollo-border-strong">·</span>
              <span>{job.employer.company_name}</span>
            </div>
            <h3 className="apollo-serif text-[22px] mt-1.5 text-apollo-ink leading-tight">
              {job.title}
            </h3>
            <p className="text-[13px] text-apollo-ink/70 mt-1.5 leading-relaxed">
              {job.description}
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => onApply(job)}
              disabled={alreadyApplied}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-apollo-navy text-white text-[13px] font-medium hover:bg-apollo-navy-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {alreadyApplied ? "Applied" : "Apply"}
            </button>
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-apollo-muted tabular-nums">
              {score}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <ScoreBar score={score} compact />
        </div>
      </div>

      <div className="border-t border-apollo-border bg-apollo-paper/40">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-2.5 text-[10.5px] font-mono uppercase tracking-[0.22em] text-apollo-muted hover:text-apollo-ink transition-colors"
        >
          <span>
            {matched.length} matched · {adjacent.length} adjacent ·{" "}
            {missing_core.length + missing_nice.length} gaps
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 pt-1 space-y-3">
                {matched.length > 0 && (
                  <Section label="You have" tone="verify">
                    {matched.map((s) => (
                      <SkillChip key={s} name={s} variant="matched" />
                    ))}
                  </Section>
                )}
                {adjacent.length > 0 && (
                  <Section label="Adjacent" tone="navy">
                    {adjacent.map((a) => (
                      <SkillChip
                        key={a.required}
                        name={`${a.required} ← ${a.user_has}`}
                        variant="adjacent"
                      />
                    ))}
                  </Section>
                )}
                {missing_core.length > 0 && (
                  <Section label="Missing · core" tone="contradict">
                    {missing_core.map((s) => (
                      <SkillChip key={s} name={s} variant="missing-core" />
                    ))}
                  </Section>
                )}
                {missing_nice.length > 0 && (
                  <Section label="Missing · nice" tone="flag">
                    {missing_nice.map((s) => (
                      <SkillChip key={s} name={s} variant="missing-nice" />
                    ))}
                  </Section>
                )}
                {match.breakdown.capped_by_missing_core && (
                  <p className="text-[11px] text-apollo-contradict/90 italic">
                    Score capped at 60 — at least one core skill has no match or adjacency.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Section({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "verify" | "navy" | "contradict" | "flag";
  children: React.ReactNode;
}) {
  const dot =
    tone === "verify"
      ? "bg-apollo-verify"
      : tone === "navy"
        ? "bg-apollo-navy"
        : tone === "contradict"
          ? "bg-apollo-contradict"
          : "bg-apollo-flag";
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
