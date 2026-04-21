import { runLane } from "./runLane";
import { newsPrompt } from "../prompts";
import type { ResumeClaims, LaneResult } from "../schemas";
import type { SSEEmit } from "../sse";

export async function runNewsLane(
  claims: ResumeClaims,
  emit: SSEEmit,
  signal?: AbortSignal
): Promise<LaneResult> {
  const { system, user } = newsPrompt(claims);
  return runLane({
    laneId: "news",
    label: "News & web mentions",
    systemPrompt: system,
    userPrompt: user,
    claims,
    emit,
    signal,
  });
}
