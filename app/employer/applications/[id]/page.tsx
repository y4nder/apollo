import Link from "next/link";
import { authorizeApplicationAccess } from "../../../lib/auth";
import { createSupabaseAdminClient } from "../../../lib/supabase/admin";
import { loadVerificationReport } from "../../../lib/reports/load";
import { EmployerShell } from "../../../components/employer/EmployerShell";
import { ApplicationMatchPanel } from "../../../components/employer/ApplicationMatchPanel";
import { EmployerApplicationShell } from "../../../components/employer/EmployerApplicationShell";
import type { MatchResult } from "../../../lib/skills/types";

export const metadata = { title: "Apollo — Application" };
export const dynamic = "force-dynamic";

type ResumeRow = {
  id: string;
  storage_path: string;
  filename: string;
  bytes: number;
  extracted_skills: unknown;
  candidate_name: string;
  candidate_email: string;
  created_at: string;
};

const SIGNED_URL_SECONDS = 60 * 10; // 10 min

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, application, job } = await authorizeApplicationAccess(id);

  const admin = createSupabaseAdminClient();

  const resumeRes = (await admin
    .from("resumes")
    .select(
      "id, storage_path, filename, bytes, extracted_skills, candidate_name, candidate_email, created_at"
    )
    .eq("id", application.resume_id)
    .single()) as unknown as { data: ResumeRow | null; error: unknown };
  const resume = resumeRes.data;

  const signedUrlRes = resume
    ? await admin.storage
        .from("resumes")
        .createSignedUrl(resume.storage_path, SIGNED_URL_SECONDS)
    : null;
  const signedUrl = signedUrlRes?.data?.signedUrl ?? null;

  const match = application.match_snapshot as MatchResult | null;
  const saved = await loadVerificationReport(application.id);
  const initial = saved
    ? {
        runId: saved.runId,
        claims: saved.claims,
        laneResults: saved.laneResults,
        report: saved.report,
        trustScore: saved.trustScore,
        startedAt: saved.startedAt,
        finishedAt: saved.finishedAt,
        filename: resume?.filename,
      }
    : undefined;

  return (
    <EmployerShell
      session={session}
      breadcrumbs={[
        { label: "Jobs", href: "/employer" },
        { label: job.title, href: `/employer/jobs/${job.id}` },
        { label: resume?.candidate_name ?? "Application" },
      ]}
    >
      <main className="flex-1 max-w-[1300px] w-full mx-auto px-6 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
              Application
            </div>
            <h1 className="apollo-serif text-[32px] mt-1 text-apollo-ink leading-tight">
              {resume?.candidate_name ?? "(name missing)"}
            </h1>
            <div className="mt-1 text-[12.5px] text-apollo-muted">
              {resume?.candidate_email ?? ""} · applied for{" "}
              <Link
                href={`/employer/jobs/${job.id}`}
                className="text-apollo-navy hover:underline"
              >
                {job.title}
              </Link>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
              Status
            </div>
            <div className="text-[13px] text-apollo-ink font-medium mt-0.5">
              {application.status}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-5">
            <div className="apollo-card-strong overflow-hidden">
              <div className="px-5 py-3 border-b border-apollo-border bg-apollo-paper/40 flex items-center justify-between">
                <span className="text-[10.5px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
                  Resume · {resume?.filename ?? ""}
                </span>
                {signedUrl && (
                  <a
                    href={signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-apollo-navy hover:underline"
                  >
                    Open ↗
                  </a>
                )}
              </div>
              {signedUrl ? (
                <iframe
                  src={signedUrl}
                  title="Resume preview"
                  className="w-full h-[560px] bg-apollo-paper"
                />
              ) : (
                <div className="p-8 text-center text-sm text-apollo-muted">
                  Could not load the resume PDF.
                </div>
              )}
            </div>
            <EmployerApplicationShell
              applicationId={application.id}
              candidateName={resume?.candidate_name ?? "this candidate"}
              jobTitle={job.title}
              company={session.employer.company_name}
              initial={initial}
            />
          </section>
          <aside>
            {match ? (
              <ApplicationMatchPanel match={match} />
            ) : (
              <div className="apollo-card p-5 text-sm text-apollo-muted">
                No cached match for this application.
              </div>
            )}
          </aside>
        </div>
      </main>
    </EmployerShell>
  );
}
