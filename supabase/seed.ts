// Seed script: creates 3 employer auth users + employers rows + 15 jobs.
// Run with: bun run seed
//
// Requires env vars:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Idempotent: re-running is safe.

import { createClient } from "@supabase/supabase-js";
import { JOBS } from "../app/lib/skills/jobs";
import type { Job } from "../app/lib/skills/types";

type EmployerSeed = {
  email: string;
  password: string;
  company_name: string;
  contact_name: string;
  slug: string;
  jobSlugs: string[];
};

const EMPLOYERS: EmployerSeed[] = [
  {
    email: "northwind@apollo.test",
    password: "ApolloDemo1!",
    company_name: "Northwind Data Co.",
    contact_name: "Eleanor Voss",
    slug: "northwind",
    jobSlugs: [
      "data-analyst",
      "data-scientist",
      "business-analyst",
      "project-manager",
      "customer-success-manager",
    ],
  },
  {
    email: "prism@apollo.test",
    password: "ApolloDemo2!",
    company_name: "Prism Engineering",
    contact_name: "Milo Tanaka",
    slug: "prism",
    jobSlugs: [
      "backend-engineer",
      "frontend-engineer",
      "full-stack-engineer",
      "qa-engineer",
      "ux-designer",
    ],
  },
  {
    email: "vantage@apollo.test",
    password: "ApolloDemo3!",
    company_name: "Vantage Studios",
    contact_name: "Ari Solano",
    slug: "vantage",
    jobSlugs: [
      "graphic-designer",
      "seo-specialist",
      "content-marketer",
      "copywriter",
      "virtual-assistant",
    ],
  },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env."
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function findJob(slug: string): Job {
  const j = JOBS.find((j) => j.id === slug);
  if (!j) throw new Error(`Job not found in JOBS: ${slug}`);
  return j;
}

async function upsertEmployer(seed: EmployerSeed) {
  // Find existing auth user by email via admin listUsers (paged).
  let existingId: string | null = null;
  for (let page = 1; page < 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 50 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email === seed.email);
    if (hit) {
      existingId = hit.id;
      break;
    }
    if (data.users.length < 50) break;
  }

  let userId: string;
  if (existingId) {
    userId = existingId;
    // Reset password so the demo creds always match.
    await admin.auth.admin.updateUserById(userId, {
      password: seed.password,
      email_confirm: true,
    });
    console.log(`  ↻ auth user exists: ${seed.email} (${userId})`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: seed.email,
      password: seed.password,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user!.id;
    console.log(`  + auth user created: ${seed.email} (${userId})`);
  }

  // Upsert employer row (PK is user id).
  const { error: empErr } = await admin
    .from("employers")
    .upsert(
      {
        id: userId,
        company_name: seed.company_name,
        contact_name: seed.contact_name,
        slug: seed.slug,
      },
      { onConflict: "id" }
    );
  if (empErr) throw empErr;
  console.log(`  ↳ employer row upserted: ${seed.company_name}`);

  // Upsert jobs for this employer.
  for (const slug of seed.jobSlugs) {
    const job = findJob(slug);
    const { error: jobErr } = await admin.from("jobs").upsert(
      {
        employer_id: userId,
        slug: job.id,
        title: job.title,
        category: job.category,
        description: job.description,
        skills_required: job.skills_required,
      },
      { onConflict: "employer_id,slug" }
    );
    if (jobErr) throw jobErr;
  }
  console.log(
    `  ↳ ${seed.jobSlugs.length} jobs upserted for ${seed.company_name}`
  );
}

async function main() {
  console.log("Seeding employers + jobs…");
  for (const seed of EMPLOYERS) {
    console.log(`\n[${seed.company_name}]`);
    await upsertEmployer(seed);
  }
  console.log("\n✓ Seed complete.");
  console.log("\nDemo credentials:");
  for (const e of EMPLOYERS) {
    console.log(`  ${e.email}  /  ${e.password}`);
  }
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
