"use client";

import type { VerificationReport as ReportT, ClaimSummary } from "../lib/schemas";

const OVERALL: Record<ReportT["overall"], { label: string; bg: string; text: string }> = {
  strong: { label: "Strong fit", bg: "bg-apollo-verify/10", text: "text-apollo-verify" },
  mixed: { label: "Mixed signals", bg: "bg-apollo-flag/10", text: "text-apollo-flag" },
  weak: { label: "Weak / contradicted", bg: "bg-apollo-contradict/10", text: "text-apollo-contradict" },
};

const CLAIM_STATUS: Record<ClaimSummary["status"], { label: string; color: string; accent: string }> = {
  verified: { label: "Verified", color: "text-apollo-verify", accent: "border-apollo-verify/40" },
  unverified: { label: "Unverified", color: "text-apollo-muted", accent: "border-apollo-border-strong" },
  flagged: { label: "Flagged", color: "text-apollo-flag", accent: "border-apollo-flag/40" },
  contradicted: { label: "Contradicted", color: "text-apollo-contradict", accent: "border-apollo-contradict/40" },
};

export default function VerificationReport({
  report,
  onReset,
}: {
  report: ReportT;
  onReset: () => void;
}) {
  const grouped: Record<ClaimSummary["status"], ClaimSummary[]> = {
    verified: [],
    flagged: [],
    contradicted: [],
    unverified: [],
  };
  for (const c of report.claims) grouped[c.status].push(c);
  const order: ClaimSummary["status"][] = ["verified", "flagged", "contradicted", "unverified"];

  const overall = OVERALL[report.overall];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 apollo-fade-up">
      <div className="flex items-start justify-between gap-6 pb-6 border-b border-apollo-border">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.22em] text-apollo-muted font-mono">
            Verification report
          </div>
          <h1 className="apollo-serif text-4xl text-apollo-ink mt-2">{report.candidateName}</h1>
          <p className="text-base text-apollo-ink/80 mt-4 leading-relaxed max-w-2xl">
            {report.summary}
          </p>
        </div>
        <div className="text-right space-y-3">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-[0.18em] ${overall.bg} ${overall.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
            {overall.label}
          </span>
          <div>
            <button
              onClick={onReset}
              className="text-xs text-apollo-muted hover:text-apollo-navy underline underline-offset-4"
            >
              Start new analysis
            </button>
          </div>
        </div>
      </div>

      {report.redFlags.length > 0 && (
        <div className="mt-6 apollo-card border-apollo-contradict/30 p-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-apollo-contradict font-mono mb-2">
            Red flags
          </div>
          <ul className="space-y-1.5">
            {report.redFlags.map((flag, i) => (
              <li key={i} className="text-sm text-apollo-ink flex gap-2">
                <span className="text-apollo-contradict font-mono mt-0.5">!</span>
                <span className="flex-1">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {order.map((status) => {
          const items = grouped[status];
          if (items.length === 0) return null;
          const cfg = CLAIM_STATUS[status];
          return (
            <section key={status}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-[10px] uppercase tracking-[0.22em] font-mono ${cfg.color}`}>
                  {cfg.label}
                </span>
                <div className="flex-1 apollo-divider" />
                <span className="text-[10px] font-mono text-apollo-muted tabular-nums">
                  {items.length}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((c, i) => (
                  <article
                    key={i}
                    className={`apollo-card border ${cfg.accent} p-4 space-y-2`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[15px] text-apollo-ink font-medium leading-snug">
                        {c.label}
                      </h3>
                      <span className="text-[10px] font-mono text-apollo-muted uppercase tracking-[0.18em] shrink-0">
                        {c.claimRef}
                      </span>
                    </div>
                    <p className="text-[13px] text-apollo-ink/80 leading-relaxed">
                      {c.rationale}
                    </p>
                    {c.sources.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                        {c.sources.slice(0, 4).map((s, j) => (
                          <a
                            key={j}
                            href={s}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-apollo-navy hover:underline truncate max-w-full"
                          >
                            {shortUrl(s)}
                          </a>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function shortUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") + (u.pathname === "/" ? "" : u.pathname);
  } catch {
    return url;
  }
}
