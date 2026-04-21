import { runLane } from "./runLane";
import { employerPrompt } from "../prompts";
import type { JobContext, LaneResult, ResumeClaims } from "../schemas";
import type { SSEEmit } from "../sse";

export async function runEmployerLane(
  claims: ResumeClaims,
  job: JobContext,
  emit: SSEEmit,
  signal?: AbortSignal
): Promise<LaneResult> {
  const { system, user } = employerPrompt(claims, job);
  return runLane({
    laneId: "employer",
    label: "Employer verification",
    systemPrompt: system,
    userPrompt: user,
    claims,
    job,
    emit,
    signal,
  });
}
