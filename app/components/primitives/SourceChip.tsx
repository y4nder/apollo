"use client";

import { Globe } from "lucide-react";
import { useState } from "react";

interface Props {
  url: string;
  size?: "xs" | "sm";
  quote?: string;
  showPath?: boolean;
}

export function SourceChip({ url, size = "sm", quote, showPath }: Props) {
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
  const title = quote ? `"${quote}" — ${url}` : url;
  const pad = size === "xs" ? "px-2 py-0.5 text-[10.5px]" : "px-2.5 py-1 text-[11.5px]";
  const iconSize = size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={title}
      className={`group inline-flex items-center gap-1.5 ${pad} rounded-full bg-white border border-apollo-border hover:border-apollo-navy/40 hover:bg-apollo-navy/[0.03] transition-colors max-w-full`}
    >
      <span
        className={`shrink-0 ${iconSize} rounded-sm overflow-hidden flex items-center justify-center bg-apollo-paper`}
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
      <span className="font-sans text-apollo-ink truncate">
        {host}
        {showPath && path && (
          <span className="text-apollo-muted font-mono ml-1">{truncatePath(path)}</span>
        )}
      </span>
    </a>
  );
}

function truncatePath(p: string): string {
  return p.length > 20 ? p.slice(0, 18) + "…" : p;
}
