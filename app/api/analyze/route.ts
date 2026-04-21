import { createSSE, sseHeaders } from "../../lib/sse";
import { parseResume } from "../../lib/parseResume";
import { getConfiguredConcurrency } from "../../lib/stagehand";
import { runEmployerLane } from "../../lib/lanes/employer";
import { runLinkedinLane } from "../../lib/lanes/linkedin";
import { runGithubLane } from "../../lib/lanes/github";
import { runNewsLane } from "../../lib/lanes/news";
import { synthesize } from "../../lib/synthesize";
import type {
  JobContext,
  LaneId,
  LaneResult,
  ResumeClaims,
} from "../../lib/schemas";
import { authorizeApplicationAccess } from "../../lib/auth";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import {
  saveVerificationReport,
  setApplicationStatus,
} from "../../lib/reports/save";
import { trustScore, claimsBreakdown } from "../../lib/evidenceTrail";

export const maxDuration = 300;
export const runtime = "nodejs";

type LaneRunner = (
  claims: ResumeClaims,
  job: JobContext,
  emit: Parameters<typeof runEmployerLane>[2],
  signal?: AbortSignal
) => Promise<LaneResult>;

const LANES: Array<{ id: LaneId; run: LaneRunner }> = [
  { id: "employer", run: runEmployerLane },
  { id: "linkedin", run: runLinkedinLane },
  { id: "github", run: runGithubLane },
  { id: "news", run: runNewsLane },
];

type ResumeRow = {
  id: string;
  storage_path: string;
  filename: string;
  claims: ResumeClaims | null;
  candidate_name: string;
};

export async function POST(req: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  let body: { applicationId?: string };
  try {
    body = (await req.json()) as { applicationId?: string };
  } catch {
    return Response.json(
      { error: "Expected JSON body with { applicationId }" },
      { status: 400 }
    );
  }
  const applicationId = body.applicationId;
  if (!applicationId || typeof applicationId !== "string") {
    return Response.json(
      { error: "Missing applicationId" },
      { status: 400 }
    );
  }

  // Authorize + load application + job (service-role internally, auth-gated).
  const { application, job: jobRow } = await authorizeApplicationAccess(
    applicationId
  );

  const admin = createSupabaseAdminClient();
  const resumeRes = (await admin
    .from("resumes")
    .select("id, storage_path, filename, claims, candidate_name")
    .eq("id", application.resume_id)
    .single()) as unknown as { data: ResumeRow | null; error: unknown };
  if (resumeRes.error || !resumeRes.data) {
    return Response.json({ error: "Resume not found" }, { status: 404 });
  }
  const resume = resumeRes.data;

  const jobContext: JobContext = {
    id: jobRow.id,
    title: jobRow.title,
    category: jobRow.category,
    description: jobRow.description,
    coreSkills: jobRow.skills_required
      .filter((s) => s.core)
      .map((s) => s.name),
    niceSkills: jobRow.skills_required
      .filter((s) => !s.core)
      .map((s) => s.name),
  };

  const { emit, close, stream } = createSSE();
  const signal = req.signal;
  const startedAt = Date.now();
  const runId = crypto.randomUUID();

  (async () => {
    try {
      await setApplicationStatus(applicationId, "verifying");
      await emit("runStarted", { runId, startedAt });
      await emit("upload", { filename: resume.filename, bytes: 0 });

      let claims: ResumeClaims;
      if (resume.claims) {
        claims = resume.claims;
      } else {
        await emit("parsing", { stage: "downloading resume" });
        const dl = await admin.storage
          .from("resumes")
          .download(resume.storage_path);
        if (dl.error || !dl.data) {
          throw new Error(
            `Could not download resume: ${dl.error?.message ?? "unknown"}`
          );
        }
        const bytes = new Uint8Array(await dl.data.arrayBuffer());
        await emit("parsing", { stage: "extracting claims" });
        claims = await parseResume({ bytes, filename: resume.filename });
        await admin
          .from("resumes")
          .update({ claims })
          .eq("id", resume.id);
      }

      const hasAnyClaim =
        claims.employers.length > 0 ||
        claims.schools.length > 0 ||
        claims.projects.length > 0 ||
        claims.skills.length > 0;
      if (!hasAnyClaim && !claims.rawText.trim()) {
        await setApplicationStatus(applicationId, "failed");
        await emit("error", {
          message: "Could not extract claims — is the PDF text-based?",
        });
        return;
      }
      await emit("claims", claims);
      await emit("job", jobContext);

      const concurrency = getConfiguredConcurrency();
      const sequential = concurrency <= 1;
      await emit("mode", { concurrency, sequential });

      let laneResults: LaneResult[];
      if (sequential) {
        laneResults = [];
        for (const lane of LANES) {
          if (signal.aborted) break;
          const result = await lane.run(claims, jobContext, emit, signal);
          laneResults.push(result);
        }
      } else {
        const settled = await Promise.allSettled(
          LANES.map((lane) => lane.run(claims, jobContext, emit, signal))
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

      if (signal.aborted) {
        await setApplicationStatus(applicationId, "submitted");
        return;
      }

      await emit("synthesizing", {});
      const report = await synthesize(claims, laneResults, jobContext, signal);
      await emit("report", report);

      const ts = trustScore(report.claims);
      const finishedAt = Date.now();
      await saveVerificationReport({
        applicationId,
        runId,
        report,
        laneResults,
        claims,
        trustScore: ts,
        startedAt,
        finishedAt,
      });
      await setApplicationStatus(applicationId, "verified");

      const breakdown = claimsBreakdown(report.claims);
      await emit("done", {
        elapsedMs: finishedAt - startedAt,
        trustScore: Math.round(ts),
        breakdown,
      });
    } catch (err) {
      if (signal.aborted) {
        try {
          await setApplicationStatus(applicationId, "submitted");
        } catch {
          // best effort
        }
        return;
      }
      try {
        await setApplicationStatus(applicationId, "failed");
      } catch {
        // best effort
      }
      const message = err instanceof Error ? err.message : String(err);
      await emit("error", { message });
    } finally {
      await close();
    }
  })();

  return new Response(stream, { headers: sseHeaders });
}
