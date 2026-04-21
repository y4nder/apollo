import "server-only";
import { createSupabaseAdminClient } from "../supabase/admin";
import type { LaneResult, ResumeClaims, VerificationReport } from "../schemas";

export interface SaveReportArgs {
  applicationId: string;
  runId: string;
  report: VerificationReport;
  laneResults: LaneResult[];
  claims: ResumeClaims;
  trustScore: number;
  startedAt: number;
  finishedAt: number;
}

export async function saveVerificationReport(args: SaveReportArgs): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("verification_reports").upsert(
    {
      application_id: args.applicationId,
      run_id: args.runId,
      report: args.report,
      lane_results: args.laneResults,
      claims: args.claims,
      trust_score: Math.round(args.trustScore),
      started_at: new Date(args.startedAt).toISOString(),
      finished_at: new Date(args.finishedAt).toISOString(),
    },
    { onConflict: "application_id" }
  );
  if (error) {
    throw new Error(`verification_reports upsert failed: ${error.message}`);
  }
}

export async function setApplicationStatus(
  applicationId: string,
  status: "submitted" | "verifying" | "verified" | "failed"
): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("applications")
    .update({ status })
    .eq("id", applicationId);
  if (error) {
    throw new Error(`applications.status update failed: ${error.message}`);
  }
}
