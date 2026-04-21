"use client";

import type { LaneState } from "../context/AnalysisContext";

const LANE_TITLE: Record<LaneState["laneId"], string> = {
  employer: "Employer verification",
  linkedin: "LinkedIn profile",
  github: "GitHub / portfolio",
  news: "News & mentions",
};

const LANE_INDEX: Record<LaneState["laneId"], string> = {
  employer: "01",
  linkedin: "02",
  github: "03",
  news: "04",
};

const STATUS_COLOR: Record<LaneState["status"], { bg: string; dot: string; label: string }> = {
  pending: { bg: "bg-apollo-paper text-apollo-muted", dot: "bg-apollo-muted", label: "Waiting" },
  running: { bg: "bg-apollo-navy/5 text-apollo-navy", dot: "bg-apollo-navy apollo-pulse-dot", label: "Investigating" },
  ok: { bg: "bg-apollo-verify/10 text-apollo-verify", dot: "bg-apollo-verify", label: "Complete" },
  partial: { bg: "bg-apollo-flag/10 text-apollo-flag", dot: "bg-apollo-flag", label: "Partial" },
  failed: { bg: "bg-apollo-contradict/10 text-apollo-contradict", dot: "bg-apollo-contradict", label: "Failed" },
};

function shortHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

interface Props {
  lane: LaneState;
  currentUrl?: string;
}

export default function LaneHeader({ lane, currentUrl }: Props) {
  const status = STATUS_COLOR[lane.status];
  return (
    <div className="px-4 py-3 border-b border-apollo-border space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] tracking-[0.22em] uppercase text-apollo-muted font-mono w-5 shrink-0">
            {LANE_INDEX[lane.laneId]}
          </span>
          <span className="apollo-serif text-lg text-apollo-ink truncate">
            {LANE_TITLE[lane.laneId]}
          </span>
        </div>
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.18em] shrink-0 ${status.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>
      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[10.5px] font-mono text-apollo-muted hover:text-apollo-navy ml-8 max-w-full truncate"
          title={currentUrl}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="truncate">{shortHost(currentUrl)}</span>
        </a>
      )}
    </div>
  );
}
