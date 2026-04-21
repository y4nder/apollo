"use client";

import type { ExtractedSkill, SkillConfidence } from "../../lib/skills/types";

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
}

export function SkillChip({
  name,
  variant = "extracted",
  confidence,
  evidence,
}: SkillChipProps) {
  const tone = confidence ? TONE[confidence] : null;
  return (
    <span
      title={evidence ? `"${evidence}"` : tone?.label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] tracking-[0.01em] whitespace-nowrap transition-colors ${VARIANT[variant]}`}
    >
      {tone && <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />}
      {name}
    </span>
  );
}

export function SkillChipRow({ skills }: { skills: ExtractedSkill[] }) {
  if (skills.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s) => (
        <SkillChip
          key={s.name}
          name={s.name}
          variant="extracted"
          confidence={s.confidence}
          evidence={s.evidence}
        />
      ))}
    </div>
  );
}
