"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  OctagonAlert,
  CircleCheck,
  CircleX,
  CircleDashed,
  TriangleAlert,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { VerificationReport as ReportT, ClaimSummary } from "../lib/schemas";
import type { LaneState } from "../context/AnalysisContext";
import { LANE_IDS } from "../context/AnalysisContext";
import { Gauge } from "./primitives/Gauge";
import { StackedBar, type BarSegment } from "./primitives/StackedBar";
import { SourceChip } from "./primitives/SourceChip";
import { LaneIcon, LANE_SHORT } from "./primitives/Icon";
import TimelineStep from "./TimelineStep";
import {
  buildEvidenceTrail,
  laneBreakdown,
  claimsBreakdown,
  trustScore,
  uniqueSources,
} from "../lib/evidenceTrail";

const OVERALL: Record<
  ReportT["overall"],
  { label: string; pill: string; Icon: LucideIcon; iconColor: string }
> = {
  strong: {
    label: "Strong fit",
    pill: "bg-apollo-verify/10 text-apollo-verify border-apollo-verify/20",
    Icon: ShieldCheck,
    iconColor: "text-apollo-verify",
  },
  mixed: {
    label: "Mixed signals",
    pill: "bg-apollo-flag/10 text-apollo-flag border-apollo-flag/20",
    Icon: ShieldAlert,
    iconColor: "text-apollo-flag",
  },
  weak: {
    label: "Weak · contradicted",
    pill: "bg-apollo-contradict/10 text-apollo-contradict border-apollo-contradict/20",
    Icon: ShieldX,
    iconColor: "text-apollo-contradict",
  },
};

const CLAIM_STATUS: Record<
  ClaimSummary["status"],
  { label: string; color: string; bg: string; Icon: LucideIcon; rank: number }
> = {
  verified: {
    label: "Verified",
    color: "text-apollo-verify",
    bg: "bg-apollo-verify/[0.06] border-apollo-verify/25",
    Icon: CircleCheck,
    rank: 0,
  },
  flagged: {
    label: "Flagged",
    color: "text-apollo-flag",
    bg: "bg-apollo-flag/[0.06] border-apollo-flag/25",
    Icon: TriangleAlert,
    rank: 1,
  },
  contradicted: {
    label: "Contradicted",
    color: "text-apollo-contradict",
    bg: "bg-apollo-contradict/[0.06] border-apollo-contradict/25",
    Icon: CircleX,
    rank: 2,
  },
  unverified: {
    label: "Unverified",
    color: "text-apollo-muted",
    bg: "bg-apollo-paper border-apollo-border",
    Icon: CircleDashed,
    rank: 3,
  },
};

const BREAKDOWN_SEGMENTS: Array<{
  key: keyof ReturnType<typeof claimsBreakdown>;
  label: string;
  color: string;
}> = [
  { key: "verified", label: "Verified", color: "var(--apollo-verify)" },
  { key: "flagged", label: "Flagged", color: "var(--apollo-flag)" },
  { key: "contradicted", label: "Contradicted", color: "var(--apollo-contradict)" },
  { key: "unverified", label: "Unverified", color: "var(--apollo-border-strong)" },
];

interface Props {
  report: ReportT;
  lanes: Record<LaneState["laneId"], LaneState>;
  onReset: () => void;
}

export default function VerificationReport({ report, lanes, onReset }: Props) {
  const reduce = useReducedMotion();
  const breakdown = useMemo(() => claimsBreakdown(report.claims), [report.claims]);
  const score = useMemo(() => trustScore(report.claims), [report.claims]);
  const total = report.claims.length;
  const breakdownFractions = total === 0
    ? { verified: 0, flagged: 0, contradicted: 0, unverified: 0 }
    : {
        verified: breakdown.verified / total,
        flagged: breakdown.flagged / total,
        contradicted: breakdown.contradicted / total,
        unverified: breakdown.unverified / total,
      };

  const overall = OVERALL[report.overall];
  const OverallIcon = overall.Icon;
  const sources = useMemo(() => uniqueSources(report.claims), [report.claims]);

  const grouped = useMemo(() => {
    const g: Record<ClaimSummary["status"], ClaimSummary[]> = {
      verified: [],
      flagged: [],
      contradicted: [],
      unverified: [],
    };
    for (const c of report.claims) g[c.status].push(c);
    return g;
  }, [report.claims]);

  const order: ClaimSummary["status"][] = ["verified", "flagged", "contradicted", "unverified"];
  const now = new Date();
  const dateLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const stackedSegments: BarSegment[] = BREAKDOWN_SEGMENTS.map((s) => ({
    key: s.key,
    label: s.label,
    value: breakdown[s.key],
    color: s.color,
  }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 apollo-fade-up">
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="apollo-glass rounded-lg border border-apollo-border-strong px-8 py-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-10 items-center"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-apollo-muted font-mono">
            <Sparkles className="w-3 h-3 text-apollo-navy" strokeWidth={1.75} />
            Verification dossier · {dateLabel}
          </div>
          <h1 className="apollo-serif text-[56px] leading-[1] mt-4 text-apollo-ink tracking-[-0.015em]">
            {report.candidateName}
          </h1>
          <div className="mt-5 inline-flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.2em] border ${overall.pill}`}
            >
              <OverallIcon className={`w-3.5 h-3.5 ${overall.iconColor}`} strokeWidth={1.75} />
              {overall.label}
            </span>
            <span className="text-[11px] font-mono text-apollo-muted uppercase tracking-[0.2em]">
              {report.claims.length} claims assessed
            </span>
          </div>
          <p className="mt-6 text-[16px] text-apollo-ink/80 leading-[1.55] max-w-xl">
            {report.summary}
          </p>
          <div className="mt-6">
            <button
              onClick={onReset}
              className="text-[11px] font-mono uppercase tracking-[0.22em] text-apollo-muted hover:text-apollo-navy underline underline-offset-4"
            >
              Start new analysis →
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <Gauge score={score} breakdown={breakdownFractions} size={220} />
          <div className="mt-5 w-[220px] space-y-1.5">
            {BREAKDOWN_SEGMENTS.map((s) => (
              <div
                key={s.key}
                className="flex items-center gap-2 text-[11px] tabular-nums"
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-apollo-ink flex-1">{s.label}</span>
                <span className="text-apollo-muted">{breakdown[s.key]}</span>
                <span className="text-apollo-muted tabular-nums w-9 text-right">
                  {total === 0 ? "—" : `${Math.round((breakdown[s.key] / total) * 100)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <LaneSummaryStrip lanes={lanes} />

      {report.redFlags.length > 0 && (
        <motion.section
          initial={reduce ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 bg-apollo-contradict/[0.04] border-l-[3px] border-apollo-contradict rounded-md px-5 py-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <OctagonAlert className="w-4 h-4 text-apollo-contradict" strokeWidth={1.75} />
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-apollo-contradict">
              Critical concerns · {report.redFlags.length}
            </span>
          </div>
          <ul className="space-y-2">
            {report.redFlags.map((flag, i) => (
              <li key={i} className="flex gap-2.5 text-[13.5px] text-apollo-ink leading-snug">
                <TriangleAlert
                  className="w-3.5 h-3.5 text-apollo-contradict shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <span className="flex-1">{flag}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-apollo-muted">
              Claims assessed
            </div>
            <div className="apollo-serif text-3xl text-apollo-ink tabular-nums mt-1">
              {report.claims.length}
            </div>
          </div>
          <div className="flex-1 min-w-[240px] max-w-md">
            <StackedBar segments={stackedSegments} height={10} />
          </div>
        </div>

        <div className="space-y-8 mt-8">
          {order.map((status) => {
            const items = grouped[status];
            if (items.length === 0) return null;
            const cfg = CLAIM_STATUS[status];
            return (
              <div key={status}>
                <div className="flex items-center gap-3 mb-4">
                  <cfg.Icon className={`w-4 h-4 ${cfg.color}`} strokeWidth={1.75} />
                  <span
                    className={`text-[10.5px] uppercase tracking-[0.24em] font-mono ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                  <div className="flex-1 apollo-divider" />
                  <span className="text-[10.5px] font-mono text-apollo-muted tabular-nums">
                    {items.length}
                  </span>
                </div>
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.06 } },
                  }}
                  className="grid gap-3 md:grid-cols-2"
                >
                  {items.map((c) => (
                    <ClaimCard key={c.claimRef} claim={c} lanes={lanes} />
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>
      </section>

      {sources.length > 0 && (
        <section className="mt-14 pt-6 border-t border-apollo-border">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-apollo-muted">
              Sources consulted · {sources.length} {sources.length === 1 ? "domain" : "domains"}
            </span>
            <div className="flex-1 apollo-divider" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s) => (
              <SourceChip key={s} url={s} size="xs" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function LaneSummaryStrip({ lanes }: { lanes: Record<LaneState["laneId"], LaneState> }) {
  return (
    <section className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {LANE_IDS.map((id) => {
        const lane = lanes[id];
        const Icon = LaneIcon[id];
        const b = laneBreakdown(lane);
        const totalFindings = b.verified + b.flagged + b.contradicted + b.unverified;
        const segs: BarSegment[] = [
          { key: "verified", label: "V", value: b.verified, color: "var(--apollo-verify)" },
          { key: "flagged", label: "F", value: b.flagged, color: "var(--apollo-flag)" },
          { key: "contradicted", label: "C", value: b.contradicted, color: "var(--apollo-contradict)" },
          { key: "unverified", label: "U", value: b.unverified, color: "var(--apollo-border-strong)" },
        ];
        return (
          <div
            key={id}
            className="apollo-card-strong px-4 py-3.5 flex flex-col gap-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-apollo-navy/5 flex items-center justify-center text-apollo-navy shrink-0">
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </span>
              <span className="apollo-serif text-[14.5px] text-apollo-ink leading-none truncate">
                {LANE_SHORT[id]}
              </span>
              <span className="ml-auto text-[10px] font-mono tabular-nums text-apollo-muted uppercase tracking-[0.18em]">
                {totalFindings}
              </span>
            </div>
            <StackedBar segments={segs} height={6} showLegend={false} />
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] tabular-nums text-apollo-muted mt-0.5">
              {b.verified > 0 && (
                <span>
                  <span className="text-apollo-verify">{b.verified}</span> verified
                </span>
              )}
              {b.flagged > 0 && (
                <span>
                  <span className="text-apollo-flag">{b.flagged}</span> flagged
                </span>
              )}
              {b.contradicted > 0 && (
                <span>
                  <span className="text-apollo-contradict">{b.contradicted}</span> contradicted
                </span>
              )}
              {b.unverified > 0 && (
                <span>{b.unverified} unverified</span>
              )}
              {totalFindings === 0 && <span>no findings</span>}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ClaimCard({
  claim,
  lanes,
}: {
  claim: ClaimSummary;
  lanes: Record<LaneState["laneId"], LaneState>;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const cfg = CLAIM_STATUS[claim.status];
  const trail = useMemo(() => buildEvidenceTrail(claim, lanes), [claim, lanes]);
  const evidenceQuotes = useMemo<Array<{ url: string; quote?: string; laneId: LaneState["laneId"] }>>(() => {
    const seen = new Set<string>();
    const out: Array<{ url: string; quote?: string; laneId: LaneState["laneId"] }> = [];
    for (const lane of Object.values(lanes)) {
      for (const f of lane.findings) {
        if (f.claimRef !== claim.claimRef) continue;
        for (const e of f.evidence) {
          const key = e.url + "|" + (e.quote ?? "");
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({ url: e.url, quote: e.quote, laneId: lane.laneId });
        }
      }
    }
    return out;
  }, [claim, lanes]);

  const laneStart =
    trail.length > 0 ? trail[0].timestamp : undefined;

  return (
    <motion.article
      variants={{
        hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 10 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={`rounded-md border p-4 space-y-3 ${cfg.bg}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`w-7 h-7 rounded-full bg-white border border-apollo-border flex items-center justify-center shrink-0 ${cfg.color}`}
        >
          <cfg.Icon className="w-4 h-4" strokeWidth={1.75} />
        </span>
        <h3 className="apollo-serif text-[17px] text-apollo-ink leading-snug flex-1 min-w-0">
          {claim.label}
        </h3>
        <span className="text-[10px] font-mono text-apollo-muted uppercase tracking-[0.18em] shrink-0 mt-1.5">
          {claim.claimRef}
        </span>
      </div>
      <p className="text-[13.5px] text-apollo-ink/80 leading-relaxed">
        {claim.rationale}
      </p>
      {claim.sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {claim.sources.slice(0, 4).map((s) => (
            <SourceChip key={s} url={s} size="xs" />
          ))}
          {claim.sources.length > 4 && (
            <span className="text-[10.5px] font-mono text-apollo-muted px-2 py-0.5 self-center">
              +{claim.sources.length - 4} more
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-left text-[10.5px] font-mono uppercase tracking-[0.22em] text-apollo-muted hover:text-apollo-navy transition-colors border-t border-apollo-border/60 pt-3"
      >
        <span>Why this verdict</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <motion.div
          initial={reduce ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          {trail.length > 0 ? (
            <div className="mt-1">
              <div className="text-[9.5px] font-mono uppercase tracking-[0.22em] text-apollo-muted mb-2">
                Reasoning trail
              </div>
              <ol className="relative apollo-rail pt-1">
                {trail.map((step) => (
                  <TimelineStep
                    key={step.id}
                    step={step}
                    lineStartMs={laneStart}
                    showLaneTag={LANE_SHORT[step.laneId]}
                    compact
                  />
                ))}
              </ol>
            </div>
          ) : evidenceQuotes.length > 0 ? (
            <div className="mt-1 space-y-2.5">
              <div className="text-[9.5px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
                Evidence
              </div>
              {evidenceQuotes.map((e, i) => (
                <EvidenceQuote key={i} url={e.url} quote={e.quote} laneId={e.laneId} />
              ))}
            </div>
          ) : (
            <div className="mt-1 text-[11.5px] text-apollo-muted italic">
              No direct evidence captured for this claim.
            </div>
          )}
        </motion.div>
      )}
    </motion.article>
  );
}

function EvidenceQuote({
  url,
  quote,
  laneId,
}: {
  url: string;
  quote?: string;
  laneId: LaneState["laneId"];
}) {
  return (
    <div className="border-l-2 border-apollo-border-strong pl-3 py-0.5">
      <div className="text-[9.5px] font-mono uppercase tracking-[0.22em] text-apollo-muted mb-1">
        {LANE_SHORT[laneId]}
      </div>
      {quote && (
        <blockquote className="text-[12.5px] text-apollo-ink italic leading-snug">
          &ldquo;{quote}&rdquo;
        </blockquote>
      )}
      <div className="mt-1.5">
        <SourceChip url={url} size="xs" />
      </div>
    </div>
  );
}
