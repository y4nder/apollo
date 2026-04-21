import type jsPDF from "jspdf";
import {
  drawLabeledPillRow,
  drawMutedNote,
  drawSectionHeading,
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
  type RGB,
} from "../style";
import type { RoadmapPdfInput } from "../types";

type Match = RoadmapPdfInput["matches"][number];

/**
 * Top 3 job matches. For each: rank + title + prominent match %, matched
 * skills (filled verify-green pills), missing core (contradict-red outline
 * with "+" glyph), missing nice-to-have (flag-amber outline with "+").
 *
 * The filled-vs-outlined shape distinguishes matched from missing without
 * relying on color — print-accessibility-safe. No Unicode glyphs: jsPDF's
 * built-in Helvetica is WinAnsi-encoded and would mis-measure them.
 *
 * If fewer than 3 matches exist, render what's available.
 */
export function renderTopMatches(
  doc: jsPDF,
  input: RoadmapPdfInput,
  cursorY: number,
): number {
  let y = drawSectionHeading(doc, cursorY, "Top Job Matches");

  const top = input.matches.slice(0, 3);
  if (top.length === 0) {
    y = drawMutedNote(doc, y, "No matches to display.");
    return y + SPACING.afterSection;
  }

  for (let i = 0; i < top.length; i++) {
    y = renderOneMatch(doc, top[i], i + 1, y);
    if (i < top.length - 1) y += 5;
  }

  return y + SPACING.afterSection;
}

function renderOneMatch(
  doc: jsPDF,
  match: Match,
  rank: number,
  cursorY: number,
): number {
  // Keep the title row + score together on one page.
  let y = ensureSpace(doc, cursorY, 24);

  // Rank marker — mono, muted
  doc.setFont(FAMILY.mono, "normal");
  doc.setFontSize(FONTS.eyebrow);
  setText(doc, COLORS.muted);
  doc.setCharSpace(TRACKING.caption);
  doc.text(`#${rank}`, PAGE.marginX, y + 5);
  doc.setCharSpace(0);

  // Title — serif, tight
  doc.setFont(FAMILY.serif, "bold");
  doc.setFontSize(FONTS.subheading + 2);
  setText(doc, COLORS.navy);
  const titleLines = doc.splitTextToSize(
    match.job.title,
    CONTENT_WIDTH - 34,
  ) as string[];
  doc.text(titleLines[0] ?? match.job.title, PAGE.marginX + 10, y + 5);

  // Score — large, accent
  const scoreText = `${match.score}%`;
  doc.setFont(FAMILY.sans, "bold");
  doc.setFontSize(FONTS.scoreLarge);
  setText(doc, scoreColorFor(match.score));
  const scoreWidth = doc.getTextWidth(scoreText);
  doc.text(scoreText, PAGE.marginX + CONTENT_WIDTH - scoreWidth, y + 7);

  // "MATCH" caption under the score
  doc.setFont(FAMILY.mono, "normal");
  doc.setFontSize(FONTS.eyebrow);
  setText(doc, COLORS.muted);
  doc.setCharSpace(TRACKING.eyebrow);
  const captionText = "MATCH";
  const captionWidth = doc.getTextWidth(captionText);
  doc.text(captionText, PAGE.marginX + CONTENT_WIDTH - captionWidth, y + 11);
  doc.setCharSpace(0);

  y += 13;

  // Overflow title lines
  if (titleLines.length > 1) {
    doc.setFont(FAMILY.serif, "bold");
    doc.setFontSize(FONTS.subheading + 2);
    setText(doc, COLORS.navy);
    for (let i = 1; i < titleLines.length; i++) {
      doc.text(titleLines[i], PAGE.marginX + 10, y + 4);
      y += 5.5;
    }
  }

  // Matched — filled verify-green pills (shape communicates match)
  if (match.matched.length > 0) {
    y = drawLabeledPillRow(
      doc,
      y,
      "Matched",
      match.matched.map((s) => ({
        text: s,
        style: { color: COLORS.verify, filled: true },
      })),
    );
    y += 1.5;
  }

  // Missing core — contradict-red outline with "+" glyph
  if (match.missing_core.length > 0) {
    y = drawLabeledPillRow(
      doc,
      y,
      "Missing — core",
      match.missing_core.map((s) => ({
        text: s,
        style: { color: COLORS.contradict, filled: false, glyph: "+" },
      })),
    );
    y += 1.5;
  }

  // Missing nice-to-have — flag-amber outline with "+" glyph
  if (match.missing_nice.length > 0) {
    y = drawLabeledPillRow(
      doc,
      y,
      "Missing — nice to have",
      match.missing_nice.map((s) => ({
        text: s,
        style: { color: COLORS.flag, filled: false, glyph: "+" },
      })),
    );
    y += 1.5;
  }

  if (match.breakdown.capped_by_missing_core) {
    y = ensureSpace(doc, y, 6);
    doc.setFont(FAMILY.sans, "italic");
    doc.setFontSize(FONTS.footer);
    setText(doc, COLORS.muted);
    doc.text(
      "Score capped at 60% because a core skill is missing.",
      PAGE.marginX,
      y + 3.5,
    );
    y += 5;
  }

  return y + SPACING.afterSubsection;
}

function scoreColorFor(score: number): RGB {
  if (score >= 70) return COLORS.verify;
  if (score >= 40) return COLORS.navy;
  return COLORS.flag;
}
