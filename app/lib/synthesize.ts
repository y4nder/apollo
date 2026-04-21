import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  VerificationReport,
  type JobContext,
  type LaneResult,
  type ResumeClaims,
} from "./schemas";

const SYSTEM_PROMPT =
  "You are the final synthesizer for a hiring-side resume verification. " +
  "Given the candidate's claims, the specific role being hired, and four lane reports " +
  "(employer / linkedin / github / news), produce a VerificationReport the hiring " +
  "manager can skim in 30 seconds. " +
  "Rules: " +
  "1. Every claimRef from the lane findings should appear in the claims array. " +
  "2. Each entry in the claims array must have a UNIQUE claimRef. If multiple " +
  "projects or employers exist, use indexed refs ('projects[0]', 'projects[1]', " +
  "'employers[0]') — never repeat a bare 'projects' or 'employers' across rows. " +
  "3. Deduplicate overlapping findings across lanes — for the same claimRef, pick " +
  "the highest-confidence conclusion and merge sources. " +
  "4. label is a short human-readable name like 'Senior Engineer @ Stripe, 2020–2023'. " +
  "5. sources must be URLs drawn only from the lane findings' evidence. " +
  "6. overall = 'strong' if most claims are verified with strong sources AND the " +
  "candidate's evidence is decision-useful for the role being hired; 'weak' if >1 " +
  "contradicted, or if the evidence is largely off-target for the role; 'mixed' otherwise. " +
  "7. redFlags surfaces the most important concerns — keep to 0-4 entries, each one " +
  "sentence. Role-fit mismatches are valid red flags when substantial.";

export async function synthesize(
  claims: ResumeClaims,
  laneResults: LaneResult[],
  job: JobContext,
  signal?: AbortSignal
): Promise<VerificationReport> {
  const payload = {
    role: {
      title: job.title,
      category: job.category,
      description: job.description,
      coreSkills: job.coreSkills,
      niceSkills: job.niceSkills,
    },
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
    prompt: `Today's date is ${new Date().toISOString().slice(0, 10)}. Reason about employment dates, "current" roles, and timelines relative to this date. Weight your overall judgment toward claims that matter for the role being hired (${job.title}). A strong engineering record is not a strong fit for a ${job.title} role unless the skills align.

Here are the role, claims, and lane results as JSON:

${JSON.stringify(payload, null, 2)}

Produce the VerificationReport.`,
    abortSignal: signal,
  });

  return { ...object, candidateName: claims.candidateName };
}
