import type jsPDF from "jspdf";
import { drawMutedNote, drawPillRow, drawSectionHeading } from "../primitives";
import { COLORS, SPACING } from "../style";
import type { RoadmapPdfInput } from "../types";

/**
 * "Your Skills" — wrapped pill list of every canonical skill extracted
 * from the resume. Outlined pills read cleanly in grayscale print; the
 * border color carries a subtle confidence signal (high = navy,
 * medium = ink-soft, low = border gray) but shape alone is enough.
 */
export function renderSkills(
  doc: jsPDF,
  input: RoadmapPdfInput,
  cursorY: number,
): number {
  let y = drawSectionHeading(doc, cursorY, "Your Skills");

  if (input.extractedSkills.length === 0) {
    y = drawMutedNote(
      doc,
      y,
      "No skills detected — consider adding more detail to your resume.",
    );
    return y + SPACING.afterSection;
  }

  const pills = input.extractedSkills.map((skill) => ({
    text: skill.name,
    style: {
      color:
        skill.confidence === "high"
          ? COLORS.navy
          : skill.confidence === "medium"
            ? COLORS.inkSoft
            : COLORS.borderStrong,
      filled: false,
    },
  }));

  y = drawPillRow(doc, y, pills);
  return y + SPACING.afterSection;
}
