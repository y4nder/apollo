import { runLane } from "./runLane";
import { linkedinPrompt } from "../prompts";
import type { ResumeClaims, LaneResult } from "../schemas";
import type { SSEEmit } from "../sse";

export async function runLinkedinLane(
  claims: ResumeClaims,
  emit: SSEEmit,
  signal?: AbortSignal
): Promise<LaneResult> {
  const { system, user } = linkedinPrompt(claims);
  return runLane({
    laneId: "linkedin",
    label: "LinkedIn profile match",
    systemPrompt: system,
    userPrompt: user,
    claims,
    emit,
    signal,
  });
}
