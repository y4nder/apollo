"use client";

import { Globe, ExternalLink } from "lucide-react";
import { useState } from "react";

interface Props {
  url: string;
  size?: "sm" | "md";
  label?: string;
}

export default function SiteCard({ url, size = "sm", label }: Props) {
  const [failed, setFailed] = useState(false);
  let host = url;
  let path = "";
  try {
    const u = new URL(url);
    host = u.hostname.replace(/^www\./, "");
    path = u.pathname === "/" ? "" : u.pathname;
  } catch {
    // keep url as-is
  }

  const favicon = `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  const icon = size === "md" ? "w-5 h-5" : "w-4 h-4";
  const padding = size === "md" ? "px-2.5 py-1.5" : "px-2 py-1";
  const hostFont = size === "md" ? "text-[12.5px]" : "text-[11.5px]";
  const pathFont = size === "md" ? "text-[10.5px]" : "text-[10px]";

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={url}
      className={`group inline-flex items-center gap-2 ${padding} rounded-md bg-white border border-apollo-border hover:border-apollo-navy/40 hover:bg-apollo-navy/[0.02] transition-colors max-w-full`}
    >
      <span
        className={`shrink-0 ${icon} rounded-sm overflow-hidden flex items-center justify-center bg-apollo-paper`}
      >
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
      <span className="flex flex-col min-w-0 leading-tight">
        {label && (
          <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-apollo-muted leading-none">
            {label}
          </span>
        )}
        <span className="flex items-baseline gap-1.5 min-w-0">
          <span className={`${hostFont} text-apollo-ink font-sans truncate`}>{host}</span>
          {path && (
            <span className={`${pathFont} font-mono text-apollo-muted truncate`}>
              {truncatePath(path)}
            </span>
          )}
        </span>
      </span>
      <ExternalLink
        className="w-3 h-3 text-apollo-muted/60 group-hover:text-apollo-navy shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        strokeWidth={2}
      />
    </a>
  );
}

function truncatePath(p: string): string {
  return p.length > 24 ? p.slice(0, 22) + "…" : p;
}
