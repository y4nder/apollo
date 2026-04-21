// A canonical skill — the only names allowed anywhere downstream.
export type CanonicalSkillName = string; // e.g. "JavaScript", not "JS"

export type SkillConfidence = "high" | "medium" | "low";

// Output of extraction.
export interface ExtractedSkill {
  name: CanonicalSkillName;
  evidence: string; // The sentence/phrase from the resume that proves it
  confidence: SkillConfidence;
}

export interface ExtractionResult {
  skills: ExtractedSkill[];
  raw_text_length: number; // For debugging
}

// A required skill on a job.
export interface JobSkillRequirement {
  name: CanonicalSkillName;
  weight: 1 | 2; // 2 = core, 1 = nice-to-have
  core: boolean; // Derived from weight but stored for clarity
}

export type JobCategory =
  | "Data"
  | "Engineering"
  | "Design"
  | "Marketing"
  | "Operations";

export interface Job {
  id: string; // slug, e.g. "data-analyst"
  title: string;
  category: JobCategory;
  description: string;
  skills_required: JobSkillRequirement[];
}

// Output of matching one job.
export interface MatchResult {
  job: Job;
  score: number; // 0-100, integer
  matched: CanonicalSkillName[];
  adjacent: Array<{
    required: CanonicalSkillName;
    user_has: CanonicalSkillName;
  }>;
  missing_core: CanonicalSkillName[];
  missing_nice: CanonicalSkillName[];
  breakdown: {
    weighted_matched: number;
    weighted_adjacent: number;
    weighted_total: number;
    capped_by_missing_core: boolean;
  };
}

// Output of ranking all jobs.
export interface RankedMatches {
  user_skills: ExtractedSkill[];
  jobs: MatchResult[]; // Sorted by score desc
  extracted_at: string; // ISO timestamp
}

export type SkillDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type LearningPlatform =
  | "YouTube"
  | "Coursera"
  | "freeCodeCamp"
  | "Official Docs";

export interface LearningResource {
  title: string;
  platform: LearningPlatform;
  url: string;
}

// A ranked gap for learning recommendations.
export interface RankedGap {
  skill: CanonicalSkillName;
  difficulty: SkillDifficulty;
  estimated_hours: number;
  leverage: number; // How many of the 15 jobs this skill would help with
  jobs_affected: string[]; // Job IDs where this skill is required
  learning: LearningResource[];
}
