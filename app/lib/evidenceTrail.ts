import type { LaneId, TraceStep, ClaimSummary } from "./schemas";
import type { LaneState } from "../context/AnalysisContext";

function normalizeUrl(u: string): string {
  try {
    const url = new URL(u);
    return url.origin + url.pathname.replace(/\/$/, "");
  } catch {
    return u;
  }
}

function captureContext(
  trace: TraceStep[],
  i: number,
  collected: Map<string, TraceStep>
) {
  for (let j = i - 1; j >= 0 && j >= i - 3; j--) {
    const s = trace[j];
    if (s.type === "thought") {
      collected.set(s.id, s);
      break;
    }
    if (s.type === "action" || s.type === "finding") break;
  }
  collected.set(trace[i].id, trace[i]);
  for (let j = i + 1; j < trace.length && j <= i + 3; j++) {
    const s = trace[j];
    if (s.type === "observation" || s.type === "finding") {
      collected.set(s.id, s);
      if (s.type === "finding") break;
    } else if (s.type === "action" || s.type === "thought") {
      break;
    }
  }
}

export function buildEvidenceTrail(
  claim: ClaimSummary,
  lanes: Record<LaneId, LaneState>
): TraceStep[] {
  const collected = new Map<string, TraceStep>();

  const findingUrls = new Set<string>();
  for (const lane of Object.values(lanes)) {
    for (const f of lane.findings) {
      if (f.claimRef !== claim.claimRef) continue;
      for (const e of f.evidence) findingUrls.add(normalizeUrl(e.url));
    }
  }

  const claimUrls = new Set(claim.sources.map(normalizeUrl));
  const targetUrls = new Set([...findingUrls, ...claimUrls]);

  if (targetUrls.size === 0) return [];

  for (const lane of Object.values(lanes)) {
    lane.trace.forEach((step, i) => {
      if (!step.link) return;
      if (targetUrls.has(normalizeUrl(step.link))) {
        captureContext(lane.trace, i, collected);
      }
    });
  }

  return Array.from(collected.values()).sort((a, b) => a.timestamp - b.timestamp);
}

export function laneBreakdown(lane: LaneState) {
  const out = { verified: 0, flagged: 0, contradicted: 0, unverified: 0 };
  for (const f of lane.findings) out[f.conclusion] += 1;
  return out;
}

export function claimsBreakdown(claims: ClaimSummary[]) {
  const out = { verified: 0, flagged: 0, contradicted: 0, unverified: 0 };
  for (const c of claims) out[c.status] += 1;
  return out;
}

export function trustScore(claims: ClaimSummary[]): number {
  if (claims.length === 0) return 0;
  let s = 0;
  for (const c of claims) {
    if (c.status === "verified") s += 1;
    else if (c.status === "unverified") s += 0.35;
    else if (c.status === "flagged") s += 0.15;
  }
  return Math.round((s / claims.length) * 100);
}

export function uniqueSources(claims: ClaimSummary[]): string[] {
  const set = new Set<string>();
  for (const c of claims) for (const s of c.sources) set.add(s);
  return Array.from(set);
}
