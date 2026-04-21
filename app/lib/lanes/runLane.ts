import { generateText, generateObject, stepCountIs, type StepResult } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createStagehandSession } from "../stagehand";
import { LaneResult, type JobContext, type LaneId, type ResumeClaims, type LaneFinding, type TraceStepType } from "../schemas";
import { laneSynthPrompt } from "../prompts";
import { makeLaneTools, type LaneTools } from "./tools";
import type { SSEEmit } from "../sse";

export interface RunLaneArgs {
  laneId: LaneId;
  label: string;
  systemPrompt: string;
  userPrompt: string;
  claims: ResumeClaims;
  job: JobContext;
  emit: SSEEmit;
  signal?: AbortSignal;
}

const MODEL = () => process.env.APOLLO_MODEL ?? "claude-haiku-4-5";
const MAX_STEPS = () => Number(process.env.APOLLO_MAX_STEPS_PER_LANE ?? 8);

const TRAJECTORY_CHAR_BUDGET = 12_000;

function serializeTrajectory(steps: ReadonlyArray<StepResult<LaneTools>>): string {
  const lines: string[] = [];
  steps.forEach((step, si) => {
    const label = `[step ${si + 1}]`;
    for (const call of step.toolCalls) {
      const result = step.toolResults.find((r) => r.toolCallId === call.toolCallId);
      const input = call.input as Record<string, unknown>;
      const output = (result?.output ?? {}) as Record<string, unknown>;
      switch (call.toolName) {
        case "search": {
          const query = String(input.query ?? "");
          const results = Array.isArray(output.results)
            ? (output.results as Array<{ title?: string; url?: string }>)
            : [];
          const engine = output.engine ? `[${String(output.engine)}] ` : "";
          const err = output.error ? ` ERROR: ${String(output.error)}` : "";
          const body = results.length
            ? results.map((r) => `    - ${r.title ?? ""} (${r.url ?? ""})`).join("\n")
            : "    (no results)";
          lines.push(`${label} search(${JSON.stringify(query)})\n  ${engine}${results.length} result(s)${err}\n${body}`);
          break;
        }
        case "navigate": {
          const requested = String(input.url ?? "");
          const purpose = String(input.purpose ?? "");
          const resolved = String(output.url ?? requested);
          const blocked = Boolean(output.blocked);
          const err = output.error ? ` ERROR: ${String(output.error)}` : "";
          const status = blocked ? "BLOCKED" : "OK";
          const snap = output.snapshot ? `\n  snapshot: ${String(output.snapshot)}` : "";
          lines.push(`${label} navigate(${requested}) — ${purpose}\n  ${status} at ${resolved}${err}${snap}`);
          break;
        }
        case "extract": {
          const instruction = String(input.instruction ?? "");
          const page = output.url ? `\n  from: ${String(output.url)}` : "";
          const value = output.value ? `\n  value: ${String(output.value)}` : "";
          const quote = output.quote ? `\n  quote: "${String(output.quote)}"` : "";
          const err = output.error ? ` ERROR: ${String(output.error)}` : "";
          lines.push(`${label} extract(${JSON.stringify(instruction)})${err}${page}${value}${quote}`);
          break;
        }
      }
    }
    const thought = step.text?.trim();
    if (thought) lines.push(`${label} thought: ${thought}`);
  });
  let out = lines.join("\n\n");
  if (out.length > TRAJECTORY_CHAR_BUDGET) {
    out = out.slice(0, TRAJECTORY_CHAR_BUDGET) + "\n\n… (trajectory truncated)";
  }
  return out;
}

export async function runLane(args: RunLaneArgs): Promise<LaneResult> {
  const { laneId, label, systemPrompt, userPrompt, claims, job, emit, signal } = args;

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

    const trajectory = serializeTrajectory(result.steps);

    const { object: lane } = await generateObject({
      model: anthropic(MODEL()),
      schema: LaneResult,
      prompt: laneSynthPrompt(laneId, result.text, claims, trajectory, job),
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
