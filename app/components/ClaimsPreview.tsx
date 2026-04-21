"use client";

import { useEffect, useState } from "react";
import type { ResumeClaims } from "../lib/schemas";

export default function ClaimsPreview({ claims }: { claims: ResumeClaims }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(t);
  }, [claims]);

  if (!visible) return null;

  const chips: string[] = [];
  for (const e of claims.employers.slice(0, 4)) {
    chips.push(`${e.title || "role"} @ ${e.company}`);
  }
  if (claims.linkedinUrl) chips.push("LinkedIn");
  if (claims.githubHandle) chips.push(`gh/${claims.githubHandle}`);
  for (const s of claims.schools.slice(0, 1)) chips.push(s.name);

  return (
    <div className="apollo-fade-up flex flex-wrap items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.22em] text-apollo-muted font-mono mr-1">
        Claims extracted
      </span>
      {chips.map((c, i) => (
        <span key={i} className="apollo-chip">
          {c}
        </span>
      ))}
    </div>
  );
}
