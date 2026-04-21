"use client";

import type { MatchResult } from "../../lib/skills/types";
import { JobMatchCard, type JobWithEmployer } from "./JobMatchCard";

interface JobMatchListProps {
  matches: Array<MatchResult & { job: JobWithEmployer }>;
  onApply: (job: JobWithEmployer) => void;
  appliedJobIds: Set<string>;
}

export function JobMatchList({
  matches,
  onApply,
  appliedJobIds,
}: JobMatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="apollo-card p-6 text-center">
        <p className="text-sm text-apollo-muted">
          No jobs available right now. Check back soon.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {matches.map((m, i) => (
        <JobMatchCard
          key={m.job.id}
          match={m}
          rank={i + 1}
          onApply={onApply}
          alreadyApplied={appliedJobIds.has(m.job.id)}
        />
      ))}
    </div>
  );
}
