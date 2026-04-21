# Apollo — Hackathon Demo Script

> **Challenge:** AI-Based Job Matching & Skill Gap Analyzer
> **Vibe:** Fun, student energy — you built something cool, show it off
> **Total demo time:** ~6–7 minutes | **Two sides:** Candidate flow → Employer flow
> **Tagline:** *"Upload your resume. Know your gaps. Land the job. Trust the hire."*

---

## Challenge Checklist (What Judges Want to See)

| Requirement | Status | Where in demo |
|---|---|---|
| Extract skills from resume | ✅ Built | Candidate — skill chips appear after upload |
| Match users to relevant jobs | ✅ Built | Candidate — ranked job cards with score |
| Identify missing skills (skill gap) | ✅ Built | Candidate — gap list below job matches |
| Recommend learning resources | ✅ Built | Candidate — resources inside each gap card |
| *(Bonus)* Job-aware verification | ✅ Built | Employer — verification report per application |

---

## 0. Setup Checklist (Before You Go On Stage)

- [ ] Dev server running (`bun run dev`)
- [ ] Browser open at `localhost:3000` (candidate view)
- [ ] Employer view ready in a second tab
- [ ] Sample PDF resume ready — pick one with obvious skill gaps vs. a target job
- [ ] Supabase seeded with at least 3 job listings with varied `skills_required`
- [ ] At least one application already in the DB (so employer view has something to verify)
- [ ] Env vars set: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- [ ] Full flow tested end-to-end at least once

---

## PART 1 — CANDIDATE SIDE

---

## 1. Hook (30 seconds)

> **Say this with energy — make it relatable:**

"Okay real talk. How many of you have sent out like 20 job applications and heard absolutely nothing back?

Yeah. That's the problem we're solving.

Most job seekers have no idea which jobs they actually match, no idea what skills they're missing, and no idea what to study to fix it. They're basically throwing resumes into a black hole and hoping for the best.

Apollo changes that. Drop in your resume — and in seconds, you know exactly where you stand."

---

## 2. Upload the Resume (30 seconds)

> **Action:** Drag the sample PDF onto the upload zone with a bit of flair.

**Say:**
"So I'm going to drop this resume in right now — watch what happens."

> **Wait for skill chips to appear.**

"Boom. The AI just read that entire PDF and pulled out every single skill — programming languages, frameworks, tools, domain knowledge — and tagged each one with a confidence level. Not just 'Python was mentioned' but 'Python appeared consistently, high confidence this person actually knows it.'

No forms. No checkboxes. Just drop the file."

---

## 3. Job Matches (60 seconds)

> **Action:** Job match cards appear ranked by score. Expand one.

**Say:**
"Now it scores the candidate against every open role we have. And this is where it gets smart — the algorithm isn't just counting how many skills match. It understands adjacent skills.

So if a job wants React and you know Vue? That counts. Not full points, but it counts. Because knowing one UI framework means you can pick up another — and the AI knows that."

> **Point at a high-score card.**

"This one's a strong match. Most required skills are there."

> **Point at a mid-score card.**

"This one's sitting at around 60%. And see right here — it's showing you *exactly* which skills are missing. We're not just saying 'you didn't get the job.' We're saying 'here's specifically why, and here's what to do about it.'"

---

## 4. Skill Gap Analysis (60 seconds)

> **Action:** Scroll to the skill gap section.

**Say:**
"This is my personal favorite part.

Apollo doesn't just show you gaps per job — it ranks which skills to learn first across *all* the jobs. So instead of looking at each job individually and feeling overwhelmed, you get one prioritized list.

SQL is at the top. Why? Because it's required by 8 of the 12 open roles. Learn SQL and you instantly become eligible for more than half the board. It takes about 20 hours — that's like two focused weekends.

TypeScript is next. 6 roles, 30 hours. The whole ranking is based on one question: which skill gives you the biggest jump in opportunity for the least time invested?

This is the study plan you never got from a career counselor."

---

## 5. Learning Resources (30 seconds)

> **Action:** Expand a skill gap card.

**Say:**
"And it doesn't just tell you *what* to learn — it tells you *where* to learn it. Curated resources for each skill — not a Google search, actual specific courses and documentation that cover the skill properly.

Free freeCodeCamp course, a Coursera track, official docs. Candidate can click and start literally right now.

From PDF to personalized study plan in under 30 seconds. That's the candidate side."

---

## 6. Apply to a Job (20 seconds)

> **Action:** Click "Apply" on a job card. Submit the quick form.

**Say:**
"When the candidate finds a role they want to go for, they apply right here. Apollo stores everything — the resume, the extracted skills, the match score.

And now the application lands on the employer's side — with context the employer has never had before."

---

## PART 2 — EMPLOYER SIDE

---

## 7. Transition (10 seconds)

> **Action:** Switch to the employer tab.

**Say:**
"Okay, switching hats. Now I'm the hiring manager."

---

## 8. View the Application (20 seconds)

> **Action:** Show the applications list.

**Say:**
"I can see every application for my open role — already scored by skill match. I can tell at a glance who's worth looking at. But a score based on what someone *claims* they know? That's just trusting the resume. Let's actually check."

---

## 9. Trigger Verification (15 seconds)

> **Action:** Click "Verify claims" on an application.

**Say:**
"One click. Apollo launches four AI agents to go verify this resume across the web."

---

## 10. Four Agents, Job-Aware (75 seconds)

> **Action:** Watch the four lane columns appear and animate.

**Say:**
"Four agents. Each one has a specific job:
- One checks employer history
- One checks LinkedIn
- One checks GitHub
- One searches for news and web mentions

And here's the part that makes this different from, say, just Googling someone."

> **Pause for effect.**

"Every single one of these agents is briefed on the role before it starts. It knows the job title, the description, and which skills actually matter for this hire.

So the GitHub agent isn't just checking 'does this account exist.' It's asking 'do the repos here actually show evidence of the skills this role needs?' That's a completely different question."

> **Point at the live browser iframe.**

"And you can watch it happen in real time. That's a real browser. The agent is deciding where to look next based on what it finds — it's not running a fixed checklist."

> **Point at the thought/action/observation trace.**

"Every step is logged. Every search query, every page it visited, every piece of evidence it pulled. Full audit trail."

---

## 11. The Verification Report (60 seconds)

> **Action:** Report renders. Walk through gauge → claim cards → red flags.

**Say:**
"Here's the dossier.

The trust gauge is the overall score — how much of what's on this resume actually checks out.

But the verdict isn't just 'did they lie?' It's 'is their background actually relevant to this role?' Those are two very different questions, and most background check tools only answer the first one."

> **Expand a claim card.**

"Every claim is broken down. Verified means we found corroborating evidence. Flagged means something looked a bit off. Contradicted means we found conflicting data."

> **Point at the red flags section.**

"And this candidate — great background, genuinely impressive — but their experience is heavily frontend and this is a backend role. Apollo flagged that as a role-fit concern. Not 'they're lying.' Just 'this might not be the right match for *this* job.'

That's the kind of nuance that usually gets buried in a two-hour interview cycle. Apollo surfaces it in two minutes."

---

## 12. Closing (30 seconds)

**Say:**
"Standard background checks cost 50 to 200 dollars, take up to five business days, and basically just confirm a person existed at a company.

Apollo runs in under two minutes, costs cents, and gives you something no background check has ever given you: a verdict on whether the candidate is the right fit for this specific role.

We built this in a single day. Imagine what it looks like with a week."

> Pause. Let that land.

"Apollo. Upload your resume. Know your gaps. Land the job. Trust the hire."

---

## Fallback Plan

| Problem | Recovery |
|---|---|
| Agents are slow | Narrate the live trace — "the employer agent is navigating LinkedIn right now, let's watch what it finds" |
| AI API or network down | Show `app/lib/lanes/` in the editor, explain the architecture — "the code is all here, the demo gods are just not on our side today" |
| Gap UI not wired up yet | Open `app/lib/skills/gaps.ts`, show `rankGaps()` — "the logic is fully built, we just didn't get to the UI today" |
| No pre-existing application | Create one live — "let me actually go through the whole flow, it'll only take a second" |

---

## Likely Judge Questions

| Question | Answer |
|---|---|
| How does skill extraction work? | The AI reads the raw PDF and maps text to a canonical taxonomy of 130+ skills with confidence levels — so vague mentions don't count the same as strong evidence. |
| How is match score calculated? | Direct matches get full weight, adjacent skills (Vue ≈ React) get 0.5x. If any core required skill is missing, score caps at 60% to surface critical gaps. |
| How are gap skills ranked? | By leverage — how many open jobs require that skill — then by estimated learning hours. Highest impact, lowest effort first. |
| What does "job-aware" mean exactly? | Before each verification agent starts, it's briefed on the job title, description, and required skills. It biases its investigation and findings toward what actually matters for that specific hire. |
| How accurate is it? | Agents can be wrong — that's why every finding needs a source URL and a direct quote. Apollo reduces research time; a human still makes the final call. |
| You're using an external AI API — isn't that a privacy risk? | Great question, and yes — for this MVP, we're using API calls to an external provider. That's fine for a prototype. For a real production deployment with sensitive company data, the natural path is to swap in a local LLM like Llama or Mistral running on your own infrastructure. Our app is architected for exactly that — the AI calls are isolated in one layer, so it's a config change, not a rewrite. |
| What's next? | Candidate accounts to track skill progress over time, ATS integrations like Greenhouse and Lever, and local LLM support so companies can run it fully on-premise. |

---

## Time Budget

| Section | Time |
|---|---|
| Hook | 0:30 |
| Upload + skill extraction | 0:30 |
| Job matches | 1:00 |
| Skill gap analysis | 1:00 |
| Learning resources | 0:30 |
| Apply to job | 0:20 |
| Transition to employer | 0:10 |
| View application | 0:20 |
| Trigger verification | 0:15 |
| Four job-aware agents | 1:15 |
| Verification report | 1:00 |
| Closing | 0:30 |
| **Total** | **~7:20** |

> **Tight on time?** Skip the "Apply" step and start the employer side with a pre-existing application — saves about 1 minute.
