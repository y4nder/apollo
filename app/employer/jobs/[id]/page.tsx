import Link from "next/link";
import { redirect } from "next/navigation";
import { requireEmployer } from "../../../lib/auth";
import { createSupabaseAdminClient } from "../../../lib/supabase/admin";
import { EmployerShell } from "../../../components/employer/EmployerShell";
import { ScoreBar } from "../../../components/candidate/ScoreBar";

export const metadata = { title: "Apollo — Job applicants" };
export const dynamic = "force-dynamic";

type JobRow = {
  id: string;
  employer_id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  skills_required: Array<{ name: string; weight: 1 | 2; core: boolean }>;
};

type ApplicationRow = {
  id: string;
  status: string;
  match_score: number | null;
  created_at: string;
  resumes: {
    id: string;
    candidate_name: string;
    candidate_email: string;
    filename: string;
  } | null;
  verification_reports: { id: string; trust_score: number }[] | null;
};

export default async function JobApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireEmployer();
  const admin = createSupabaseAdminClient();

  const jobRes = (await admin
    .from("jobs")
    .select(
      "id, employer_id, slug, title, category, description, skills_required"
    )
    .eq("id", id)
    .single()) as unknown as { data: JobRow | null; error: unknown };
  if (jobRes.error || !jobRes.data) redirect("/employer");
  const job = jobRes.data;
  if (job.employer_id !== session.userId) redirect("/employer");

  const appsRes = (await admin
    .from("applications")
    .select(
      "id, status, match_score, created_at, resumes(id, candidate_name, candidate_email, filename), verification_reports(id, trust_score)"
    )
    .eq("job_id", id)
    .order("match_score", { ascending: false, nullsFirst: false })) as unknown as {
    data: ApplicationRow[] | null;
    error: unknown;
  };

  const applications = appsRes.data ?? [];
  const coreSkills = job.skills_required.filter((s) => s.core).map((s) => s.name);
  const niceSkills = job.skills_required.filter((s) => !s.core).map((s) => s.name);

  return (
    <EmployerShell
      session={session}
      breadcrumbs={[
        { label: "Jobs", href: "/employer" },
        { label: job.title },
      ]}
    >
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
            {job.category}
          </div>
          <h1 className="apollo-serif text-[32px] mt-1 text-apollo-ink leading-tight">
            {job.title}
          </h1>
          <p className="text-[13.5px] text-apollo-ink/75 mt-2 leading-relaxed max-w-2xl">
            {job.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-[11px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
            <span>
              {coreSkills.length > 0 ? (
                <>
                  Core ·{" "}
                  <span className="text-apollo-ink/80">
                    {coreSkills.join(", ")}
                  </span>
                </>
              ) : (
                "No core skills set"
              )}
            </span>
            {niceSkills.length > 0 && (
              <span>
                Nice ·{" "}
                <span className="text-apollo-ink/80">
                  {niceSkills.join(", ")}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="apollo-divider mb-5" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="apollo-serif text-[22px] text-apollo-ink">
            Applicants
          </h2>
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
            {applications.length}{" "}
            {applications.length === 1 ? "entry" : "entries"} · sorted by fit
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="apollo-card p-8 text-center">
            <p className="text-sm text-apollo-muted">
              No applicants yet. Share the candidate portal at{" "}
              <Link href="/" className="text-apollo-navy hover:underline">
                /
              </Link>{" "}
              to start receiving applications.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {applications.map((a) => {
              const report = a.verification_reports?.[0];
              return (
                <Link
                  key={a.id}
                  href={`/employer/applications/${a.id}`}
                  className="block apollo-card-strong px-5 py-4 hover:border-apollo-navy/40 transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] text-apollo-ink font-medium truncate">
                          {a.resumes?.candidate_name ?? "(name missing)"}
                        </h3>
                        <StatusBadge status={a.status} />
                      </div>
                      <div className="text-[11.5px] text-apollo-muted mt-0.5 truncate">
                        {a.resumes?.candidate_email ?? ""} ·{" "}
                        {a.resumes?.filename ?? ""}
                      </div>
                    </div>
                    <div className="shrink-0 w-40 hidden sm:block">
                      {a.match_score != null ? (
                        <ScoreBar score={a.match_score} compact />
                      ) : (
                        <span className="text-[11px] text-apollo-muted font-mono uppercase tracking-[0.2em]">
                          No match
                        </span>
                      )}
                    </div>
                    <div className="shrink-0 w-24 text-right">
                      {report ? (
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
                            Trust
                          </div>
                          <div className="apollo-serif text-[20px] text-apollo-navy tabular-nums leading-none mt-0.5">
                            {report.trust_score}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
                          Not verified
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </EmployerShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "verified"
      ? "bg-apollo-verify/10 border-apollo-verify/25 text-apollo-verify"
      : status === "verifying"
        ? "bg-apollo-navy/10 border-apollo-navy/25 text-apollo-navy"
        : status === "failed"
          ? "bg-apollo-contradict/10 border-apollo-contradict/25 text-apollo-contradict"
          : "bg-apollo-border/40 border-apollo-border text-apollo-muted";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9.5px] font-mono uppercase tracking-[0.18em] ${color}`}
    >
      {status}
    </span>
  );
}
