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

"Hey everyone, we're [team name]. Our project is Apollo — an AI platform that matches candidates to the right jobs, shows them exactly what skills to learn next, and gives employers a verified, role-specific trust report on every applicant."

> One sentence. Save the details for Slide 2.

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
  ✦  Skill gaps ranked by leverage — learn one skill,
     unlock multiple jobs
  ✦  Verification agents are job-aware — they
     investigate what matters for the role
```

### What to say

"Hiring is broken on both sides.

Candidates apply blindly — they don't know which jobs they actually match, and they don't know which skills are blocking them. Apollo extracts their skills, ranks jobs by fit, and then tells them exactly which gaps to close — with free courses to start today.

Employers have the opposite problem — they get a pile of resumes with no way to know which claims are real. Apollo's verification agents don't just check if a job existed. They investigate whether the candidate's background is actually relevant to the specific role being hired.

That last part is what makes Apollo different from any background check tool out there. The agents know the job."

---

## Slide 3 — Tech Stack

### What goes on screen

```
How We Built It

  AI Layer        External AI API (via Vercel AI SDK)
                  — Skill extraction from PDF
                  — 4 job-aware verification agents
                  — Skill gap + learning recommendations
                  — Role-fit synthesis

  Frontend        Next.js 16 · React 19
                  Tailwind CSS · Framer Motion

  Backend         Next.js API Routes · Zod

  Database        Supabase (PostgreSQL + file storage)

  PDF Parsing     unpdf (server-side, no third-party upload)

  Language        TypeScript throughout

  Future path →   Swap external AI for a local LLM
                  (Llama / Mistral) — same app, no data leaves
                  your infrastructure
```

### What to say

"The AI layer is doing three jobs: reading resumes and extracting skills, running four autonomous verification agents, and synthesizing a role-fit report at the end. For this MVP, those all go through external AI API calls — fast to build, easy to prototype with.

We're aware that in a real company context, you wouldn't want sensitive resume data going to a third-party AI service. The good news is our architecture is ready for that — the AI calls are isolated in one layer, so swapping in a local model like Llama or Mistral is a config change, not a rewrite.

Everything else — Next.js, Supabase, Tailwind — is a standard modern web stack. Nothing exotic, which means it's maintainable and extensible beyond a hackathon."

---

## After Slide 3 → Go to Live Demo

Transition line:

> "Alright, enough slides — let me actually show you how it works."

Then follow the live demo script in `demo-script.md`.
