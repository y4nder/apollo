import { SKILL_META } from "./learning";
import type { CanonicalSkillName, Job, RankedGap } from "./types";

/**
 * Build a leverage-ranked list of skill gaps for a user.
 *
 * For each skill required by any job in the dataset that the user doesn't
 * have (directly — adjacency is not considered, gaps are gaps), return:
 *   - leverage: how many jobs require this skill
 *   - jobs_affected: the ids of those jobs
 *   - difficulty / hours / learning: from SKILL_META
 *
 * Sort: leverage descending, then estimated_hours ascending (cheap wins first).
 *
 * Pure function.
 */
export function rankGaps(
  userSkills: CanonicalSkillName[],
  jobs: Job[],
): RankedGap[] {
  const userSet = new Set(userSkills);

  // missing skill → set of job ids that require it
  const coverage = new Map<CanonicalSkillName, Set<string>>();

  for (const job of jobs) {
    for (const req of job.skills_required) {
      if (userSet.has(req.name)) continue;
      let jobs = coverage.get(req.name);
      if (!jobs) {
        jobs = new Set();
        coverage.set(req.name, jobs);
      }
      jobs.add(job.id);
    }
  }

  const gaps: RankedGap[] = [];
  for (const [skill, jobIds] of coverage) {
    const meta = SKILL_META[skill];
    if (!meta) continue; // defensive — every canonical skill has meta
    gaps.push({
      skill,
      difficulty: meta.difficulty,
      estimated_hours: meta.estimated_hours,
      leverage: jobIds.size,
      jobs_affected: Array.from(jobIds).sort(),
      learning: meta.learning,
    });
  }

  gaps.sort((a, b) => {
    if (b.leverage !== a.leverage) return b.leverage - a.leverage;
    if (a.estimated_hours !== b.estimated_hours) {
      return a.estimated_hours - b.estimated_hours;
    }
    return a.skill.localeCompare(b.skill);
  });

  return gaps;
}
