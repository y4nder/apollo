import { createSSE, sseHeaders } from "../../lib/sse";
import { parseResume } from "../../lib/parseResume";
import { getConfiguredConcurrency } from "../../lib/stagehand";
import { runEmployerLane } from "../../lib/lanes/employer";
import { runLinkedinLane } from "../../lib/lanes/linkedin";
import { runGithubLane } from "../../lib/lanes/github";
import { runNewsLane } from "../../lib/lanes/news";
import { synthesize } from "../../lib/synthesize";
import type { LaneId, LaneResult } from "../../lib/schemas";

export const maxDuration = 300;
export const runtime = "nodejs";

const DEFAULT_MAX_PDF_BYTES = 5 * 1024 * 1024;

type LaneRunner = (
  claims: Parameters<typeof runEmployerLane>[0],
  emit: Parameters<typeof runEmployerLane>[1],
  signal?: AbortSignal
) => Promise<LaneResult>;

const LANES: Array<{ id: LaneId; run: LaneRunner }> = [
  { id: "employer", run: runEmployerLane },
  { id: "linkedin", run: runLinkedinLane },
  { id: "github", run: runGithubLane },
  { id: "news", run: runNewsLane },
];

export async function POST(req: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Expected multipart/form-data with a 'file' field" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing 'file' in form data" }, { status: 400 });
  }
  if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return Response.json({ error: "Only PDF resumes are supported" }, { status: 415 });
  }
  const maxBytes = Number(process.env.APOLLO_MAX_PDF_BYTES ?? DEFAULT_MAX_PDF_BYTES);
  if (file.size > maxBytes) {
    return Response.json({ error: `PDF exceeds ${Math.round(maxBytes / 1024 / 1024)} MB limit` }, { status: 413 });
  }

  const { emit, close, stream } = createSSE();
  const signal = req.signal;
  const startedAt = Date.now();

  (async () => {
    try {
      await emit("upload", { filename: file.name, bytes: file.size });

      await emit("parsing", { stage: "extracting claims" });
      const claims = await parseResume(file);

      const hasAnyClaim =
        claims.employers.length > 0 ||
        claims.schools.length > 0 ||
        claims.projects.length > 0 ||
        claims.skills.length > 0;
      if (!hasAnyClaim && !claims.rawText.trim()) {
        await emit("error", {
          message: "Could not extract claims — is the PDF text-based?",
        });
        return;
      }
      await emit("claims", claims);

      const concurrency = getConfiguredConcurrency();
      const sequential = concurrency <= 1;
      await emit("mode", { concurrency, sequential });

      let laneResults: LaneResult[];
      if (sequential) {
        laneResults = [];
        for (const lane of LANES) {
          if (signal.aborted) break;
          const result = await lane.run(claims, emit, signal);
          laneResults.push(result);
        }
      } else {
        const settled = await Promise.allSettled(
          LANES.map((lane) => lane.run(claims, emit, signal))
        );
        laneResults = settled.map((s, i) =>
          s.status === "fulfilled"
            ? s.value
            : {
                laneId: LANES[i].id,
                status: "failed" as const,
                findings: [],
                notes: s.reason instanceof Error ? s.reason.message : String(s.reason),
              }
        );
      }

      if (signal.aborted) return;

      await emit("synthesizing", {});
      const report = await synthesize(claims, laneResults, signal);
      await emit("report", report);

      await emit("done", { elapsedMs: Date.now() - startedAt });
    } catch (err) {
      if (signal.aborted) return;
      const message = err instanceof Error ? err.message : String(err);
      await emit("error", { message });
    } finally {
      await close();
    }
  })();

  return new Response(stream, { headers: sseHeaders });
}
