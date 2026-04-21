"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ResumeClaims } from "../lib/schemas";

export default function ClaimsPreview({ claims }: { claims: ResumeClaims }) {
  const reduce = useReducedMotion();

  const chips: string[] = [];
  for (const e of claims.employers.slice(0, 4)) {
    chips.push(`${e.title || "role"} @ ${e.company}`);
  }
  if (claims.linkedinUrl) chips.push("LinkedIn");
  if (claims.githubHandle) chips.push(`gh/${claims.githubHandle}`);
  for (const s of claims.schools.slice(0, 1)) chips.push(s.name);

  if (chips.length === 0) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-[10px] uppercase tracking-[0.22em] text-apollo-muted font-mono mr-1">
        Claims extracted · {chips.length}
      </span>
      {chips.map((c, i) => (
        <motion.span
          key={c + i}
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: 0.06 * i,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="apollo-chip"
        >
          {c}
        </motion.span>
      ))}
    </motion.div>
  );
}
