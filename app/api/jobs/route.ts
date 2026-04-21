import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import type { Job } from "../../lib/skills/types";

export const runtime = "nodejs";

type JobRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  skills_required: Job["skills_required"];
  employer_id: string;
  employers: { company_name: string; slug: string } | null;
};

export async function GET() {
  const admin = createSupabaseAdminClient();
  const res = (await admin
    .from("jobs")
    .select(
      "id, slug, title, category, description, skills_required, employer_id, employers(company_name, slug)"
    )
    .order("title", { ascending: true })) as unknown as {
    data: JobRow[] | null;
    error: unknown;
  };
  if (res.error || !res.data) {
    return NextResponse.json(
      { error: "Failed to load jobs" },
      { status: 500 }
    );
  }

  const jobs = res.data.map((j) => ({
    id: j.id,
    slug: j.slug,
    title: j.title,
    category: j.category as Job["category"],
    description: j.description,
    skills_required: j.skills_required,
    employer: {
      id: j.employer_id,
      company_name: j.employers?.company_name ?? "",
      slug: j.employers?.slug ?? "",
    },
  }));

  return NextResponse.json({ jobs });
}
