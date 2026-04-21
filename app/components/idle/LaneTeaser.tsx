"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LANE_IDS } from "../../context/AnalysisContext";
import { LaneIcon, LANE_SHORT, LANE_TAGLINE } from "../primitives/Icon";

export default function LaneTeaserRow() {
  const reduce = useReducedMotion();
  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
          Four parallel agents
        </span>
        <div className="flex-1 apollo-divider" />
      </div>
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-2.5"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
        }}
      >
        {LANE_IDS.map((id, i) => {
          const Icon = LaneIcon[id];
          return (
            <motion.div
              key={id}
              variants={{
                hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 8 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="apollo-card bg-white/70 px-3.5 py-3 flex flex-col gap-1.5 hover:bg-white hover:border-apollo-border-strong transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-md bg-apollo-navy/5 flex items-center justify-center text-apollo-navy">
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <span className="apollo-serif text-[15px] text-apollo-ink leading-none">
                  {LANE_SHORT[id]}
                </span>
                <span className="ml-auto text-[9px] font-mono uppercase tracking-[0.2em] text-apollo-muted tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="text-[11.5px] text-apollo-muted leading-snug">
                {LANE_TAGLINE[id]}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
