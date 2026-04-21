import { NextResponse } from "next/server";
import { extractSkills } from "../../lib/skills/extract";
import { extractTextFromPdf, PdfParseError } from "../../lib/skills/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

const MIN_TEXT = 50;
const MAX_TEXT = 20_000;

export async function POST(req: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  const contentType = req.headers.get("content-type") ?? "";

  let resumeText: string;
  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Missing 'file' in form data" },
          { status: 400 }
        );
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      resumeText = await extractTextFromPdf(bytes);
    } else {
      const body = (await req.json()) as { resume_text?: string };
      if (typeof body.resume_text !== "string") {
        return NextResponse.json(
          { error: "Missing 'resume_text' string" },
          { status: 400 }
        );
      }
      resumeText = body.resume_text.trim();
    }
  } catch (err) {
    if (err instanceof PdfParseError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Could not read request body" },
      { status: 400 }
    );
  }

  if (resumeText.length < MIN_TEXT) {
    return NextResponse.json(
      { error: `Resume text is too short (min ${MIN_TEXT} chars).` },
      { status: 400 }
    );
  }
  if (resumeText.length > MAX_TEXT) {
    resumeText = resumeText.slice(0, MAX_TEXT);
  }

  try {
    const result = await extractSkills(resumeText);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Skill extraction failed: ${message}` },
      { status: 500 }
    );
  }
}
