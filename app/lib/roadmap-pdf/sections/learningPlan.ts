import type jsPDF from "jspdf";
import {
  drawMutedNote,
  drawSectionHeading,
  setDraw,
  setText,
} from "../primitives";
import {
  COLORS,
  CONTENT_WIDTH,
  FAMILY,
  FONTS,
  PAGE,
  SPACING,
  TRACKING,
  ensureSpace,
} from "../style";
import type { RoadmapPdfInput } from "../types";

const MAX_GAPS = 8;
/** Horizontal indent for entry body (past the rank marker). */
const BODY_INDENT = 9;

/**
 * Priority Learning Plan — top N skills by leverage (how many jobs in the
 * dataset require them that the user lacks). Each entry shows the skill,
 * leverage sentence, difficulty + est. hours, and the first learning
 * resource from SKILL_META.
 *
 * rankGaps() in app/lib/skills/gaps.ts already produces the ordering and
 * attaches learning resources — we just render.
 */
export function renderLearningPlan(
  doc: jsPDF,
  input: RoadmapPdfInput,
  cursorY: number,
): number {
  let y = drawSectionHeading(doc, cursorY, "Priority Learning Plan");

  const gaps = input.gaps.slice(0, MAX_GAPS);

  if (gaps.length === 0) {
    y = drawMutedNote(
      doc,
      y,
      "No skill gaps detected — your skillset covers the required skills across every job in the dataset.",
    );
    return y + SPACING.afterSection;
  }

  const totalJobs = input.matches.length;

  gaps.forEach((gap, i) => {
    y = renderOneGap(doc, gap, i, totalJobs, y);
    if (i < gaps.length - 1) y = drawEntrySeparator(doc, y);
  });

  return y + SPACING.afterSection;
}

function renderOneGap(
  doc: jsPDF,
  gap: RoadmapPdfInput["gaps"][number],
  index: number,
  totalJobs: number,
  cursorY: number,
): number {
  // Reserve space for the whole entry block so it doesn't orphan.
  let y = ensureSpace(doc, cursorY, 20);

  // Rank marker — mono, muted
  doc.setFont(FAMILY.mono, "normal");
  doc.setFontSize(FONTS.eyebrow);
  setText(doc, COLORS.muted);
  doc.setCharSpace(TRACKING.caption);
  doc.text(String(index + 1).padStart(2, "0"), PAGE.marginX, y + 4);
  doc.setCharSpace(0);

  // Skill name — serif bold
  doc.setFont(FAMILY.serif, "bold");
  doc.setFontSize(FONTS.subheading + 1);
  setText(doc, COLORS.navy);
  doc.text(gap.skill, PAGE.marginX + BODY_INDENT, y + 4.2);

  // Right-aligned meta: difficulty · hours — mono
  doc.setFont(FAMILY.mono, "normal");
  doc.setFontSize(FONTS.eyebrow);
  setText(doc, COLORS.muted);
  doc.setCharSpace(TRACKING.caption);
  const metaRight = `${gap.difficulty.toUpperCase()}  ·  ~${gap.estimated_hours}H`;
  const metaWidth = doc.getTextWidth(metaRight);
  doc.text(metaRight, PAGE.marginX + CONTENT_WIDTH - metaWidth, y + 4);
  doc.setCharSpace(0);

  y += 6.5;

  // Leverage sentence — sans, ink-soft
  doc.setFont(FAMILY.sans, "normal");
  doc.setFontSize(FONTS.small);
  setText(doc, COLORS.inkSoft);
  doc.text(
    buildLeverageSentence(gap.leverage, totalJobs),
    PAGE.marginX + BODY_INDENT,
    y + 3,
  );
  y += 4.6;

  // Learning resource — verify-green, arrow as ASCII "->"
  const resource = gap.learning[0];
  const resourceText = resource
    ? `->  ${resource.title}  (${resource.platform})`
    : "->  Search online courses for this skill.";
  doc.setFont(FAMILY.sans, "normal");
  doc.setFontSize(FONTS.small);
  setText(doc, COLORS.verify);
  const resourceLines = doc.splitTextToSize(
    resourceText,
    CONTENT_WIDTH - BODY_INDENT,
  ) as string[];
  for (const line of resourceLines) {
    y = ensureSpace(doc, y, 4.5);
    doc.text(line, PAGE.marginX + BODY_INDENT, y + 3);
    y += 4.2;
  }

  return y;
}

function drawEntrySeparator(doc: jsPDF, cursorY: number): number {
  const y = cursorY + 1.5;
  setDraw(doc, COLORS.border);
  doc.setLineWidth(0.15);
  doc.line(PAGE.marginX + BODY_INDENT, y, PAGE.marginX + CONTENT_WIDTH, y);
  return y + 3;
}

function buildLeverageSentence(leverage: number, totalJobs: number): string {
  if (totalJobs === 0) {
    return `Required across ${leverage} job${leverage === 1 ? "" : "s"}.`;
  }
  return `Needed for ${leverage} of ${totalJobs} roles in this dataset.`;
}
