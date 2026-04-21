"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  minWidth?: number;
  tone?: "default" | "navy" | "verify" | "flag" | "contradict";
}

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-apollo-ink",
  navy: "text-apollo-navy",
  verify: "text-apollo-verify",
  flag: "text-apollo-flag",
  contradict: "text-apollo-contradict",
};

export function Stat({ label, value, icon: Icon, minWidth, tone = "default" }: Props) {
  return (
    <div
      className="flex items-center gap-2.5"
      style={minWidth ? { minWidth } : undefined}
    >
      {Icon && <Icon className="w-4 h-4 text-apollo-muted shrink-0" strokeWidth={1.75} />}
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-apollo-muted leading-none">
          {label}
        </span>
        <span className={`apollo-serif text-xl tabular-nums leading-tight mt-1 ${TONE[tone]}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
