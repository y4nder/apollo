import { generateText, generateObject, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createStagehandSession } from "../stagehand";
import { LaneResult, type LaneId, type ResumeClaims, type LaneFinding, type TraceStepType } from "../schemas";
import { laneSynthPrompt } from "../prompts";
import { makeLaneTools } from "./tools";
import type { SSEEmit } from "../sse";

export interface RunLaneArgs {
  laneId: LaneId;
  label: string;
  systemPrompt: string;
  userPrompt: string;
  claims: ResumeClaims;
  emit: SSEEmit;
  signal?: AbortSignal;
}

const MODEL = () => process.env.APOLLO_MODEL ?? "claude-haiku-4-5";
const MAX_STEPS = () => Number(process.env.APOLLO_MAX_STEPS_PER_LANE ?? 5);

export async function runLane(args: RunLaneArgs): Promise<LaneResult> {
  const { laneId, label, systemPrompt, userPrompt, claims, emit, signal } = args;

  const emitTrace = (type: TraceStepType, text: string, link?: string) =>
    emit("traceStep", {
      laneId,
      step: {
        id: crypto.randomUUID(),
        laneId,
        type,
        text,
        link,
        timestamp: Date.now(),
      },
    });

  let session: Awaited<ReturnType<typeof createStagehandSession>> | null = null;

  try {
    await emit("laneStarted", { laneId });
    session = await createStagehandSession(label);

    const tools = makeLaneTools(session.stagehand, {
      onAction: (text) => emitTrace("action", text),
      onObservation: (text, link) => emitTrace("observation", text, link),
    });

    const result = await generateText({
      model: anthropic(MODEL()),
      system: systemPrompt,
      prompt: userPrompt,
      tools,
      stopWhen: stepCountIs(MAX_STEPS()),
      abortSignal: signal,
      onStepFinish: async (step) => {
        const text = step.text?.trim();
        if (text) await emitTrace("thought", text);
      },
    });

    const { object: lane } = await generateObject({
      model: anthropic(MODEL()),
      schema: LaneResult,
      prompt: laneSynthPrompt(laneId, result.text, claims),
      abortSignal: signal,
    });

    const normalized: LaneResult = { ...lane, laneId };

    for (const finding of normalized.findings) {
      await emit("laneFinding", { laneId, finding });
      await emitTrace(
        "finding",
        `${finding.claimRef}: ${finding.conclusion} — ${finding.statement}`,
        finding.evidence[0]?.url
      );
    }

    await emit("laneComplete", { laneId, status: normalized.status, notes: normalized.notes });
    return normalized;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await emitTrace("error", msg);
    const failed: LaneResult = {
      laneId,
      status: "failed",
      findings: [] as LaneFinding[],
      notes: msg,
    };
    await emit("laneComplete", { laneId, status: "failed", notes: msg });
    return failed;
  } finally {
    if (session) {
      try {
        await session.stagehand.close();
      } catch {
        // already closed
      }
    }
  }
}
