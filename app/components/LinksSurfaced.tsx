"use client";

import { useState } from "react";
import { Globe, CircleCheck, CircleDashed } from "lucide-react";
import type { LaneId } from "../lib/schemas";
import type { LinkAggregation } from "../lib/evidenceTrail";
import { LaneIcon, LANE_SHORT } from "./primitives/Icon";

interface Props {
  links: LinkAggregation[];
}

export default function LinksSurfaced({ links }: Props) {
  if (links.length === 0) return null;
  const loadBearing = links.filter((l) => l.loadBearing).length;

  return (
    <section className="mt-14 pt-6 border-t border-apollo-border">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-apollo-muted">
          Links surfaced · {links.length} {links.length === 1 ? "URL" : "URLs"}
          {loadBearing > 0 && (
            <>
              {" · "}
              <span className="text-apollo-verify">{loadBearing} load-bearing</span>
            </>
          )}
        </span>
        <div className="flex-1 apollo-divider" />
        <span className="hidden sm:inline-flex items-center gap-3 text-[9.5px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
          <span className="inline-flex items-center gap-1">
            <CircleCheck className="w-3 h-3 text-apollo-verify" strokeWidth={2} />
            Cited
          </span>
          <span className="inline-flex items-center gap-1">
            <CircleDashed className="w-3 h-3 text-apollo-muted" strokeWidth={2} />
            Visited
          </span>
        </span>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {links.map((link) => (
          <LinkRow key={link.url} link={link} />
        ))}
      </div>
    </section>
  );
}

function LinkRow({ link }: { link: LinkAggregation }) {
  const [failed, setFailed] = useState(false);
  const favicon = `https://www.google.com/s2/favicons?domain=${link.host}&sz=64`;
  const truncatedPath =
    link.path.length > 28 ? link.path.slice(0, 26) + "…" : link.path;
  const accent = link.loadBearing
    ? "border-l-apollo-verify/60"
    : "border-l-apollo-border";

  return (
    <a
      href={link.displayUrl}
      target="_blank"
      rel="noreferrer"
      className={`group flex flex-col gap-1.5 rounded-md bg-white border border-apollo-border border-l-[3px] ${accent} px-3 py-2.5 hover:border-apollo-navy/40 hover:bg-apollo-navy/[0.03] transition-colors min-w-0`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="shrink-0 w-4 h-4 rounded-sm overflow-hidden flex items-center justify-center bg-apollo-paper">
          {failed ? (
            <Globe className="w-full h-full p-0.5 text-apollo-muted" strokeWidth={2} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={favicon}
              alt=""
              width={16}
              height={16}
              loading="lazy"
              onError={() => setFailed(true)}
              className="w-full h-full object-contain"
            />
          )}
        </span>
        <span className="text-[12.5px] text-apollo-ink truncate min-w-0">
          {link.host}
          {truncatedPath && (
            <span className="text-apollo-muted font-mono ml-1">{truncatedPath}</span>
          )}
        </span>
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <LaneBadges lanes={link.lanes} />
          <span className="text-[10.5px] font-mono tabular-nums text-apollo-muted">
            ×{link.refCount}
          </span>
        </div>
      </div>
      {link.quotes.length > 0 && (
        <div className="pl-6 space-y-1">
          {link.quotes.slice(0, 2).map((q, i) => (
            <blockquote
              key={i}
              className="border-l-2 border-apollo-border-strong pl-2 text-[12px] text-apollo-ink/80 italic leading-snug"
            >
              <span className="not-italic text-[9.5px] font-mono uppercase tracking-[0.22em] text-apollo-muted mr-1.5">
                {LANE_SHORT[q.laneId]}
              </span>
              &ldquo;{q.quote}&rdquo;
            </blockquote>
          ))}
        </div>
      )}
    </a>
  );
}

function LaneBadges({ lanes }: { lanes: LaneId[] }) {
  if (lanes.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-0.5">
      {lanes.map((id) => {
        const Icon = LaneIcon[id];
        return (
          <span
            key={id}
            title={LANE_SHORT[id]}
            className="w-4 h-4 rounded-sm bg-apollo-navy/5 text-apollo-navy flex items-center justify-center"
          >
            <Icon className="w-2.5 h-2.5" strokeWidth={2} />
          </span>
        );
      })}
    </span>
  );
}
