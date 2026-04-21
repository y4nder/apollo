"use client";

import type { MatchResult } from "../../lib/skills/types";
import { SkillChip } from "../candidate/SkillChip";
import { ScoreBar } from "../candidate/ScoreBar";

export function ApplicationMatchPanel({ match }: { match: MatchResult }) {
  const { job, score, matched, adjacent, missing_core, missing_nice } = match;
  return (
    <div className="apollo-card-strong p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
            Skill match · {job.category}
          </div>
          <h3 className="apollo-serif text-[20px] mt-1 text-apollo-ink leading-tight">
            {job.title}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
            Score
          </div>
          <div className="apollo-serif text-[26px] text-apollo-navy tabular-nums leading-none mt-0.5">
            {score}
          </div>
        </div>
      </div>
      <ScoreBar score={score} compact />
      <div className="space-y-3 pt-1">
        {matched.length > 0 && (
          <Section label="Matched" tone="verify">
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
            Score capped at 60 — at least one core skill has no direct or adjacent match.
          </p>
        )}
      </div>
    </div>
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
