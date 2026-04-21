// Low-level drawing helpers shared across sections.
// Keep these free of domain knowledge — they just draw shapes and text.
//
// Typographic convention, mirroring the app's voice (see app/globals.css):
//   - Titles & section headings  → FAMILY.serif  (Times, like .apollo-serif)
//   - Eyebrows & small labels    → FAMILY.mono   (Courier, like Geist Mono)
//   - Body, values, pills        → FAMILY.sans   (Helvetica, like Geist Sans)

import type jsPDF from "jspdf";
import {
  COLORS,
  CONTENT_WIDTH,
  FAMILY,
  FONTS,
  PAGE,
  SPACING,
  TRACKING,
  type RGB,
  ensureSpace,
} from "./style";

// ---------------------------------------------------------------------------
// Color helpers — jsPDF's setXColor takes three separate channel arguments
// (or a hex string in some versions). Wrapping the 3-arg spread once keeps
// section code readable and lint-quiet.
// ---------------------------------------------------------------------------

export function setText(doc: jsPDF, rgb: RGB): void {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

export function setFill(doc: jsPDF, rgb: RGB): void {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

export function setDraw(doc: jsPDF, rgb: RGB): void {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

// ---------------------------------------------------------------------------
// Pills
// ---------------------------------------------------------------------------

export interface PillStyle {
  /** Pill color. Used for border always, and fill when filled=true. */
  color: RGB;
  /** Solid fill with white text, vs. outline with colored text. */
  filled: boolean;
  /**
   * Optional leading glyph. Must be ASCII-safe — jsPDF's built-in
   * Helvetica is WinAnsi-encoded and will silently substitute (and
   * mis-measure) characters like "✓" or "→". Use "+" or "·" or skip.
   */
  glyph?: string;
}

/** Set the font state used by pill measurement and rendering. */
function setPillFont(doc: jsPDF): void {
  doc.setFont(FAMILY.sans, "normal");
  doc.setFontSize(FONTS.pill);
  doc.setCharSpace(0);
}

function pillLabel(pill: { text: string; style: PillStyle }): string {
  return pill.style.glyph ? `${pill.style.glyph}  ${pill.text}` : pill.text;
}

/** Draws a single pill at (x, y). Returns the drawn width/height in mm. */
export function drawPill(
  doc: jsPDF,
  x: number,
  y: number,
  text: string,
  style: PillStyle,
): { width: number; height: number } {
  setPillFont(doc);

  const label = pillLabel({ text, style });
  const width = doc.getTextWidth(label) + SPACING.pillPaddingX * 2;
  const height = SPACING.pillHeight;

  if (style.filled) {
    setFill(doc, style.color);
    setDraw(doc, style.color);
    doc.roundedRect(
      x,
      y,
      width,
      height,
      SPACING.pillRadius,
      SPACING.pillRadius,
      "FD",
    );
    setText(doc, COLORS.white);
  } else {
    setDraw(doc, style.color);
    setFill(doc, COLORS.white);
    doc.setLineWidth(0.3);
    doc.roundedRect(
      x,
      y,
      width,
      height,
      SPACING.pillRadius,
      SPACING.pillRadius,
      "D",
    );
    setText(doc, style.color);
  }

  doc.text(label, x + SPACING.pillPaddingX, y + height / 2 + 0.2, {
    baseline: "middle",
  });

  return { width, height };
}

/**
 * Lay out a row-wrapping collection of pills inside the content width.
 * Returns the final cursorY *below* the pill block.
 *
 * Pagination: if a row would overflow the page, we push a new page
 * before drawing that row. Pills themselves never split across pages.
 */
export function drawPillRow(
  doc: jsPDF,
  cursorY: number,
  pills: Array<{ text: string; style: PillStyle }>,
): number {
  if (pills.length === 0) return cursorY;

  const lineHeight = SPACING.pillHeight + SPACING.pillGapY;
  let x = PAGE.marginX;
  let y = ensureSpace(doc, cursorY, lineHeight);

  // Make sure measurement font state matches what drawPill will use.
  setPillFont(doc);

  for (const pill of pills) {
    const predictedWidth =
      doc.getTextWidth(pillLabel(pill)) + SPACING.pillPaddingX * 2;

    if (x + predictedWidth > PAGE.marginX + CONTENT_WIDTH) {
      // Wrap to next line.
      x = PAGE.marginX;
      y += lineHeight;
      y = ensureSpace(doc, y, lineHeight);
    }

    const drawn = drawPill(doc, x, y, pill.text, pill.style);
    x += drawn.width + SPACING.pillGapX;

    // drawPill may have changed font state; restore for next measurement.
    setPillFont(doc);
  }

  return y + SPACING.pillHeight + 1;
}

/**
 * Keep a small uppercase label + its following pill row together on the
 * same page. Prevents orphan labels (label on page N, pills on page N+1).
 */
export function drawLabeledPillRow(
  doc: jsPDF,
  cursorY: number,
  label: string,
  pills: Array<{ text: string; style: PillStyle }>,
  labelColor: RGB = COLORS.muted,
): number {
  if (pills.length === 0) return cursorY;

  // Reserve vertical room for the label + at least one pill row.
  const blockMin = 4.2 + SPACING.pillHeight + 2;
  let y = ensureSpace(doc, cursorY, blockMin);

  y = drawEyebrow(doc, y, label, labelColor);
  y = drawPillRow(doc, y, pills);
  return y;
}

// ---------------------------------------------------------------------------
// Text blocks
// ---------------------------------------------------------------------------

/**
 * Uppercase mono eyebrow label (e.g. "MATCHED", "MISSING — CORE"),
 * with wide character spacing to match the app's UI.
 */
export function drawEyebrow(
  doc: jsPDF,
  cursorY: number,
  text: string,
  color: RGB = COLORS.muted,
): number {
  const y = ensureSpace(doc, cursorY, 5);
  doc.setFont(FAMILY.mono, "normal");
  doc.setFontSize(FONTS.eyebrow);
  setText(doc, color);
  doc.setCharSpace(TRACKING.eyebrow);
  doc.text(text.toUpperCase(), PAGE.marginX, y + 3);
  doc.setCharSpace(0);
  return y + 4.4;
}

/** Section heading — serif, bold, with a short accent rule beneath. */
export function drawSectionHeading(
  doc: jsPDF,
  cursorY: number,
  title: string,
  accent: RGB = COLORS.verify,
): number {
  const headingHeight = 9;
  const y = ensureSpace(doc, cursorY, headingHeight + 6);

  doc.setFont(FAMILY.serif, "bold");
  doc.setFontSize(FONTS.sectionHeading);
  setText(doc, COLORS.navy);
  doc.setCharSpace(0);
  doc.text(title, PAGE.marginX, y + 5);

  setDraw(doc, accent);
  doc.setLineWidth(0.9);
  doc.line(PAGE.marginX, y + 7.4, PAGE.marginX + 16, y + 7.4);

  return y + headingHeight + SPACING.afterSectionHeading;
}

/**
 * A muted italic body message, wrapped to the content width. Used for
 * "empty state" messages in sections with no data.
 */
export function drawMutedNote(
  doc: jsPDF,
  cursorY: number,
  text: string,
): number {
  let y = ensureSpace(doc, cursorY, 10);
  doc.setFont(FAMILY.sans, "italic");
  doc.setFontSize(FONTS.body);
  setText(doc, COLORS.muted);
  doc.setCharSpace(0);

  const lines = doc.splitTextToSize(text, CONTENT_WIDTH) as string[];
  for (const line of lines) {
    doc.text(line, PAGE.marginX, y + 4);
    y += 4.8;
  }
  return y;
}
