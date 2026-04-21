import type {
  ExtractedSkill,
  MatchResult,
  RankedGap,
} from "../skills/types";

/**
 * Input to generateRoadmapPdf.
 *
 * A plain snapshot of already-computed analysis data — the PDF module
 * does not re-run matching or gap-ranking. The caller passes what the UI
 * already shows, so there's a single source of truth.
 */
export interface RoadmapPdfInput {
  /** Optional — shown in the header as the source resume. */
  resumeFilename?: string;
  /** All skills extracted from the resume. */
  extractedSkills: ExtractedSkill[];
  /** All matches, already sorted by score desc. */
  matches: MatchResult[];
  /**
   * Leverage-ranked skill gaps across all jobs in the dataset.
   * Produced by rankGaps() in app/lib/skills/gaps.ts.
   */
  gaps: RankedGap[];
  /** Defaults to new Date() when omitted. */
  generatedAt?: Date;
}
