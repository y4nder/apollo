"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CircleCheck, CircleX, CircleDashed, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LaneFinding } from "../lib/schemas";
import { SourceChip } from "./primitives/SourceChip";

const CONCLUSION: Record<
  LaneFinding["conclusion"],
  { label: string; color: string; bg: string; ring: string; Icon: LucideIcon }
> = {
  verified: {
    label: "Verified",
    color: "text-apollo-verify",
    bg: "bg-apollo-verify/[0.07]",
    ring: "border-apollo-verify/35",
    Icon: CircleCheck,
  },
  unverified: {
    label: "Unverified",
    color: "text-apollo-muted",
    bg: "bg-apollo-paper",
    ring: "border-apollo-border-strong",
    Icon: CircleDashed,
  },
  flagged: {
    label: "Flagged",
    color: "text-apollo-flag",
    bg: "bg-apollo-flag/[0.07]",
    ring: "border-apollo-flag/35",
    Icon: TriangleAlert,
  },
  contradicted: {
    label: "Contradicted",
    color: "text-apollo-contradict",
    bg: "bg-apollo-contradict/[0.07]",
    ring: "border-apollo-contradict/35",
    Icon: CircleX,
  },
};

const CONF_DOTS: Record<LaneFinding["confidence"], number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const GLOW_COLOR: Record<LaneFinding["conclusion"], string> = {
  verified: "var(--apollo-verify)",
  flagged: "var(--apollo-flag)",
  contradicted: "var(--apollo-contradict)",
  unverified: "var(--apollo-muted)",
};

interface Props {
  finding: LaneFinding;
  glowOnMount?: boolean;
}

export default function ClaimStatusCard({ finding, glowOnMount = true }: Props) {
  const reduce = useReducedMotion();
  const cfg = CONCLUSION[finding.conclusion];
  const dots = CONF_DOTS[finding.confidence];
  const [glow, setGlow] = useState(glowOnMount && !reduce);

  useEffect(() => {
    if (!glow) return;
    const t = window.setTimeout(() => setGlow(false), 1400);
    return () => window.clearTimeout(t);
  }, [glow]);

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-md border ${cfg.ring} ${cfg.bg} p-3 space-y-2 ${glow ? "apollo-finding-glow" : ""}`}
      style={
        glow
          ? ({ "--apollo-glow-color": GLOW_COLOR[finding.conclusion] } as CSSProperties)
          : undefined
      }
    >
      <div className="flex items-start gap-2.5">
        <cfg.Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.color}`} strokeWidth={1.75} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[9.5px] font-mono uppercase tracking-[0.22em] ${cfg.color}`}
            >
              {cfg.label}
            </span>
            <span className="text-[9.5px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
              · {finding.claimRef}
            </span>
            <span className="ml-auto inline-flex items-center gap-0.5" title={`Confidence: ${finding.confidence}`}>
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`w-1 h-1 rounded-full ${
                    i <= dots ? cfg.color.replace("text-", "bg-") : "bg-apollo-border"
                  }`}
                />
              ))}
            </span>
          </div>
          <p className="text-[13px] text-apollo-ink leading-snug mt-1.5">
            {finding.statement}
          </p>
        </div>
      </div>
      {finding.evidence.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5 pl-6">
          {finding.evidence.slice(0, 3).map((e, i) => (
            <SourceChip key={i} url={e.url} quote={e.quote} size="xs" />
          ))}
          {finding.evidence.length > 3 && (
            <span className="text-[10.5px] font-mono text-apollo-muted px-1 py-0.5 self-center">
              +{finding.evidence.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.article>
  );
}
