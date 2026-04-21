// Public entry for the client-side career roadmap PDF.
//
// Browser-only: this file imports jsPDF, which depends on browser APIs.
// Never import it from a Server Component or route handler — import it
// dynamically inside a click handler in a Client Component.
//
// Page size: A4 (210 × 297 mm). If Apollo's audience shifts to US-centric
// use, flip to "letter" in one place (PAGE constants + jsPDF init).

import { jsPDF } from "jspdf";
import { renderFooters } from "./sections/footer";
import { renderHeader } from "./sections/header";
import { renderLearningPlan } from "./sections/learningPlan";
import { renderSkills } from "./sections/skills";
import { renderSummary } from "./sections/summary";
import { renderTopMatches } from "./sections/topMatches";
import { PAGE } from "./style";
import type { RoadmapPdfInput } from "./types";

export async function generateRoadmapPdf(
  input: RoadmapPdfInput,
): Promise<void> {
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  let y = PAGE.marginY;

  y = renderHeader(doc, input, y);
  y = renderSummary(doc, input, y);
  y = renderSkills(doc, input, y);
  y = renderTopMatches(doc, input, y);
  renderLearningPlan(doc, input, y);

  // Footers last, so we know the final page count.
  renderFooters(doc, input);

  const stamp = (input.generatedAt ?? new Date()).toISOString().slice(0, 10);
  doc.save(`career-roadmap-${stamp}.pdf`);
}
