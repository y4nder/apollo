import { runLane } from "./runLane";
import { newsPrompt } from "../prompts";
import type { JobContext, LaneResult, ResumeClaims } from "../schemas";
import type { SSEEmit } from "../sse";

export async function runNewsLane(
  claims: ResumeClaims,
  job: JobContext,
  emit: SSEEmit,
  signal?: AbortSignal
): Promise<LaneResult> {
  const { system, user } = newsPrompt(claims, job);
  return runLane({
    laneId: "news",
    label: "News & web mentions",
    systemPrompt: system,
    userPrompt: user,
    claims,
    job,
    emit,
    signal,
  });
}
