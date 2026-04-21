"use client";

import type { LaneFinding } from "../lib/schemas";

const CONCLUSION: Record<LaneFinding["conclusion"], { label: string; color: string; accent: string }> = {
  verified: { label: "Verified", color: "text-apollo-verify", accent: "border-l-apollo-verify" },
  unverified: { label: "Unverified", color: "text-apollo-muted", accent: "border-l-apollo-border-strong" },
  flagged: { label: "Flagged", color: "text-apollo-flag", accent: "border-l-apollo-flag" },
  contradicted: { label: "Contradicted", color: "text-apollo-contradict", accent: "border-l-apollo-contradict" },
};

export default function ClaimStatusCard({ finding }: { finding: LaneFinding }) {
  const cfg = CONCLUSION[finding.conclusion];
  return (
    <div className={`apollo-fade-up border-l-[3px] ${cfg.accent} bg-white pl-3 pr-3 py-2 text-xs space-y-1`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-apollo-muted">
          {finding.claimRef}
        </span>
        <span className={`text-[10px] font-mono uppercase tracking-[0.18em] ${cfg.color}`}>
          {cfg.label} · {finding.confidence}
        </span>
      </div>
      <p className="text-[12.5px] text-apollo-ink leading-snug">{finding.statement}</p>
      {finding.evidence.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
          {finding.evidence.slice(0, 3).map((e, i) => (
            <a
              key={i}
              href={e.url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-apollo-navy hover:underline max-w-full truncate"
              title={e.quote}
            >
              {shortUrl(e.url)}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function shortUrl(url: string) {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 24 ? u.pathname.slice(0, 22) + "…" : u.pathname;
    return u.hostname.replace(/^www\./, "") + (path === "/" ? "" : path);
  } catch {
    return url;
  }
}
