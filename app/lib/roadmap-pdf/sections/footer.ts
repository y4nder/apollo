import type jsPDF from "jspdf";
import { setDraw, setText } from "../primitives";
import { COLORS, FAMILY, FONTS, PAGE, TRACKING } from "../style";
import type { RoadmapPdfInput } from "../types";

/**
 * Stamp a footer on every page: app + timestamp on the left, page count
 * on the right. Called once *after* all content is drawn so we know the
 * final page total. Uses mono + wide tracking to match UI eyebrows.
 */
export function renderFooters(doc: jsPDF, input: RoadmapPdfInput): void {
  const generatedAt = input.generatedAt ?? new Date();
  const timestamp = generatedAt.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const pageCount = doc.getNumberOfPages();
  const footerY = PAGE.height - PAGE.marginY + 6;

  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);

    // Thin divider above the footer
    setDraw(doc, COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(
      PAGE.marginX,
      footerY - 4,
      PAGE.width - PAGE.marginX,
      footerY - 4,
    );

    // Left: APOLLO · timestamp  — Right: PAGE X OF Y
    doc.setFont(FAMILY.mono, "normal");
    doc.setFontSize(FONTS.footer);
    setText(doc, COLORS.muted);
    doc.setCharSpace(TRACKING.caption);
    doc.text(`APOLLO  ·  ${timestamp.toUpperCase()}`, PAGE.marginX, footerY);
    const pageLabel = `PAGE ${p} OF ${pageCount}`;
    const labelWidth = doc.getTextWidth(pageLabel);
    doc.text(pageLabel, PAGE.width - PAGE.marginX - labelWidth, footerY);
    doc.setCharSpace(0);
  }
}
