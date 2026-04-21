"use client";

import type { TraceStep } from "../lib/schemas";

const ICONS: Record<TraceStep["type"], { color: string; char: string; label: string }> = {
  thought: { color: "text-apollo-muted", char: "◆", label: "Thought" },
  action: { color: "text-apollo-navy", char: "→", label: "Action" },
  observation: { color: "text-apollo-ink", char: "●", label: "Observation" },
  finding: { color: "text-apollo-verify", char: "✓", label: "Finding" },
  error: { color: "text-apollo-contradict", char: "✕", label: "Error" },
};

export default function TraceStepItem({ step }: { step: TraceStep }) {
  const cfg = ICONS[step.type];
  return (
    <div className="apollo-fade-up flex gap-2 text-[11.5px] leading-relaxed py-1.5 border-b border-apollo-border/60 last:border-b-0">
      <span className={`font-mono shrink-0 w-4 text-center ${cfg.color}`}>{cfg.char}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className={`text-[9px] uppercase tracking-[0.2em] font-mono ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>
        <div className="text-apollo-ink whitespace-pre-wrap break-words">{step.text}</div>
        {step.link && (
          <a
            href={step.link}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-apollo-navy hover:underline inline-block mt-0.5 truncate max-w-full"
          >
            {step.link}
          </a>
        )}
      </div>
    </div>
  );
}
