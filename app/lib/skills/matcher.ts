import { areAdjacent } from "./taxonomy";
import type {
  CanonicalSkillName,
  Job,
  MatchResult,
} from "./types";

/**
 * Score a single job against a user's canonical skill set.
 *
 * Algorithm (spec §9):
 *   1. For each required skill the user has directly, add its weight to
 *      `weighted_matched`.
 *   2. For each required skill the user lacks directly, look for an adjacent
 *      skill the user has. If found, add `0.5 * weight` to `weighted_adjacent`
 *      and record the (required, user_has) pair. Otherwise record it as
 *      missing (core or nice).
 *   3. raw = 100 * (matched + adjacent) / total.
 *   4. If ANY core skill is missing (no direct match), cap at 60.
 *   5. Round to integer.
 *
 * Pure function — no side effects, no I/O. Fully unit-testable.
 */
export function matchJob(
  userSkills: CanonicalSkillName[],
  job: Job,
): MatchResult {
  const userSet = new Set(userSkills);

  const matched: CanonicalSkillName[] = [];
  const adjacent: MatchResult["adjacent"] = [];
  const missingCore: CanonicalSkillName[] = [];
  const missingNice: CanonicalSkillName[] = [];

  let weightedMatched = 0;
  let weightedAdjacent = 0;
  let weightedTotal = 0;

  for (const required of job.skills_required) {
    weightedTotal += required.weight;

    if (userSet.has(required.name)) {
      matched.push(required.name);
      weightedMatched += required.weight;
      continue;
    }

    // Missing a direct match — probe adjacency. First match wins.
    const adjacentUserSkill = userSkills.find((us) =>
      areAdjacent(required.name, us),
    );

    if (adjacentUserSkill !== undefined) {
      adjacent.push({ required: required.name, user_has: adjacentUserSkill });
      weightedAdjacent += 0.5 * required.weight;
    } else if (required.core) {
      missingCore.push(required.name);
    } else {
      missingNice.push(required.name);
    }
  }

  // Guard: an empty job requirements list would make the formula divide by
  // zero. A job with no requirements is trivially a 100% match.
  const rawScore =
    weightedTotal === 0
      ? 100
      : (100 * (weightedMatched + weightedAdjacent)) / weightedTotal;

  // Core-skill cap: the spec says "if any `core: true` skill is missing
  // (not even adjacent), cap the score at 60."
  const cappedByMissingCore = missingCore.length > 0;
  const cappedScore = cappedByMissingCore ? Math.min(rawScore, 60) : rawScore;

  return {
    job,
    score: Math.round(cappedScore),
    matched,
    adjacent,
    missing_core: missingCore,
    missing_nice: missingNice,
    breakdown: {
      weighted_matched: weightedMatched,
      weighted_adjacent: weightedAdjacent,
      weighted_total: weightedTotal,
      capped_by_missing_core: cappedByMissingCore,
    },
  };
}
