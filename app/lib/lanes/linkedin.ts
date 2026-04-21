import { runLane } from "./runLane";
import { linkedinPrompt } from "../prompts";
import type { JobContext, LaneResult, ResumeClaims } from "../schemas";
import type { SSEEmit } from "../sse";

export async function runLinkedinLane(
  claims: ResumeClaims,
  job: JobContext,
  emit: SSEEmit,
  signal?: AbortSignal
): Promise<LaneResult> {
  const { system, user } = linkedinPrompt(claims, job);
  return runLane({
    laneId: "linkedin",
    label: "LinkedIn profile match",
    systemPrompt: system,
    userPrompt: user,
    claims,
    job,
    emit,
    signal,
  });
}
