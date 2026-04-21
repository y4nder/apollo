import type jsPDF from "jspdf";
import { drawSectionHeading, setDraw, setText } from "../primitives";
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

/**
 * Summary snapshot — a 2×2 stat grid with mono eyebrow labels and
 * serif-display values, followed by a one-line italic takeaway.
 */
export function renderSummary(
  doc: jsPDF,
  input: RoadmapPdfInput,
  cursorY: number,
): number {
  let y = drawSectionHeading(doc, cursorY, "Summary Snapshot");

  const best = input.matches[0];
  const strongMatches = input.matches.filter((m) => m.score >= 70).length;

  const cellW = CONTENT_WIDTH / 2;
  const cellH = 18;
  const gridTop = y;

  y = ensureSpace(doc, y, cellH * 2 + 12);

  const stats: Array<{ label: string; value: string; accent?: boolean }> = [
    { label: "Skills extracted", value: String(input.extractedSkills.length) },
    { label: "Jobs analysed", value: String(input.matches.length) },
    {
      label: "Best match",
      value: best ? `${truncate(best.job.title, 22)} · ${best.score}%` : "—",
      accent: true,
    },
    { label: "Strong fits (70%+)", value: String(strongMatches) },
  ];

  stats.forEach((stat, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = PAGE.marginX + col * cellW;
    const cy = gridTop + row * cellH;

    // cell border
    setDraw(doc, COLORS.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, cy, cellW - 2, cellH - 2, 1.4, 1.4, "D");

    // eyebrow label — mono, tracked
    doc.setFont(FAMILY.mono, "normal");
    doc.setFontSize(FONTS.eyebrow);
    setText(doc, COLORS.muted);
    doc.setCharSpace(TRACKING.eyebrow);
    doc.text(stat.label.toUpperCase(), x + 3.2, cy + 5);
    doc.setCharSpace(0);

    // value — serif display
    doc.setFont(FAMILY.serif, "bold");
    doc.setFontSize(stat.accent ? 15 : 14);
    setText(doc, stat.accent ? COLORS.verify : COLORS.navy);
    doc.text(stat.value, x + 3.2, cy + 13);
  });

  y = gridTop + cellH * 2 + 3;

  // One-line takeaway — italic serif
  const takeaway = buildTakeaway(input);
  y = ensureSpace(doc, y, 8);
  doc.setFont(FAMILY.serif, "italic");
  doc.setFontSize(FONTS.body + 0.5);
  setText(doc, COLORS.inkSoft);
  const lines = doc.splitTextToSize(takeaway, CONTENT_WIDTH) as string[];
  for (const line of lines) {
    doc.text(line, PAGE.marginX, y + 4);
    y += 4.8;
  }

  return y + SPACING.afterSection;
}

function buildTakeaway(input: RoadmapPdfInput): string {
  const total = input.matches.length;
  if (total === 0) {
    return "No job matches in this dataset yet. Extract more skills from your resume or revisit with broader experience to unlock stronger fits.";
  }
  const strong = input.matches.filter((m) => m.score >= 70).length;
  const topGaps = input.gaps.slice(0, 4).length;
  const best = input.matches[0];
  return `You match ${strong} of ${total} roles at 70%+ and have ${topGaps} high-leverage skill gap${topGaps === 1 ? "" : "s"} to close. Your strongest fit is ${best.job.title} at ${best.score}%.`;
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}
