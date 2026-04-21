import Link from "next/link";
import { requireEmployer } from "../lib/auth";
import { createSupabaseAdminClient } from "../lib/supabase/admin";
import { EmployerShell } from "../components/employer/EmployerShell";

export const metadata = { title: "Apollo — Employer dashboard" };
export const dynamic = "force-dynamic";

type JobWithCounts = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  created_at: string;
  applicant_count: number;
  verified_count: number;
  top_score: number | null;
};

export default async function EmployerDashboardPage() {
  const session = await requireEmployer();
  const admin = createSupabaseAdminClient();

  const jobsRes = (await admin
    .from("jobs")
    .select(
      "id, slug, title, category, description, created_at, applications(id, status, match_score)"
    )
    .eq("employer_id", session.userId)
    .order("title", { ascending: true })) as unknown as {
    data:
      | Array<{
          id: string;
          slug: string;
          title: string;
          category: string;
          description: string;
          created_at: string;
          applications: Array<{
            id: string;
            status: string;
            match_score: number | null;
          }>;
        }>
      | null;
    error: unknown;
  };

  const jobs: JobWithCounts[] = (jobsRes.data ?? []).map((j) => {
    const apps = j.applications ?? [];
    const top = apps.reduce<number | null>(
      (acc, a) =>
        a.match_score == null ? acc : acc == null ? a.match_score : Math.max(acc, a.match_score),
      null
    );
    return {
      id: j.id,
      slug: j.slug,
      title: j.title,
      category: j.category,
      description: j.description,
      created_at: j.created_at,
      applicant_count: apps.length,
      verified_count: apps.filter((a) => a.status === "verified").length,
      top_score: top,
    };
  });

  const totalApplicants = jobs.reduce((a, j) => a + j.applicant_count, 0);
  const totalVerified = jobs.reduce((a, j) => a + j.verified_count, 0);

  return (
    <EmployerShell session={session}>
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
              Dashboard
            </div>
            <h1 className="apollo-serif text-[32px] mt-1 text-apollo-ink leading-tight">
              {session.employer.company_name}
            </h1>
          </div>
          <div className="flex items-center gap-5 text-[11px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
            <Stat label="Openings" value={jobs.length} />
            <span className="text-apollo-border-strong">·</span>
            <Stat label="Applicants" value={totalApplicants} />
            <span className="text-apollo-border-strong">·</span>
            <Stat label="Verified" value={totalVerified} />
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="apollo-card p-8 text-center">
            <p className="text-sm text-apollo-muted">
              No job postings yet. (The MVP seeds postings per employer — if you&apos;re seeing this, your account may not be wired to any.)
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {jobs.map((j) => (
              <Link
                key={j.id}
                href={`/employer/jobs/${j.id}`}
                className="apollo-card-strong p-5 hover:border-apollo-navy/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
                      {j.category}
                    </div>
                    <h2 className="apollo-serif text-[20px] mt-1 text-apollo-ink leading-tight">
                      {j.title}
                    </h2>
                    <p className="text-[12.5px] text-apollo-ink/70 mt-1.5 leading-relaxed line-clamp-2">
                      {j.description}
                    </p>
                  </div>
                  {j.top_score !== null && (
                    <div className="shrink-0 text-right">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
                        Top fit
                      </div>
                      <div className="apollo-serif text-[22px] text-apollo-navy tabular-nums leading-none mt-0.5">
                        {j.top_score}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-4 text-[10.5px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
                  <span>
                    {j.applicant_count}{" "}
                    {j.applicant_count === 1 ? "applicant" : "applicants"}
                  </span>
                  <span className="text-apollo-border-strong">·</span>
                  <span>{j.verified_count} verified</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </EmployerShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-apollo-ink tabular-nums">{value}</span>
      <span>{label}</span>
    </span>
  );
}
