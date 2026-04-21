import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";
import { createSupabaseAdminClient } from "./supabase/admin";

export type EmployerSession = {
  userId: string;
  email: string;
  employer: {
    id: string;
    company_name: string;
    contact_name: string | null;
    slug: string;
  };
};

export async function requireEmployer(): Promise<EmployerSession> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/employer/login");

  const { data: employer, error: empErr } = await supabase
    .from("employers")
    .select("id, company_name, contact_name, slug")
    .eq("id", user.id)
    .single();
  if (empErr || !employer) redirect("/employer/login");

  return {
    userId: user.id,
    email: user.email!,
    employer: employer as EmployerSession["employer"],
  };
}

export async function getEmployerOrNull(): Promise<EmployerSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: employer } = await supabase
    .from("employers")
    .select("id, company_name, contact_name, slug")
    .eq("id", user.id)
    .single();
  if (!employer) return null;
  return {
    userId: user.id,
    email: user.email!,
    employer: employer as EmployerSession["employer"],
  };
}

// Verifies the caller (must be authenticated employer) owns the application's job.
// Uses the admin client to read across RLS but still enforces the join check.
export type ApplicationRow = {
  id: string;
  resume_id: string;
  job_id: string;
  status: string;
  match_score: number | null;
  match_snapshot: unknown;
};

export type JobRow = {
  id: string;
  employer_id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  skills_required: Array<{ name: string; weight: 1 | 2; core: boolean }>;
};

export async function authorizeApplicationAccess(applicationId: string): Promise<{
  session: EmployerSession;
  application: ApplicationRow;
  job: JobRow;
}> {
  const session = await requireEmployer();
  const admin = createSupabaseAdminClient();

  const appRaw = (await admin
    .from("applications")
    .select("id, resume_id, job_id, status, match_score, match_snapshot")
    .eq("id", applicationId)
    .single()) as { data: ApplicationRow | null; error: unknown };
  if (appRaw.error || !appRaw.data) redirect("/employer");
  const application = appRaw.data;

  const jobRaw = (await admin
    .from("jobs")
    .select("id, employer_id, slug, title, category, description, skills_required")
    .eq("id", application.job_id)
    .single()) as { data: JobRow | null; error: unknown };
  if (jobRaw.error || !jobRaw.data) redirect("/employer");
  const job = jobRaw.data;

  if (job.employer_id !== session.userId) redirect("/employer");

  return { session, application, job };
}
