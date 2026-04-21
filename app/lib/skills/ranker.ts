import { matchJob } from "./matcher";
import type { CanonicalSkillName, Job, MatchResult } from "./types";

/**
 * Score every job against the user's skill set and sort.
 * Primary sort: score descending.
 * Tie-break: title ascending (alphabetical, case-insensitive).
 *
 * Pure function.
 */
export function rankAllJobs(
  userSkills: CanonicalSkillName[],
  jobs: Job[],
): MatchResult[] {
  return jobs
    .map((job) => matchJob(userSkills, job))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.job.title.localeCompare(b.job.title, undefined, {
        sensitivity: "base",
      });
    });
}
