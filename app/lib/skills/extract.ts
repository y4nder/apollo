import "server-only";
import { z } from "zod";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { CANONICAL_SKILLS, snapToCanonical } from "./taxonomy";
import type { ExtractedSkill, ExtractionResult } from "./types";

const MODEL = () => process.env.APOLLO_SKILLS_MODEL ?? "claude-haiku-4-5";

const SkillRow = z.object({
  name: z.string().describe("Exact canonical skill name from the provided list."),
  evidence: z
    .string()
    .describe("Short quote from the resume that demonstrates this skill."),
  confidence: z.enum(["high", "medium", "low"]),
});

const ExtractionSchema = z.object({
  skills: z.array(SkillRow),
});

function buildPrompt(resumeText: string): string {
  const canonicalList = CANONICAL_SKILLS.join(", ");
  return `You are extracting skills from a resume.

RULES:
1. Only include skills the person demonstrably has — skills they claim to have
   used or worked with. Do not include skills they only mentioned wanting to
   learn, classes taken without applying, or tools heard of in passing.
2. For each skill, cite the exact phrase from the resume as evidence.
3. Confidence:
   - "high": multiple mentions, specific projects, years of experience stated.
   - "medium": one clear mention in a work context.
   - "low": passing mention, implied but not explicit.
4. Use ONLY names from the canonical list below. Map aliases (e.g. "JS" →
   "JavaScript"). Drop anything not in the list.

CANONICAL SKILLS: ${canonicalList}

RESUME:
${resumeText}`;
}

export async function extractSkills(
  resumeText: string
): Promise<ExtractionResult> {
  const { object } = await generateObject({
    model: anthropic(MODEL()),
    schema: ExtractionSchema,
    prompt: buildPrompt(resumeText),
    temperature: 0,
  });

  const out: ExtractedSkill[] = [];
  const seen = new Set<string>();
  for (const row of object.skills) {
    const canonical = snapToCanonical(row.name);
    if (!canonical) continue;
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    out.push({
      name: canonical,
      evidence: row.evidence.trim(),
      confidence: row.confidence,
    });
  }

  return { skills: out, raw_text_length: resumeText.length };
}
