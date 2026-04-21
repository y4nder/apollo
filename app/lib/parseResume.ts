import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { ResumeClaims } from "./schemas";

const SYSTEM_PROMPT =
  "You extract structured hiring-verification data from resume PDFs. " +
  "Return every field the schema requires. " +
  "If a field is absent from the resume, still include its key with an empty array or null as appropriate. " +
  "`rawText` must contain the full textual content of the resume as a single string (newlines preserved), " +
  "so downstream agents can search it verbatim. " +
  "Do not invent employers, schools, handles, or URLs — if ambiguous, leave them out.";

const USER_PROMPT =
  "Extract the candidate's hiring claims from this resume. " +
  "Populate every required field. Put the full text of the resume into `rawText`.";

export async function parseResume(file: File): Promise<ResumeClaims> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { object } = await generateObject({
    model: anthropic(process.env.APOLLO_MODEL ?? "claude-haiku-4-5"),
    schema: ResumeClaims,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          { type: "file", data: bytes, mediaType: "application/pdf", filename: file.name },
          { type: "text", text: USER_PROMPT },
        ],
      },
    ],
  });

  return object;
}
