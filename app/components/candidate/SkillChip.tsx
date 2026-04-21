"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import type {
  CanonicalSkillName,
  ExtractedSkill,
  LearningResource,
  SkillConfidence,
} from "../../lib/skills/types";
import { SKILL_META } from "../../lib/skills/learning";

const TONE: Record<
  SkillConfidence,
  { dot: string; label: string }
> = {
  high: { dot: "bg-apollo-verify", label: "High confidence" },
  medium: { dot: "bg-apollo-navy", label: "Medium confidence" },
  low: { dot: "bg-apollo-muted", label: "Low confidence" },
};

type Variant = "extracted" | "matched" | "adjacent" | "missing-core" | "missing-nice";

const VARIANT: Record<Variant, string> = {
  extracted:
    "bg-white/80 border-apollo-border text-apollo-ink hover:bg-white",
  matched:
    "bg-apollo-verify/10 border-apollo-verify/25 text-apollo-verify",
  adjacent:
    "bg-apollo-navy/5 border-apollo-navy/20 text-apollo-navy",
  "missing-core":
    "bg-apollo-contradict/10 border-apollo-contradict/25 text-apollo-contradict",
  "missing-nice":
    "bg-apollo-flag/10 border-apollo-flag/25 text-apollo-flag",
};

interface SkillChipProps {
  name: string;
  variant?: Variant;
  confidence?: SkillConfidence;
  evidence?: string;
  title?: string;
  /** Canonical skill name used to look up learning resources. Defaults to `name`. */
  lookupName?: CanonicalSkillName;
  /** When true, the chip becomes a clickable button that expands a learning panel below. */
  expandable?: boolean;
  /** When true, the chip plays a one-shot pulse glow on mount. */
  pulse?: boolean;
}

export function SkillChip({
  name,
  variant = "extracted",
  confidence,
  evidence,
  title,
  lookupName,
  expandable,
  pulse,
}: SkillChipProps) {
  const tone = confidence ? TONE[confidence] : null;
  const [open, setOpen] = useState(false);
  const pulseClass = pulse ? "apollo-match-pulse" : "";

  const chipTitle =
    title ?? (evidence ? `"${evidence}"` : tone?.label);

  if (!expandable) {
    return (
      <span
        title={chipTitle}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] tracking-[0.01em] whitespace-nowrap transition-colors ${VARIANT[variant]} ${pulseClass}`}
      >
        {tone && <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />}
        {name}
      </span>
    );
  }

  const meta = SKILL_META[lookupName ?? name];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={chipTitle}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] tracking-[0.01em] whitespace-nowrap transition-colors cursor-pointer ${VARIANT[variant]} ${pulseClass}`}
      >
        {tone && <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />}
        {name}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && meta && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="basis-full overflow-hidden"
          >
            <LearningPanel skill={name} meta={meta} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function pickTopTwo(resources: LearningResource[]): LearningResource[] {
  const youtube = resources.find((r) => r.platform === "YouTube");
  const coursera = resources.find((r) => r.platform === "Coursera");
  const picked: LearningResource[] = [];
  if (youtube) picked.push(youtube);
  if (coursera) picked.push(coursera);
  if (picked.length < 2) {
    for (const r of resources) {
      if (picked.includes(r)) continue;
      picked.push(r);
      if (picked.length === 2) break;
    }
  }
  return picked.slice(0, 2);
}

function LearningPanel({
  skill,
  meta,
}: {
  skill: string;
  meta: { difficulty: string; estimated_hours: number; learning: LearningResource[] };
}) {
  const reduce = useReducedMotion();
  const picks = pickTopTwo(meta.learning);
  return (
    <motion.div
      initial={reduce ? false : { y: -4 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-1.5 rounded-md border border-apollo-border bg-white/80 px-3 py-2.5"
    >
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
        <span>Learn · {skill}</span>
        <span className="text-apollo-border-strong">·</span>
        <span className="text-apollo-navy">{meta.difficulty}</span>
        <span className="text-apollo-border-strong">·</span>
        <span className="tabular-nums">~{meta.estimated_hours}h</span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {picks.map((r) => (
          <li key={r.url}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-apollo-navy hover:text-apollo-ink transition-colors"
            >
              <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-apollo-muted shrink-0">
                {r.platform}
              </span>
              <span className="truncate">{r.title}</span>
              <ExternalLink className="w-3 h-3 shrink-0 text-apollo-muted" />
            </a>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function SkillChipRow({ skills }: { skills: ExtractedSkill[] }) {
  const reduce = useReducedMotion();
  if (skills.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s, i) => (
        <motion.span
          key={s.name}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex"
        >
          <SkillChip
            name={s.name}
            variant="extracted"
            confidence={s.confidence}
            evidence={s.evidence}
          />
        </motion.span>
      ))}
    </div>
  );
}
