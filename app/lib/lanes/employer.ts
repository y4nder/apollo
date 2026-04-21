import { runLane } from "./runLane";
import { employerPrompt } from "../prompts";
import type { ResumeClaims, LaneResult } from "../schemas";
import type { SSEEmit } from "../sse";

export async function runEmployerLane(
  claims: ResumeClaims,
  emit: SSEEmit,
  signal?: AbortSignal
): Promise<LaneResult> {
  const { system, user } = employerPrompt(claims);
  return runLane({
    laneId: "employer",
    label: "Employer verification",
    systemPrompt: system,
    userPrompt: user,
    claims,
    emit,
    signal,
  });
}
