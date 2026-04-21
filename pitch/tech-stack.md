# Apollo — Tech Stack Explanation Guide

> Use this when a judge or audience member asks "how did you build it?"
> Keep it conversational. You don't need to name-drop every library.

---

## The One-Liner

"We built Apollo on a modern web stack with an AI layer on top — the AI does the heavy lifting for reading resumes, running verification agents, and generating skill gap recommendations. Everything else is just plumbing."

---

## The Full Breakdown (Talk Through This)

### The AI Layer — The Brain

"For the AI side, we're calling an external AI API for most of the intelligence — skill extraction, the verification agents, gap analysis, all of it goes through AI API calls.

The AI does three distinct jobs in our app:

**First** — it reads a raw PDF resume and maps everything it finds to a structured skill taxonomy. Not keyword matching — it understands context, so 'built RESTful services in Node' gets extracted as Node.js with high confidence.

**Second** — it powers four independent verification agents. Each agent is given a specific job to do: check employer history, check LinkedIn, check GitHub, check news and web mentions. The agents autonomously decide what to search for, what links to follow, and what evidence to extract. They're not following a script.

**Third** — a final synthesizer reads all the agent findings and produces a role-fit verdict. Not just 'is this person honest' but 'is this person's background relevant to the role we're hiring for.'

Now — a quick note on this, because it matters for real-world use."

---

### The Privacy Caveat *(say this clearly)*

"For this MVP, we're using API calls to an external AI provider. That works great for a hackathon.

But in a real production deployment — where you're feeding actual employee resumes and company job data to an AI system — you wouldn't want to send that to a third-party service. That's sensitive data. Legal and compliance teams would rightfully push back.

The natural evolution here is to swap out the external API for a **local LLM** — something like Llama or Mistral running on your own infrastructure. Our app is already architected for this: the AI calls are isolated in one layer, so swapping the model is a config change, not a rewrite. The rest of the stack stays exactly the same."

---

### Frontend — What You See

"The frontend is **Next.js** with **React 19** and **Tailwind CSS**. Nothing exotic here — it's a fast, modern web app.

We added **Framer Motion** for the animations you saw in the demo — the skill chips appearing, the lane columns sliding in. Small touch, but it makes the product feel alive instead of just functional.

Everything streams in real time using Server-Sent Events — so when the verification agents are running, you're watching their live output, not waiting for a spinner to finish."

---

### Backend — How It All Connects

"The backend runs as **Next.js API routes** — same codebase, no separate server to manage.

We used the **Vercel AI SDK** to talk to the AI provider. It handles streaming, tool calls, and structured output in a clean abstraction — so we can swap out the underlying model without touching our business logic.

**Zod** handles all our schema validation. Every piece of data the AI returns gets validated against a strict schema — so if the AI hallucinates an unexpected field, it gets caught before it touches the UI."

---

### Database — Storing Everything

"**Supabase** is our database — Postgres under the hood, with file storage for the resume PDFs.

It holds: employers and their job listings, candidate resumes and extracted skills, applications linking candidates to jobs, and the final verification reports.

We picked Supabase because it's fast to set up, has a great local dev experience, and the Row Level Security model maps cleanly onto our two-sided platform — candidates and employers have different access rules."

---

### PDF Parsing — Reading the Resume

"One small but important piece: **unpdf** handles the PDF-to-text extraction entirely on the server. No external parsing service, no uploading the file to a third party just to read it. The text extraction is local, then only the text goes to the AI — not the raw file."

---

### The Skill Taxonomy — The Secret Sauce

"One thing that isn't a library — we built a canonical skill taxonomy of 130+ skills with adjacency mappings. So the matching algorithm knows that Vue and React are adjacent, that AWS and GCP are adjacent, that Postgres and MySQL are adjacent.

This is what makes the match scores meaningful instead of just counting keyword overlaps. And it's what powers the gap ranking — we know which skills are related, so we can tell you 'you're 80% of the way to knowing React because you already know Vue.'"

---

## Questions You Might Get

**"Why not use a simpler model for extraction?"**
"We could — and for production, we'd profile costs carefully. For an MVP, using a capable model means we don't spend time prompt-engineering around a weaker model's limitations. The right call for a hackathon."

**"How do the agents avoid hallucinating evidence?"**
"Two things: every finding requires a source URL and a direct quote. The agents are instructed not to report a finding they can't attribute. And the structuring step after the agent run validates the output against a strict schema — so structurally invalid findings get rejected."

**"Could this work without AI at all?"**
"The skill extraction and verification agents need AI — that's the whole point. But the gap ranking, match scoring, and learning resource recommendations are pure deterministic logic built on top of the AI output. Once skills are extracted, everything downstream is just math and curated data."

**"How long does a full verification run take?"**
"With four agents running in parallel, usually under two minutes. Sequential fallback is slower — around five to six minutes. For a hiring decision that saves hours of manual research, that's an acceptable tradeoff."
