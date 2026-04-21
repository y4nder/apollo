import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import { extractTextFromPdf, PdfParseError } from "../../lib/skills/pdf";
import { extractSkills } from "../../lib/skills/extract";
import { matchJob } from "../../lib/skills/matcher";
import type { Job } from "../../lib/skills/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_MAX_PDF_BYTES = 5 * 1024 * 1024;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 }
    );
  }

  const jobId = form.get("jobId");
  const candidateName = form.get("candidateName");
  const candidateEmail = form.get("candidateEmail");
  const file = form.get("file");

  if (typeof jobId !== "string" || !jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }
  if (typeof candidateName !== "string" || candidateName.trim().length < 2) {
    return NextResponse.json(
      { error: "Missing or too-short name" },
      { status: 400 }
    );
  }
  if (typeof candidateEmail !== "string" || !isValidEmail(candidateEmail)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing resume file" }, { status: 400 });
  }
  if (
    file.type &&
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    return NextResponse.json(
      { error: "Only PDF resumes are supported" },
      { status: 415 }
    );
  }
  const maxBytes = Number(
    process.env.APOLLO_MAX_PDF_BYTES ?? DEFAULT_MAX_PDF_BYTES
  );
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `PDF exceeds ${Math.round(maxBytes / 1024 / 1024)} MB limit` },
      { status: 413 }
    );
  }

  const admin = createSupabaseAdminClient();

  const jobRes = (await admin
    .from("jobs")
    .select("id, slug, title, category, description, skills_required")
    .eq("id", jobId)
    .single()) as unknown as { data: Job | null; error: unknown };
  if (jobRes.error || !jobRes.data) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  const job = jobRes.data;

  const original = new Uint8Array(await file.arrayBuffer());
  // unpdf/pdfjs detaches the ArrayBuffer during parsing — hold a copy for upload.
  const uploadBytes = new Uint8Array(original);

  let text: string;
  try {
    text = await extractTextFromPdf(original);
  } catch (err) {
    if (err instanceof PdfParseError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "PDF parse failed" }, { status: 400 });
  }
  const clippedText = text.slice(0, 20_000);

  let extracted;
  try {
    extracted = await extractSkills(clippedText);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Skill extraction failed: ${msg}` },
      { status: 500 }
    );
  }

  const userSkills = extracted.skills.map((s) => s.name);
  const match = matchJob(userSkills, job);

  const resumeId = crypto.randomUUID();
  const storagePath = `resumes/${resumeId}.pdf`;

  const { error: uploadErr } = await admin.storage
    .from("resumes")
    .upload(storagePath, uploadBytes, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (uploadErr) {
    return NextResponse.json(
      { error: `Storage upload failed: ${uploadErr.message}` },
      { status: 500 }
    );
  }

  const { error: resumeErr } = await admin.from("resumes").insert({
    id: resumeId,
    storage_path: storagePath,
    filename: file.name,
    bytes: file.size,
    extracted_text: clippedText,
    extracted_skills: extracted.skills,
    candidate_name: candidateName.trim(),
    candidate_email: candidateEmail.trim().toLowerCase(),
  });
  if (resumeErr) {
    await admin.storage.from("resumes").remove([storagePath]);
    return NextResponse.json(
      { error: `Saving resume failed: ${resumeErr.message}` },
      { status: 500 }
    );
  }

  const appInsert = (await admin
    .from("applications")
    .insert({
      resume_id: resumeId,
      job_id: job.id,
      status: "submitted",
      match_score: match.score,
      match_snapshot: match,
    })
    .select("id")
    .single()) as unknown as {
    data: { id: string } | null;
    error: { code?: string; message: string } | null;
  };
  if (appInsert.error || !appInsert.data) {
    if (appInsert.error?.code === "23505") {
      return NextResponse.json(
        { error: "You've already applied to this job with this resume." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: `Application insert failed: ${appInsert.error?.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    applicationId: appInsert.data.id,
    match: { score: match.score },
  });
}
