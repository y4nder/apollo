import { z } from "zod";

export const LaneId = z.enum(["employer", "linkedin", "github", "news"]);
export type LaneId = z.infer<typeof LaneId>;

export const ResumeClaims = z.object({
  candidateName: z.string(),
  summary: z.string().optional(),
  employers: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      location: z.string().optional(),
    })
  ),
  schools: z.array(
    z.object({
      name: z.string(),
      degree: z.string().optional(),
      field: z.string().optional(),
      gradDate: z.string().optional(),
    })
  ),
  skills: z.array(z.string()),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
    })
  ),
  githubHandle: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  rawText: z.string(),
});
export type ResumeClaims = z.infer<typeof ResumeClaims>;

export const TraceStepType = z.enum(["thought", "action", "observation", "finding", "error"]);
export type TraceStepType = z.infer<typeof TraceStepType>;

export const TraceStep = z.object({
  id: z.string(),
  laneId: LaneId,
  type: TraceStepType,
  text: z.string(),
  link: z.string().optional(),
  timestamp: z.number(),
});
export type TraceStep = z.infer<typeof TraceStep>;

export const Evidence = z.object({
  url: z.string(),
  quote: z.string().optional(),
});
export type Evidence = z.infer<typeof Evidence>;

export const LaneFinding = z.object({
  claimRef: z.string(),
  statement: z.string(),
  evidence: z.array(Evidence),
  confidence: z.enum(["high", "medium", "low"]),
  conclusion: z.enum(["verified", "unverified", "contradicted", "flagged"]),
});
export type LaneFinding = z.infer<typeof LaneFinding>;

export const LaneResult = z.object({
  laneId: LaneId,
  status: z.enum(["ok", "partial", "failed"]),
  findings: z.array(LaneFinding),
  notes: z.string().optional(),
});
export type LaneResult = z.infer<typeof LaneResult>;

export const ClaimSummary = z.object({
  claimRef: z.string(),
  label: z.string(),
  status: z.enum(["verified", "unverified", "contradicted", "flagged"]),
  rationale: z.string(),
  sources: z.array(z.string()),
});
export type ClaimSummary = z.infer<typeof ClaimSummary>;

export const VerificationReport = z.object({
  candidateName: z.string(),
  overall: z.enum(["strong", "mixed", "weak"]),
  summary: z.string(),
  claims: z.array(ClaimSummary),
  redFlags: z.array(z.string()),
});
export type VerificationReport = z.infer<typeof VerificationReport>;
