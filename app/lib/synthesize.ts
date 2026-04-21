import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { VerificationReport, type ResumeClaims, type LaneResult } from "./schemas";

const SYSTEM_PROMPT =
  "You are the final synthesizer for a hiring-side resume verification. " +
  "Given the candidate's claims and four lane reports (employer / linkedin / github / news), " +
  "produce a VerificationReport the hiring manager can skim in 30 seconds. " +
  "Rules: " +
  "1. Every claimRef from the lane findings should appear in the claims array. " +
  "2. Deduplicate overlapping claims across lanes — pick the highest-confidence conclusion. " +
  "3. label is a short human-readable name like 'Senior Engineer @ Stripe, 2020–2023'. " +
  "4. sources must be URLs drawn only from the lane findings' evidence. " +
  "5. overall = 'strong' if most claims are verified with strong sources; 'weak' if >1 contradicted or widespread unverified; 'mixed' otherwise. " +
  "6. redFlags surfaces the most important concerns — keep to 0-4 entries, each one sentence.";

export async function synthesize(
  claims: ResumeClaims,
  laneResults: LaneResult[],
  signal?: AbortSignal
): Promise<VerificationReport> {
  const payload = {
    candidate: {
      name: claims.candidateName,
      summary: claims.summary,
      employers: claims.employers,
      schools: claims.schools,
      projects: claims.projects,
      skills: claims.skills,
      githubHandle: claims.githubHandle,
      linkedinUrl: claims.linkedinUrl,
    },
    lanes: laneResults,
  };

  const { object } = await generateObject({
    model: anthropic(process.env.APOLLO_MODEL ?? "claude-haiku-4-5"),
    schema: VerificationReport,
    system: SYSTEM_PROMPT,
    prompt: `Today's date is ${new Date().toISOString().slice(0, 10)}. Reason about employment dates, "current" roles, and timelines relative to this date.\n\nHere are the claims and lane results as JSON:\n\n${JSON.stringify(payload, null, 2)}\n\nProduce the VerificationReport.`,
    abortSignal: signal,
  });

  return { ...object, candidateName: claims.candidateName };
}
