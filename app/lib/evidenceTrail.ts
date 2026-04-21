import type { LaneId, TraceStep, ClaimSummary, VerificationReport } from "./schemas";
import type { LaneState } from "../context/AnalysisContext";

function normalizeUrl(u: string): string {
  try {
    const url = new URL(u);
    return url.origin + url.pathname.replace(/\/$/, "");
  } catch {
    return u;
  }
}

interface ParsedUrl {
  host: string;
  path: string;
  isHttps: boolean;
  canonical: string;
}

function parseUrl(u: string): ParsedUrl | null {
  try {
    const url = new URL(u);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const path = url.pathname.replace(/\/$/, "");
    if (isSearchIntermediate(host, path)) return null;
    return {
      host,
      path,
      isHttps: url.protocol === "https:",
      canonical: host + path,
    };
  } catch {
    return null;
  }
}

function isSearchIntermediate(host: string, path: string): boolean {
  if (host === "html.duckduckgo.com") return true;
  if (host === "duckduckgo.com" && (path === "" || path === "/html")) return true;
  if (host === "bing.com" && (path === "/search" || path === "")) return true;
  if (host === "google.com" && path === "/search") return true;
  return false;
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

export interface LinkAggregation {
  url: string;
  displayUrl: string;
  host: string;
  path: string;
  lanes: LaneId[];
  refCount: number;
  quotes: Array<{ laneId: LaneId; quote: string }>;
  loadBearing: boolean;
}

export function aggregateLinks(
  lanes: Record<LaneId, LaneState>,
  report: VerificationReport | null
): LinkAggregation[] {
  const map = new Map<string, LinkAggregation & { laneSet: Set<LaneId>; quoteKeys: Set<string> }>();

  const upsert = (raw: string, laneId: LaneId | null, opts: { loadBearing?: boolean; quote?: { laneId: LaneId; quote: string } } = {}) => {
    const parsed = parseUrl(raw);
    if (!parsed) return;
    let entry = map.get(parsed.canonical);
    if (!entry) {
      entry = {
        url: parsed.canonical,
        displayUrl: raw,
        host: parsed.host,
        path: parsed.path,
        lanes: [],
        refCount: 0,
        quotes: [],
        loadBearing: false,
        laneSet: new Set<LaneId>(),
        quoteKeys: new Set<string>(),
      };
      map.set(parsed.canonical, entry);
    } else if (parsed.isHttps && !entry.displayUrl.startsWith("https://")) {
      entry.displayUrl = raw;
    }
    entry.refCount += 1;
    if (laneId) entry.laneSet.add(laneId);
    if (opts.loadBearing) entry.loadBearing = true;
    if (opts.quote) {
      const key = opts.quote.laneId + "|" + opts.quote.quote;
      if (!entry.quoteKeys.has(key)) {
        entry.quoteKeys.add(key);
        entry.quotes.push(opts.quote);
      }
    }
  };

  for (const lane of Object.values(lanes)) {
    for (const step of lane.trace) {
      if (step.link) upsert(step.link, lane.laneId);
    }
    for (const finding of lane.findings) {
      for (const e of finding.evidence) {
        upsert(e.url, lane.laneId, {
          loadBearing: true,
          quote: e.quote ? { laneId: lane.laneId, quote: e.quote } : undefined,
        });
      }
    }
  }

  if (report) {
    for (const claim of report.claims) {
      for (const src of claim.sources) upsert(src, null, { loadBearing: true });
    }
  }

  const out: LinkAggregation[] = Array.from(map.values()).map((entry) => ({
    url: entry.url,
    displayUrl: entry.displayUrl,
    host: entry.host,
    path: entry.path,
    lanes: Array.from(entry.laneSet).sort(),
    refCount: entry.refCount,
    quotes: entry.quotes,
    loadBearing: entry.loadBearing,
  }));

  out.sort((a, b) => {
    if (a.loadBearing !== b.loadBearing) return a.loadBearing ? -1 : 1;
    if (b.refCount !== a.refCount) return b.refCount - a.refCount;
    return a.host.localeCompare(b.host);
  });

  return out;
}
