// Layout constants for the candidate career roadmap PDF.
// Units are millimetres; jsPDF is initialised with `unit: "mm"`.
// Page size is A4 (210 x 297 mm).
//
// Colors mirror the Apollo palette from app/globals.css so the PDF reads
// as part of the same product, not an auto-generated artifact. CSS
// variables do not cross into jsPDF, so the hex values are hardcoded here.

import type jsPDF from "jspdf";

export type RGB = [number, number, number];

// Explicit type so members widen to `number` at use sites (keeps math
// terse — `let y = PAGE.marginY` infers `number`, not the literal `15`).
export const PAGE: {
  width: number;
  height: number;
  marginX: number;
  marginY: number;
} = {
  width: 210,
  height: 297,
  marginX: 15,
  marginY: 15,
};

export const CONTENT_WIDTH = PAGE.width - PAGE.marginX * 2; // 180 mm

// RGB triples for jsPDF setFillColor / setDrawColor / setTextColor.
// Hex values match the --apollo-* custom properties in app/globals.css.
export const COLORS = {
  inkSoft: [51, 65, 85] as RGB, //        slate-700
  muted: [100, 116, 139] as RGB, //       slate-500
  navy: [11, 37, 69] as RGB, //           --apollo-navy      #0b2545
  verify: [22, 163, 74] as RGB, //        --apollo-verify    #16a34a
  contradict: [220, 38, 38] as RGB, //    --apollo-contradict #dc2626
  flag: [217, 119, 6] as RGB, //          --apollo-flag      #d97706
  border: [203, 213, 225] as RGB, //      slate-300
  borderStrong: [148, 163, 184] as RGB, // slate-400
  white: [255, 255, 255] as RGB,
} as const;

export const FONTS = {
  title: 26,
  sectionHeading: 15,
  subheading: 11,
  body: 10,
  small: 8.5,
  pill: 8.5,
  footer: 7.8,
  scoreLarge: 22,
  eyebrow: 7.4,
} as const;

// Font-family mapping. Values map to jsPDF's three standard families
// (no embedding required). Matches the app's typographic voice:
//   - apollo-serif (Georgia)  → times
//   - geist-mono              → courier
//   - geist-sans (body)       → helvetica
export const FAMILY = {
  serif: "times",
  mono: "courier",
  sans: "helvetica",
} as const;

// Extra character spacing in mm, applied via doc.setCharSpace(...).
// Emulates the app's wide uppercase tracking (e.g. tracking-[0.22em]).
// Always reset to 0 after use.
export const TRACKING = {
  eyebrow: 0.55,
  caption: 0.35,
} as const;

export const SPACING = {
  afterHeader: 6,
  afterSectionHeading: 3,
  afterSection: 9,
  afterSubsection: 5,
  pillGapX: 1.5,
  pillGapY: 1.8,
  pillHeight: 5.2,
  pillPaddingX: 2.4,
  pillRadius: 1.1,
} as const;

/**
 * Ensure there is `blockHeight` mm of space left on the current page.
 * If not, add a fresh page and return the new cursorY at top margin.
 * Otherwise return the passed-in cursorY unchanged.
 *
 * Sections should call this before drawing any non-splittable block
 * (a heading, a score row, a gap entry), so a heading doesn't get
 * orphaned at the bottom of a page.
 */
export function ensureSpace(
  doc: jsPDF,
  cursorY: number,
  blockHeight: number,
): number {
  if (cursorY + blockHeight > PAGE.height - PAGE.marginY) {
    doc.addPage();
    return PAGE.marginY;
  }
  return cursorY;
}
