import { runLane } from "./runLane";
import { githubPrompt } from "../prompts";
import type { JobContext, LaneResult, ResumeClaims } from "../schemas";
import type { SSEEmit } from "../sse";

export async function runGithubLane(
  claims: ResumeClaims,
  job: JobContext,
  emit: SSEEmit,
  signal?: AbortSignal
): Promise<LaneResult> {
  const { system, user } = githubPrompt(claims, job);
  return runLane({
    laneId: "github",
    label: "GitHub / portfolio check",
    systemPrompt: system,
    userPrompt: user,
    claims,
    job,
    emit,
    signal,
  });
}
