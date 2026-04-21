# Apollo — Hackathon Demo Script

> **Challenge:** AI-Based Job Matching & Skill Gap Analyzer
> **Total demo time:** ~5 minutes | **Format:** Live demo with narration
> **Tagline:** *"Upload your resume. Know your gaps. Land the job."*

---

## Challenge Checklist (What Judges Want to See)

| Requirement | Status | Where in app |
|---|---|---|
| Extract skills from resume | ✅ Built | Upload → skill chips appear |
| Match users to relevant jobs | ✅ Built | Ranked job cards with match score |
| Identify missing skills (skill gap) | ✅ Built (wire up before demo) | `rankGaps()` in `lib/skills/gaps.ts` |
| Recommend learning resources | ✅ Built (wire up before demo) | `SKILL_META` in `lib/skills/learning.ts` |

> **Pre-demo task:** Expose `rankGaps` in the UI. The function + 70-skill resource metadata already exist — they just need to render on the page after job matches appear.

---

## 0. Setup Checklist (Before You Go On Stage)

- [ ] Dev server running (`bun run dev`)
- [ ] Browser open at `localhost:3000`
- [ ] Sample PDF resume ready (one with obvious skill gaps vs. a target job)
- [ ] Supabase seeded with at least 3 job listings that have varied `skills_required`
- [ ] Env vars set: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- [ ] Tested the full flow end-to-end once

---

## 1. Hook (30 seconds)

> **Say this — no slides, just talk:**

"Most job seekers apply blindly. They upload a resume, hope for the best, and get rejected — with no idea why.

Apollo flips that. You drop in your resume, and in seconds you know: which jobs you're a strong match for, which ones you're almost there on, and exactly which skills are holding you back — with free courses to close those gaps today."

---

## 2. Upload the Resume (30 seconds)

> **Action:** Drag the sample PDF onto the upload zone.

**Say:**
"I'll drop in a resume now. Apollo sends it straight to Claude, which reads the document and extracts every skill — programming languages, frameworks, tools, domain knowledge — mapped to a canonical taxonomy with confidence levels."

> **Wait for skill chips to appear. Gesture at them.**

"These are the candidate's verified skills. Not a keyword list — each one has a confidence level based on how clearly it appeared in the resume."

---

## 3. Job Matches (60 seconds)

> **Action:** Job match cards appear ranked by score. Click on one to expand it.

**Say:**
"Now Apollo scores the candidate against every open role. The algorithm isn't just counting matches — it understands adjacent skills too. If a job wants React and the candidate knows Vue, that counts as a partial match, not zero."

> **Point at a job card with a high match score.**

"This role is a strong match — most required skills are present. The score bar shows matched, adjacent, and missing skills at a glance."

> **Point at a job card with a mid-range score.**

"This one is closer to 60%. Notice the missing skills listed right on the card — those are the exact gaps standing between this candidate and this job."

---

## 4. Skill Gap Analysis (75 seconds)

> **Action:** Scroll to the skill gap section below job matches.**

**Say:**
"Here's where it gets interesting. Apollo doesn't just show you the gaps per job — it ranks which skills to learn first across *all* jobs."

> **Point at the top skill in the gap list.**

"SQL is the top recommendation. It's required by 8 of the 12 open roles. Learning it would immediately unlock the most opportunities. Apollo shows estimated hours to learn it — 20 hours — and its difficulty level."

> **Point at a second gap skill.**

"TypeScript is next — required by 6 roles, 30 hours to learn. The ranking is pure leverage: which skill gives you the biggest jump in job eligibility for the least time invested."

---

## 5. Learning Resources (45 seconds)

> **Action:** Expand a skill gap card to show learning resources.**

**Say:**
"Every gap comes with curated resources. Not a Google search — specific courses, tutorials, and documentation that actually cover the skill."

> **Point at the resource links.**

"SQL: there's a free full-length course on freeCodeCamp, a structured Coursera track, and the official documentation. The candidate can start learning in the next 5 minutes."

"This closes the loop. You went from a PDF resume to a personalized learning roadmap in under 30 seconds."

---

## 6. Why This Matters (30 seconds)

**Say:**
"The average job seeker applies to 27 positions before getting an offer. Most of those rejections are skill gaps they didn't know they had.

Apollo turns a one-way guessing game into a feedback loop. Upload once, see exactly where you stand, get a plan to close the gap. For employers, every applicant who comes through has been pre-matched — no more filtering 200 resumes manually."

---

## 7. Closing Line (15 seconds)

**Say:**
"Apollo. Upload your resume. Know your gaps. Land the job."

---

## Fallback: If Something Isn't Wired Up Yet

- **If gap UI isn't live:** Open `app/lib/skills/gaps.ts` in the editor and show `rankGaps()` — explain the algorithm live: "The backend is fully built, we just haven't connected the UI today."
- **If learning resources aren't rendering:** Open `app/lib/skills/learning.ts` and show an example entry — "70 skills, each with curated resources. This is all live data, ready to render."
- **If job matches are slow:** Show the skill chips first and narrate while results load.

---

## Likely Judge Questions

| Question | Answer |
|---|---|
| How does skill extraction work? | Claude reads the PDF and maps raw text to a canonical taxonomy of 130+ skills. It returns confidence levels so low-quality mentions aren't treated the same as strong evidence. |
| How is the match score calculated? | Direct matches get full weight, adjacent skills (e.g., Vue ≈ React) get 0.5x. If any *core* required skill is missing, the score is capped at 60% to surface critical gaps. |
| How are gap skills ranked? | By leverage — how many open jobs require that skill — then by estimated learning hours. Learn the highest-leverage, lowest-effort skills first. |
| Where do learning resources come from? | Curated manually for 70+ skills. Each entry has 2–3 resources with platform, title, and URL — YouTube, Coursera, freeCodeCamp, official docs. |
| Can it handle text input, not just PDFs? | Yes — the extraction API accepts raw text too, so a user could paste their resume or just a skills list. |
| What's next? | Candidate accounts to save progress, adaptive learning paths that update as users add skills, and employer-side analytics on the talent pipeline. |

---

## Time Budget

| Section | Time |
|---|---|
| Hook | 0:30 |
| Upload + skill extraction | 0:30 |
| Job matches walkthrough | 1:00 |
| Skill gap analysis | 1:15 |
| Learning resources | 0:45 |
| Why this matters | 0:30 |
| Closing line | 0:15 |
| **Total** | **4:45** |
