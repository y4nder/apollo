# Apollo — Slide-by-Slide Presentation Guide

> 3 slides → then live demo
> Keep each slide on screen for ~30–45 seconds. Talk, don't read.

---

## Slide 1 — Title

### What goes on screen

```
APOLLO

AI-Based Job Matching, Skill Gap Analyzer
& Job-Aware Resume Verification

Team: [YOUR TEAM NAME HERE]
```

### What to say

"Hi, we're [team name]. Our project is Apollo — an AI platform that matches candidates to the right jobs, tells them exactly what skills to learn next, and gives employers a verified, role-specific trust report on every applicant."

> One sentence. Don't elaborate yet — Slide 2 does that.

---

## Slide 2 — Unique Value Proposition

### What goes on screen

```
Two problems. One platform.

FOR CANDIDATES                    FOR EMPLOYERS
─────────────────────────────     ─────────────────────────────
"Which jobs match my skills?"     "Can I trust this resume?"
"What should I learn next?"       "Is this person right for
"Where do I start?"                THIS specific role?"

                    Apollo answers both.

  ✦  AI reads your resume — not a checkbox form
  ✦  Match score explains WHY you fit (or don't)
  ✦  Skill gaps ranked by leverage — one skill,
     multiple jobs unlocked
  ✦  Verification agents are job-aware — they
     investigate what matters for the role
```

### What to say

"Hiring is broken on both sides.

Candidates apply blindly — they don't know which jobs they actually match, and they don't know which skills are blocking them. Apollo extracts their skills, ranks jobs by fit, then tells them exactly which gaps to close and gives them free courses to start today.

Employers have the opposite problem — they get a stack of resumes with no way to know which claims are real and which ones were inflated for the application. Apollo's verification agents don't just check if a job existed — they investigate whether the candidate's background is actually relevant to the role they're hiring for.

That last part is what makes Apollo different from any background check tool out there. The agents know the job. They prioritize the evidence that matters for that specific hire."

---

## Slide 3 — Tech Stack

### What goes on screen

```
How We Built It

  AI Layer        Claude (Anthropic)
                  — Skill extraction from PDF
                  — Job-aware verification agents (4 lanes)
                  — Skill gap + learning recommendations
                  — Role-fit synthesis

  Frontend        Next.js 16 · React 19
                  Tailwind CSS · Framer Motion

  Backend         Next.js API Routes
                  Vercel AI SDK · Zod

  Database        Supabase (PostgreSQL + file storage)

  PDF Parsing     unpdf

  Language        TypeScript throughout
```

### What to say

"Everything runs on Claude. It does three distinct jobs: first, it reads the PDF and extracts skills with confidence levels. Second, four verification agents each run an autonomous investigation — employer history, LinkedIn, GitHub, and web mentions — and each one is briefed on the role being hired so it knows what evidence to prioritize. Third, a synthesizer weighs all the findings and produces a role-fit verdict, not just a generic credibility score.

The frontend is Next.js with React 19 and Tailwind — everything streams in real time. Supabase holds the jobs, applications, resumes, and verification reports. The whole stack was built in a single day."

---

## After Slide 3 → Go to Live Demo

Transition line:

> "Let me show you both sides of the platform."

Then follow the live demo script in `demo-script.md`.
