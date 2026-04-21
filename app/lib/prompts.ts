import type { JobContext, ResumeClaims } from "./schemas";

const today = () => new Date().toISOString().slice(0, 10);

const RULES = () => `Today's date: ${today()}. Reason about employment dates, "current" / "present" roles, and recency relative to this date.

Rules:
- Use tools — do not guess. Each claim needs a URL in evidence.
- Prefer primary sources (company site, official GitHub, publication of record) over aggregators.
- If a page blocks you (login wall, captcha, 403), record the observation and move on.
- Keep your investigation tight — you have a hard step cap across all claims in this lane.
- When you have enough signal for every claim you can reach, stop and summarize.`;

function JOB_BLOCK(job: JobContext, laneHint: string): string {
  const core = job.coreSkills.length > 0 ? job.coreSkills.join(", ") : "(none listed)";
  const nice = job.niceSkills.length > 0 ? job.niceSkills.join(", ") : "(none listed)";
  return `Role being hired: ${job.title} (${job.category}).
Role summary: ${job.description}
Core skills the hiring manager weighs most: ${core}
Nice-to-have skills: ${nice}

When investigating, prioritize evidence that speaks to fit for this role. ${laneHint}
Do not penalize absence — only report what you find.`;
}

export function employerPrompt(claims: ResumeClaims, job: JobContext) {
  const employers = claims.employers
    .map(
      (e, i) =>
        `  [${i}] ${e.title} @ ${e.company}` +
        (e.startDate || e.endDate ? `, ${e.startDate ?? "?"}–${e.endDate ?? "present"}` : "") +
        (e.location ? ` (${e.location})` : "")
    )
    .join("\n");

  return {
    system:
      `You verify employer claims on resumes for a hiring manager. ` +
      `For each employer, try to confirm (1) the company exists, (2) the role/title is plausible, ` +
      `(3) the dates align with any public signal (press releases, blog posts, bylines). ` +
      RULES() +
      "\n\n" +
      JOB_BLOCK(
        job,
        "Flag whether the claimed scope, domain, and scale of past employers map onto what this role needs."
      ),
    user: `Candidate: ${claims.candidateName}\n\nEmployers claimed:\n${employers || "  (none)"}\n\nCite URLs. Return verified / unverified / contradicted / flagged per employer.`,
  };
}

export function linkedinPrompt(claims: ResumeClaims, job: JobContext) {
  const target =
    claims.linkedinUrl ??
    `search for "${claims.candidateName}" ${claims.employers[0]?.company ?? ""} LinkedIn`.trim();
  return {
    system:
      `You verify a candidate's LinkedIn profile matches their resume. ` +
      `LinkedIn aggressively blocks bots — if you hit a login wall, record that and extract whatever snippet Google/DuckDuckGo shows. ` +
      `Compare the profile (or search snippet) against the resume's employers, titles, and dates. ` +
      RULES() +
      "\n\n" +
      JOB_BLOCK(
        job,
        "Note whether the candidate's LinkedIn narrative (titles, seniority, tenure) is coherent with the level this role is hiring at."
      ),
    user: `Candidate: ${claims.candidateName}\nLinkedIn lead: ${target}\nResume employers: ${claims.employers
      .map((e) => `${e.title} @ ${e.company}`)
      .join("; ")}\n\nFlag discrepancies (title mismatches, missing jobs, different dates).`,
  };
}

export function githubPrompt(claims: ResumeClaims, job: JobContext) {
  const handle = claims.githubHandle;
  const fallbackHint = handle
    ? `Known handle: github.com/${handle}`
    : `No handle on resume — search for "${claims.candidateName}" site:github.com plus their skills (${claims.skills.slice(0, 5).join(", ")}) and see if you can identify them.`;
  return {
    system:
      `You verify a candidate's technical claims against public GitHub activity. ` +
      `Check the profile exists, that account age is consistent with claimed years of experience, ` +
      `and that at least one public repo corroborates the projects/skills on the resume. ` +
      RULES() +
      "\n\n" +
      JOB_BLOCK(
        job,
        "Weight repos and tech stacks that overlap the core skills. Quick note when work looks entirely off-stack for this role."
      ),
    user: `Candidate: ${claims.candidateName}\n${fallbackHint}\nClaimed projects:\n${claims.projects
      .map((p, i) => `  [${i}] ${p.name}${p.description ? " — " + p.description : ""}`)
      .join("\n") || "  (none)"}\nClaimed skills: ${claims.skills.join(", ") || "(none)"}`,
  };
}

export function newsPrompt(claims: ResumeClaims, job: JobContext) {
  return {
    system:
      `You search the open web and news for mentions of this candidate to surface ` +
      `(a) corroborating press (bylines, conference talks, awards, lawsuits, interviews) or ` +
      `(b) red flags (same-name conflicts, controversies). ` +
      `Be precise about whether a result is actually the same person vs. a namesake. ` +
      RULES() +
      "\n\n" +
      JOB_BLOCK(
        job,
        "Favor signal that's substantive for this role's domain (talks, bylines, awards) over generic mentions."
      ),
    user: `Candidate: ${claims.candidateName}\nDistinguishing context: ${claims.employers
      .slice(0, 2)
      .map((e) => e.company)
      .join(", ") || "(no employers)"}, ${claims.schools
      .slice(0, 1)
      .map((s) => s.name)
      .join(", ") || "(no schools)"}\n\nReport findings with URLs. If nothing surfaces, say so.`,
  };
}

export function laneSynthPrompt(
  laneId: string,
  agentText: string,
  claims: ResumeClaims,
  trajectory: string,
  job: JobContext
) {
  return `You are the structuring step for the "${laneId}" verification lane.

The investigating agent's tool trajectory is below — every search, navigation, and extraction it performed, with the URLs visited and the content each page returned. Use this as the source of truth for evidence URLs; do NOT invent URLs.

Rules:
- Every finding needs a claimRef like "employers[0]", "projects[1]", "linkedin", "github", "news". Use plain English when no indexed claim applies.
- Every finding needs at least one evidence URL drawn from the trajectory. Prefer the resolved page URL (where content was actually extracted) over a search-results URL. If a page was blocked/unreachable, do not cite it.
- If the trajectory confirms a claim, set conclusion="verified" and include the supporting page URL + a short quote from the snapshot/extraction when one is available.
- If the trajectory contradicts a claim, set conclusion="contradicted" and cite the contradicting page.
- If the trajectory shows the agent looked but found nothing usable (all blocks, no data), set conclusion="unverified", confidence="low", and cite at least one URL that was attempted (so the reviewer can see the dead end).
- status = "ok" if most claims got a clear conclusion, "partial" if some blocked/skipped, "failed" if nothing usable.
- Lean your statements toward information that is decision-useful for the role being hired.

Candidate: ${claims.candidateName}
Role being hired: ${job.title} (${job.category})

Agent trajectory:
"""
${trajectory || "(no tool activity)"}
"""

Agent's closing notes:
"""
${agentText || "(no output)"}
"""`;
}
