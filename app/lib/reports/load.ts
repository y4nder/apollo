import "server-only";
import { createSupabaseAdminClient } from "../supabase/admin";
import type { LaneResult, ResumeClaims, VerificationReport } from "../schemas";

export interface SavedReport {
  runId: string;
  report: VerificationReport;
  laneResults: LaneResult[];
  claims: ResumeClaims;
  trustScore: number;
  startedAt: string;
  finishedAt: string;
}

export async function loadVerificationReport(
  applicationId: string
): Promise<SavedReport | null> {
  const admin = createSupabaseAdminClient();
  const res = (await admin
    .from("verification_reports")
    .select(
      "run_id, report, lane_results, claims, trust_score, started_at, finished_at"
    )
    .eq("application_id", applicationId)
    .maybeSingle()) as unknown as {
    data: {
      run_id: string;
      report: VerificationReport;
      lane_results: LaneResult[];
      claims: ResumeClaims;
      trust_score: number;
      started_at: string;
      finished_at: string;
    } | null;
    error: unknown;
  };
  if (res.error || !res.data) return null;
  return {
    runId: res.data.run_id,
    report: res.data.report,
    laneResults: res.data.lane_results,
    claims: res.data.claims,
    trustScore: res.data.trust_score,
    startedAt: res.data.started_at,
    finishedAt: res.data.finished_at,
  };
}
