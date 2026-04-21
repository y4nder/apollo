import type jsPDF from "jspdf";
import { setDraw, setText } from "../primitives";
import { COLORS, FAMILY, FONTS, PAGE, SPACING, TRACKING } from "../style";
import type { RoadmapPdfInput } from "../types";

/**
 * Title block at the top of page 1: product lockup, serif title, accent
 * rule, and a meta line (generation date · filename).
 *
 * Typographic voice mirrors the app:
 *   - Lockup + meta  → mono, wide tracking (like Geist Mono eyebrows)
 *   - Title          → serif bold (like .apollo-serif headings)
 */
export function renderHeader(
  doc: jsPDF,
  input: RoadmapPdfInput,
  cursorY: number,
): number {
  const generatedAt = input.generatedAt ?? new Date();
  let y = cursorY;

  // Eyebrow lockup: APOLLO · CAREER ROADMAP
  doc.setFont(FAMILY.mono, "normal");
  doc.setFontSize(FONTS.eyebrow);
  setText(doc, COLORS.muted);
  doc.setCharSpace(TRACKING.eyebrow);
  doc.text("APOLLO  ·  CAREER ROADMAP", PAGE.marginX, y + 3);
  doc.setCharSpace(0);
  y += 7;

  // Main title — serif, tight, navy
  doc.setFont(FAMILY.serif, "bold");
  doc.setFontSize(FONTS.title);
  setText(doc, COLORS.navy);
  doc.text("Your Career Roadmap", PAGE.marginX, y + 9);
  y += 13;

  // Accent rule beneath the title — verify green
  setDraw(doc, COLORS.verify);
  doc.setLineWidth(1.3);
  doc.line(PAGE.marginX, y, PAGE.marginX + 28, y);
  y += 5;

  // Meta line: generation date · filename
  const formattedDate = generatedAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const metaParts = [`Generated on ${formattedDate}`];
  if (input.resumeFilename) metaParts.push(input.resumeFilename);

  doc.setFont(FAMILY.sans, "normal");
  doc.setFontSize(FONTS.body);
  setText(doc, COLORS.inkSoft);
  doc.text(metaParts.join("  ·  "), PAGE.marginX, y + 4);
  y += 6;

  return y + SPACING.afterHeader;
}
