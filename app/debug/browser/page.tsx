"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

interface DebugResponse {
  target: string;
  finalUrl: string;
  title?: string;
  loggedIn?: boolean;
  loginHint?: string;
  webdriverFlag: unknown;
  snapshot?: string;
  gotoError?: string;
  heldSeconds: number;
  elapsedMs: number;
}

const PRESETS: Array<{ label: string; url: string }> = [
  { label: "LinkedIn feed", url: "https://www.linkedin.com/feed/" },
  { label: "LinkedIn me", url: "https://www.linkedin.com/in/me/" },
  { label: "GitHub home", url: "https://github.com" },
  { label: "GitHub y4nder", url: "https://github.com/y4nder" },
];

export default function DebugBrowserPage() {
  const [url, setUrl] = useState(PRESETS[0].url);
  const [hold, setHold] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const qs = new URLSearchParams({ url, hold: String(hold) });
      const res = await fetch(`/api/debug/browser?${qs.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as DebugResponse;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [url, hold]);

  const wdFlag = result?.webdriverFlag;
  const stealthOK = wdFlag === null || wdFlag === false || wdFlag === undefined;

  return (
    <div className="flex-1 apollo-grid">
      <header className="border-b border-apollo-border bg-white/60 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-apollo-muted font-mono">
              Diagnostic tool
            </div>
            <div className="apollo-serif text-2xl text-apollo-ink mt-1">Browser probe</div>
          </div>
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.2em] text-apollo-muted hover:text-apollo-navy font-mono"
          >
            ← back to apollo
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <section className="apollo-card-strong p-5 space-y-4">
          <p className="text-sm text-apollo-ink/80 leading-relaxed">
            Launches one Stagehand session, navigates to the URL, and reports what the agent sees.
            Use this to check whether the persistent profile and stealth patch are actually working —
            no need to run the full 4-lane analysis.
          </p>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.url}
                onClick={() => setUrl(p.url)}
                className={`apollo-chip cursor-pointer ${
                  url === p.url ? "!bg-apollo-navy/10 !border-apollo-navy/40" : ""
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.22em] text-apollo-muted font-mono">
                Target URL
              </span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="px-3 py-2 bg-white border border-apollo-border rounded text-sm font-mono text-apollo-ink focus:outline-none focus:border-apollo-navy"
                placeholder="https://…"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.22em] text-apollo-muted font-mono">
                Hold (sec)
              </span>
              <input
                type="number"
                min={0}
                max={300}
                value={hold}
                onChange={(e) => setHold(Math.max(0, Math.min(300, Number(e.target.value) || 0)))}
                className="w-24 px-3 py-2 bg-white border border-apollo-border rounded text-sm font-mono text-apollo-ink focus:outline-none focus:border-apollo-navy"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-apollo-muted">
              Window stays open for <span className="font-mono">{hold}s</span> so you can inspect.
              Set <code>APOLLO_HEADLESS=false</code> to see it.
            </p>
            <button
              onClick={run}
              disabled={loading || !url.trim()}
              className="px-4 py-2 bg-apollo-navy text-white text-sm rounded hover:bg-apollo-navy-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Probing…" : "Launch"}
            </button>
          </div>
        </section>

        {error && (
          <div className="apollo-card border border-apollo-contradict/40 bg-apollo-contradict/5 p-4 text-sm text-apollo-contradict">
            {error}
          </div>
        )}

        {result && (
          <section className="apollo-card-strong p-5 space-y-4 apollo-fade-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat
                label="webdriver flag"
                value={String(result.webdriverFlag)}
                ok={stealthOK}
                okLabel="stealth holding"
                badLabel="detected"
              />
              <Stat
                label="logged in"
                value={
                  result.loggedIn === undefined
                    ? "?"
                    : result.loggedIn
                    ? "yes"
                    : "no"
                }
                ok={result.loggedIn === true}
                okLabel="authenticated"
                badLabel="guest / wall"
              />
              <Stat
                label="elapsed"
                value={`${(result.elapsedMs / 1000).toFixed(1)}s`}
                neutral
              />
              <Stat label="held" value={`${result.heldSeconds}s`} neutral />
            </div>

            <Row label="Target">
              <code className="text-xs break-all">{result.target}</code>
            </Row>
            <Row label="Final URL">
              <a
                href={result.finalUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-apollo-navy hover:underline break-all"
              >
                {result.finalUrl}
              </a>
            </Row>
            {result.title && (
              <Row label="Title">
                <span className="text-sm text-apollo-ink">{result.title}</span>
              </Row>
            )}
            {result.loginHint && (
              <Row label="Agent's tell">
                <span className="text-sm text-apollo-ink/80 italic">
                  &ldquo;{result.loginHint}&rdquo;
                </span>
              </Row>
            )}
            {result.snapshot && (
              <Row label="Snapshot">
                <p className="text-sm text-apollo-ink/80 leading-relaxed">{result.snapshot}</p>
              </Row>
            )}
            {result.gotoError && (
              <Row label="Goto error">
                <code className="text-xs text-apollo-contradict">{result.gotoError}</code>
              </Row>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  ok,
  okLabel,
  badLabel,
  neutral,
}: {
  label: string;
  value: string;
  ok?: boolean;
  okLabel?: string;
  badLabel?: string;
  neutral?: boolean;
}) {
  const color = neutral
    ? "text-apollo-ink"
    : ok
    ? "text-apollo-verify"
    : "text-apollo-contradict";
  const caption = neutral ? undefined : ok ? okLabel : badLabel;
  return (
    <div className="border border-apollo-border rounded px-3 py-2 bg-white">
      <div className="text-[9px] uppercase tracking-[0.22em] text-apollo-muted font-mono">
        {label}
      </div>
      <div className={`mt-1 font-mono text-sm ${color}`}>{value}</div>
      {caption && (
        <div className={`text-[10px] font-mono uppercase tracking-[0.18em] ${color}`}>
          {caption}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-baseline">
      <span className="text-[10px] uppercase tracking-[0.22em] text-apollo-muted font-mono shrink-0 w-24">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
