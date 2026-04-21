"use client";

import {
  AnalysisProvider,
  type InitialAnalysisState,
  useAnalysis,
  LANE_IDS,
} from "../../context/AnalysisContext";
import MissionStrip from "../MissionStrip";
import LaneColumn from "../LaneColumn";
import VerificationReport from "../VerificationReport";
import ClaimsPreview from "../ClaimsPreview";
import { RunVerificationButton } from "./RunVerificationButton";
import { VerificationIdleCard } from "./VerificationIdleCard";
import { ShieldX } from "lucide-react";

interface ShellProps {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  initial?: InitialAnalysisState;
}

export function EmployerApplicationShell(props: ShellProps) {
  return (
    <AnalysisProvider initial={props.initial}>
      <ShellInner {...props} />
    </AnalysisProvider>
  );
}

function ShellInner({
  applicationId,
  candidateName,
  jobTitle,
  company,
}: ShellProps) {
  const {
    phase,
    report,
    claims,
    lanes,
    runId,
    startedAt,
    finishedAt,
    elapsedMs,
    concurrency,
    sequential,
    filename,
    error,
    reset,
    cancel,
  } = useAnalysis();

  const isRunning =
    phase === "uploading" ||
    phase === "parsing" ||
    phase === "analyzing" ||
    phase === "synthesizing";

  return (
    <div>
      {phase === "idle" && (
        <VerificationIdleCard
          applicationId={applicationId}
          candidateName={candidateName}
          jobTitle={jobTitle}
        />
      )}

        {phase === "error" && (
          <div className="apollo-card-strong p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-apollo-contradict/10 text-apollo-contradict flex items-center justify-center shrink-0">
                <ShieldX className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-contradict">
                  Halted
                </div>
                <h3 className="apollo-serif text-[20px] text-apollo-ink leading-tight mt-0.5">
                  Verification failed
                </h3>
                <p className="text-[13px] text-apollo-ink/75 mt-2">{error}</p>
                <div className="mt-4 flex items-center gap-2">
                  <RunVerificationButton
                    applicationId={applicationId}
                    label="Try again"
                  />
                  <button
                    type="button"
                    onClick={reset}
                    className="px-3 py-2 text-[12.5px] text-apollo-muted hover:text-apollo-ink transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isRunning && (
          <div className="apollo-card-strong overflow-hidden">
            <MissionStrip
              phase={phase}
              subject={candidateName}
              lanes={lanes}
              elapsedMs={elapsedMs}
              sequential={sequential}
              onCancel={cancel}
            />
            {claims && (
              <div className="border-b border-apollo-border bg-white/40">
                <div className="max-w-[1400px] mx-auto px-5 py-2.5">
                  <ClaimsPreview claims={claims} />
                </div>
              </div>
            )}
            <div className="p-5">
              <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
                {LANE_IDS.map((id) => (
                  <LaneColumn key={id} lane={lanes[id]} />
                ))}
              </div>
            </div>
          </div>
        )}

      {phase === "done" && report && (
        <div>
          <VerificationReport
            report={report}
            lanes={lanes}
            claims={claims}
            runId={runId}
            startedAt={startedAt}
            finishedAt={finishedAt}
            elapsedMs={elapsedMs}
            concurrency={concurrency}
            sequential={sequential}
            filename={filename}
            onReset={reset}
          />
          <div className="mt-4 flex items-center justify-end gap-3 text-[11px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
            <span>
              Saved to <span className="text-apollo-ink/80">{company}</span>
            </span>
            <span className="text-apollo-border-strong">·</span>
            <RunVerificationButton
              applicationId={applicationId}
              label="Re-verify"
              variant="secondary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
