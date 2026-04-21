import { runLane } from "./runLane";
import { githubPrompt } from "../prompts";
import type { ResumeClaims, LaneResult } from "../schemas";
import type { SSEEmit } from "../sse";

export async function runGithubLane(
  claims: ResumeClaims,
  emit: SSEEmit,
  signal?: AbortSignal
): Promise<LaneResult> {
  const { system, user } = githubPrompt(claims);
  return runLane({
    laneId: "github",
    label: "GitHub / portfolio check",
    systemPrompt: system,
    userPrompt: user,
    claims,
    emit,
    signal,
  });
}
