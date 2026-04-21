# Feature Spec: Personalized PDF Learning Roadmap

**Target stack:** Next.js (App Router assumed; adapt if Pages Router) + shadcn/ui + Tailwind CSS

---

## Context for the Implementing Agent

You are integrating a new feature into an existing Next.js web application that performs AI-based job matching and skill gap analysis. The app already:

- Accepts resume text input
- Extracts skills from the resume
- Matches the user against a predefined list of jobs
- Computes a match score per job
- Identifies missing skills per job
- Maps missing skills to learning resources

The app uses **shadcn/ui** for components and **Tailwind CSS** for styling. Match these conventions.

Your task is to add an **"Export Roadmap as PDF"** capability that turns the user's existing analysis into a polished, shareable PDF document they can download.

**Inspect the repo before writing code.** Confirm: App Router vs Pages Router, TypeScript vs JS, where results state lives, which shadcn components are already installed, and the Tailwind theme config (especially the accent/primary color).

---

## Goal

One button — "Download Roadmap (PDF)" — that produces a personalized, well-designed PDF containing the user's top job matches, their skill gaps, and prioritized learning recommendations.

The PDF is the tangible takeaway. It must look intentional, not auto-generated.

---

## User Flow

1. User pastes a resume and runs the analysis (existing behavior).
2. Results render on screen (existing behavior).
3. A **"Download Roadmap (PDF)"** button (shadcn `<Button>`) is visible near the results.
4. User clicks the button.
5. A PDF is generated **client-side** and downloaded with filename `career-roadmap-YYYY-MM-DD.pdf`.
6. No server round-trip, no API route, no server action required.

---

## Stack-Specific Requirements

### Client Component only
- The button and the PDF generation logic MUST live in a Client Component (`"use client"` directive).
- Do NOT put PDF generation in a Server Component, Server Action, or API route. jsPDF depends on browser APIs.

### Dynamic import to keep bundle size down
- The PDF library is heavy (~200KB+). Do NOT import it at the top of the file.
- Use a dynamic import inside the click handler so it's only loaded when the user actually clicks:
  ```ts
  const handleDownload = async () => {
    const { generateRoadmapPdf } = await import("@/features/roadmap-pdf");
    await generateRoadmapPdf(input);
  };
  ```
- This keeps the initial page bundle lean — important for a hackathon demo where first paint matters.

### shadcn components to use
- **Button** — the download trigger. Use existing `variant` conventions in the repo (likely `default` or `secondary`).
- **Use `lucide-react`** for the download icon (e.g., `Download` or `FileDown`). It ships with shadcn.
- If the repo uses **sonner** or shadcn's **toast**, surface success/error via that. Do not use `alert()`.

### Styling the button
- Match the visual weight of other primary actions on the results view.
- Include the lucide icon to the left of the label with appropriate spacing (`className="mr-2 h-4 w-4"`).
- Show a loading state during generation. Pattern:
  ```tsx
  <Button onClick={handleDownload} disabled={isGenerating}>
    {isGenerating ? (
      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
    ) : (
      <><Download className="mr-2 h-4 w-4" /> Download Roadmap (PDF)</>
    )}
  </Button>
  ```

### Tailwind theme alignment
- Read the project's `tailwind.config.ts` (or `.js`) and/or `globals.css`.
- Find the primary/accent color (likely a CSS variable like `--primary` or a named Tailwind color).
- Use the **same hex value** for the PDF accent so the document visually matches the app.
- Hardcode the hex inside the PDF layout constants — CSS variables do NOT cross into jsPDF.

---

## Functional Requirements

### FR1 — Button Placement & State
- Place the button in the results view, near the top of the results (not buried at the bottom).
- Button MUST be disabled when no analysis results exist.
- Button MUST show a spinner + "Generating..." label while the PDF is being built.
- On failure, show a toast (sonner/shadcn toast) with a short error message. Do not crash the app.

### FR2 — PDF Content (in order)

The PDF MUST include the following sections, in this order:

1. **Header**
   - Title: "Your Career Roadmap"
   - Generation date (human-readable, e.g., "Generated on April 21, 2026")
   - Optional subtitle / app name

2. **Summary Snapshot**
   - Total skills extracted from the resume (count)
   - Number of jobs analyzed
   - Best match: job title + match percentage
   - A one-line plain-English summary (e.g., "You match 3 of 12 roles at 70%+ and have 4 key skill gaps to close.")

3. **Your Skills**
   - A clean, wrapped list of all skills extracted from the resume.
   - Visual style: pill / chip appearance with rounded borders and padding.
   - Do NOT rely on color alone — use border + fill so it reads well in grayscale print.

4. **Top Job Matches (Top 3)**
   - For each of the top 3 jobs by match score, show:
     - Job title
     - Match percentage (prominent — larger font, accent color)
     - Matched skills (list, with a check-style marker or filled pill)
     - Missing skills (list, with an outline-style pill or different marker)
   - If fewer than 3 jobs exist, show all.

5. **Priority Learning Plan**
   - Aggregate missing skills across the top 3 jobs.
   - Sort by frequency (skills missing from more jobs come first) — these are the highest-leverage skills to learn.
   - For each skill, show:
     - Skill name (bold)
     - How many of the top 3 jobs require it (e.g., "Needed for 2 of your top 3 matches")
     - The recommended learning resource from the existing skill→resource mapping
   - Cap at top 8 skills to keep the document readable.

6. **Footer (every page)**
   - Page number (e.g., "Page 1 of 3")
   - Small generation timestamp or app name

### FR3 — Filename
- Format: `career-roadmap-YYYY-MM-DD.pdf` using the user's local date.

### FR4 — Client-side only
- No backend calls. No external network requests during generation.
- Entirely in-browser.

---

## Design Requirements

Treat the PDF as a product surface, not a data dump.

- **Typography**: use jsPDF's built-in Helvetica (safe, widely supported). Establish hierarchy: ~22pt title, ~14pt section headings, ~10–11pt body.
- **Spacing**: margins of ~15mm (≈42pt) on all sides. Sections should breathe.
- **Color**: single accent color matching the app's Tailwind primary. Everything else neutral greys + black. No rainbows.
- **Matched vs Missing skills**: distinguish with BOTH shape/border AND color (print accessibility).
- **Page breaks**: a section heading at the bottom of a page with content on the next is a bug. Check the remaining vertical space before drawing each block and insert a page break if needed.
- **Page size**: **A4** (unless the repo's audience is US-specific, then Letter). Document in code comments.

---

## Technical Guidance

### Library: jsPDF

Use **jspdf** (programmatic drawing). Reasons specific to this stack:
- shadcn's Tailwind-based styling cannot carry into a PDF via any library, so `html2canvas` buys nothing.
- jsPDF produces small files with selectable, searchable text.
- It works cleanly with Next.js when dynamically imported client-side.

Install:
```bash
npm install jspdf
# or pnpm / yarn equivalents — use whatever the repo uses
```

Do NOT install `jspdf-autotable` unless you end up needing proper tables — the layout in this spec is text + pills, not tabular.

### Data contract

**Locate the existing analysis result object in the codebase first.** It likely lives in a client component's state (`useState`), a context, or a Zustand/Jotai store if present. Consume the already-computed result — do not re-derive analysis inside the PDF module.

The PDF module should accept a single input shaped roughly like this (adapt field names to match what the repo already uses):

```ts
type RoadmapInput = {
  extractedSkills: string[];
  jobs: Array<{
    title: string;
    requiredSkills: string[];
    matchedSkills: string[];
    missingSkills: string[];
    matchScore: number; // 0–100
  }>;
  skillToResource: Record<string, { label: string; url?: string }>;
  generatedAt?: Date; // defaults to now
};
```

If the existing shape differs, write a small adapter in the button's component — do not refactor the existing analysis code.

### Module structure

```
/features/roadmap-pdf/
  generateRoadmapPdf.ts    // public entry: RoadmapInput -> triggers download
  layout.ts                // constants: margins, colors (hex), font sizes, page size
  sections/
    header.ts
    summary.ts
    skills.ts
    topMatches.ts
    learningPlan.ts
    footer.ts
  index.ts                 // re-exports generateRoadmapPdf
```

Use the `@/features/roadmap-pdf` path alias if the repo has one configured (shadcn projects usually do — check `tsconfig.json` for `"paths"`).

Each section function should take `(doc, input, cursor)` and return the updated vertical cursor position. This keeps layout composable and pageable.

### Integration point

Expose a single public function:

```ts
export async function generateRoadmapPdf(input: RoadmapInput): Promise<void>;
```

The Client Component calls this on button click via dynamic import. The function handles filename, triggering the download, and surfacing errors.

### Where the button lives

- Find the Client Component that renders the analysis results.
- Add a new Client Component: `/components/roadmap/DownloadRoadmapButton.tsx`.
- Import and place it in the results view near the top.
- The button receives the analysis result as a prop (preferred) or reads it from the same store the results view uses.

---

## Edge Cases to Handle

- **No skills extracted**: PDF still generates. Show "No skills detected — consider adding more detail to your resume." in the Skills section.
- **No job matches above 0%**: Show all jobs sorted by score; the Priority Learning Plan aggregates missing skills across whatever is there.
- **Fewer than 3 jobs in the dataset**: show all available, do not error.
- **Missing skill has no resource mapping**: show the skill name with a generic fallback like "Search online courses for this skill."
- **Very long skill names or job titles**: wrap cleanly via jsPDF's `splitTextToSize`. Do not overflow the page.
- **Very long skill lists**: paginate rather than clip.
- **Special characters / non-ASCII**: Helvetica handles most Latin characters. For anything exotic, embed a Unicode font or fall back gracefully.
- **SSR safety**: because jsPDF is dynamically imported inside the click handler (a browser-only code path), there is no SSR concern. Do not top-level-import jsPDF anywhere.

---

## Out of Scope

- Emailing the PDF
- Saving the PDF server-side
- User accounts or persistence
- Editable / customizable PDF templates
- Internationalization (English only for v1)
- Charts or graphs inside the PDF (keep it text-and-pills for this iteration)

---

## Acceptance Criteria

The feature is done when all of the following are true:

- [ ] A "Download Roadmap (PDF)" button (shadcn `<Button>` with lucide icon) appears in the results view and is disabled when no results exist.
- [ ] Button shows a loading state with spinner during generation.
- [ ] jsPDF is dynamically imported inside the click handler — it does NOT appear in the initial page bundle.
- [ ] Clicking the button downloads a PDF named `career-roadmap-YYYY-MM-DD.pdf`.
- [ ] The PDF contains, in order: header, summary snapshot, skills list, top 3 job matches, priority learning plan, footer with page numbers.
- [ ] Matched and missing skills are visually distinguishable **without relying on color alone**.
- [ ] The PDF accent color matches the app's Tailwind primary color (same hex).
- [ ] The PDF renders correctly with: 0 skills, 1 job, 15 jobs, and skills with no resource mapping.
- [ ] No console errors and no hydration warnings.
- [ ] Generation completes in under 2 seconds on a modern laptop for a typical payload.
- [ ] No network requests are made during PDF generation.
- [ ] The PDF looks designed and intentional.

---

## Suggested Implementation Order

1. Inspect the repo:
   - App Router vs Pages Router
   - TypeScript vs JS
   - Path alias (`@/…`) in `tsconfig.json`
   - Tailwind primary color (hex) in `tailwind.config` / `globals.css`
   - Where the analysis result state lives and the Client Component that renders it
   - Whether sonner/toast is already wired up
2. `npm install jspdf` (or repo's package manager).
3. Scaffold `/features/roadmap-pdf/` with empty section files.
4. Fill in `layout.ts` with the Tailwind-matched accent color, margins, font sizes, page size constant.
5. Implement sections one at a time, in content order. Test each by calling `doc.save()` in isolation.
6. Wire `generateRoadmapPdf` as the public entry.
7. Create `DownloadRoadmapButton.tsx` as a Client Component with dynamic import.
8. Drop the button into the results view.
9. Run through every item in Edge Cases manually.
10. Verify every box in Acceptance Criteria.

---

## Notes for the Agent

- Do not refactor unrelated code.
- Do not introduce a new state management library.
- Match the existing formatter/linter config (Prettier, ESLint) and naming conventions.
- If the repo is TypeScript, this module must be fully typed. If plain JS, match that.
- Keep the PDF module free of React, Next.js, and shadcn imports — it's a pure function callable from anywhere.
- If you need a design decision not covered here, prefer the simpler, more conservative choice and leave a code comment noting the decision.
