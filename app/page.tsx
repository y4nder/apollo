"use client";

import { useAnalysis, LANE_IDS } from "./context/AnalysisContext";
import UploadDropzone from "./components/UploadDropzone";
import ClaimsPreview from "./components/ClaimsPreview";
import LaneColumn from "./components/LaneColumn";
import ProgressBar from "./components/ProgressBar";
import CancelButton from "./components/CancelButton";
import VerificationReport from "./components/VerificationReport";

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export default function Home() {
  const analysis = useAnalysis();
  const { phase, filename, claims, lanes, report, error, elapsedMs, sequential, startAnalysis, cancel, reset } = analysis;

  if (phase === "done" && report) {
    return (
      <div className="flex-1 apollo-grid">
        <Header subtle />
        <VerificationReport report={report} onReset={reset} />
      </div>
    );
  }

  if (phase === "idle") {
    return (
      <div className="flex-1 flex flex-col apollo-grid">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <div className="text-center max-w-xl mb-10">
            <div className="text-[10px] uppercase tracking-[0.24em] text-apollo-muted font-mono">
              Resume verification · MVP
            </div>
            <h1 className="apollo-serif text-5xl mt-4 leading-[1.05] text-apollo-ink">
              Four agents. One candidate. <span className="text-apollo-navy">Live receipts.</span>
            </h1>
            <p className="mt-5 text-base text-apollo-ink/70 leading-relaxed max-w-md mx-auto">
              Apollo checks employers, LinkedIn, GitHub, and the open web in parallel. You watch the browsers work — every
              click, every quote, every URL.
            </p>
          </div>
          <UploadDropzone onFile={startAnalysis} maxBytes={DEFAULT_MAX_BYTES} />
        </main>
        <Footer />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex-1 flex flex-col apollo-grid">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="apollo-card-strong max-w-lg w-full p-8 text-center">
            <div className="text-[10px] uppercase tracking-[0.22em] text-apollo-contradict font-mono">
              Halted
            </div>
            <h2 className="apollo-serif text-2xl mt-2 text-apollo-ink">Analysis failed</h2>
            <p className="text-sm text-apollo-ink/70 mt-3">{error}</p>
            <button
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-apollo-navy text-white text-sm hover:bg-apollo-navy-soft"
            >
              Try another resume
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header subtle />
      <div className="border-b border-apollo-border bg-white/60 backdrop-blur">
        <div className="max-w-[1400px] mx-auto px-6 py-4 space-y-3">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.22em] text-apollo-muted font-mono">
                Subject
              </div>
              <div className="apollo-serif text-xl text-apollo-ink truncate">
                {claims?.candidateName ?? filename ?? "Candidate"}
              </div>
              {sequential && (
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] px-2 py-0.5 rounded bg-apollo-flag/10 text-apollo-flag">
                  Sequential mode
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <CancelButton onCancel={cancel} />
            </div>
          </div>
          <ProgressBar phase={phase} lanes={lanes} elapsedMs={elapsedMs} />
          {claims && <ClaimsPreview claims={claims} />}
        </div>
      </div>
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-6">
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          {LANE_IDS.map((id) => (
            <LaneColumn key={id} lane={lanes[id]} />
          ))}
        </div>
      </main>
    </div>
  );
}

function Header({ subtle }: { subtle?: boolean } = {}) {
  return (
    <header className={`border-b border-apollo-border ${subtle ? "bg-white/50" : "bg-transparent"} backdrop-blur-sm`}>
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Apollo logo" width={28} height={28} />
          <div>
            <div className="apollo-serif text-xl text-apollo-ink leading-none">Apollo</div>
            <div className="text-[9px] tracking-[0.28em] uppercase text-apollo-muted font-mono mt-0.5">
              Hiring due diligence
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-5 text-[11px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
          <span>Local Chromium</span>
          <span className="text-apollo-border-strong">·</span>
          <span>Claude Sonnet</span>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-apollo-border bg-white/40">
      <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between text-[11px] text-apollo-muted font-mono uppercase tracking-[0.2em]">
        <span>Ephemeral · no data retained</span>
        <span>v0.1 · MVP</span>
      </div>
    </footer>
  );
}
