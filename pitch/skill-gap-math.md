# How the Skill Gap Math Works

> Quick reference — read this once before a demo or judge Q&A.

---

## Job Match Score

Every required skill on a job has a weight: **2 = core, 1 = nice-to-have**.

| You have... | Counts as |
|---|---|
| The exact skill | Full weight |
| A related skill (e.g. Vue when React is required) | Half weight |
| Neither | Missing — core or nice |

```
score = 100 × (full matches + half-credit matches) / total possible weight
```

**Hard rule:** missing even one core skill caps the score at **60**, no matter what else you have.

---

## Skill Gap Ranking

Runs across **all 15 jobs at once** — not per job.

1. Find every skill the user is missing (exact match only — no half-credit here).
2. Count how many jobs require it → that's the **leverage**.
3. Sort:
   - Leverage **high → low** (most jobs unlocked first)
   - Hours **low → high** (cheapest win breaks ties)
   - Alphabetical (final tiebreaker)

That's it. No AI, no randomness — same resume always produces the same ranked list.

---

## Why gaps ignore adjacency

The match score gives you partial credit for related skills.
The gap list doesn't — because it's your **study plan**, not your score.
If React is on the list, you should actually learn React.

---

## One-liner for judges

> "We map every missing skill across all open roles, rank by how many jobs it unlocks, then break ties by how fast it is to learn."
