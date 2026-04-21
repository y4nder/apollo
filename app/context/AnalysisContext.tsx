"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  JobContext,
  LaneFinding,
  LaneId,
  LaneResult,
  ResumeClaims,
  TraceStep,
  VerificationReport,
} from "../lib/schemas";

export type Phase =
  | "idle"
  | "uploading"
  | "parsing"
  | "analyzing"
  | "synthesizing"
  | "done"
  | "error";

export type LaneStatus = "pending" | "running" | "ok" | "partial" | "failed";

export interface LaneState {
  laneId: LaneId;
  status: LaneStatus;
  trace: TraceStep[];
  findings: LaneFinding[];
  notes?: string;
}

const LANE_IDS: LaneId[] = ["employer", "linkedin", "github", "news"];

function emptyLanes(): Record<LaneId, LaneState> {
  return LANE_IDS.reduce((acc, id) => {
    acc[id] = { laneId: id, status: "pending", trace: [], findings: [] };
    return acc;
  }, {} as Record<LaneId, LaneState>);
}

function lanesFromSaved(
  laneResults: LaneResult[]
): Record<LaneId, LaneState> {
  const base = emptyLanes();
  for (const r of laneResults) {
    base[r.laneId] = {
      laneId: r.laneId,
      status: r.status,
      trace: [],
      findings: r.findings,
      notes: r.notes,
    };
  }
  return base;
}

interface AnalysisContextValue {
  phase: Phase;
  filename: string | null;
  claims: ResumeClaims | null;
  job: JobContext | null;
  lanes: Record<LaneId, LaneState>;
  report: VerificationReport | null;
  error: string | null;
  elapsedMs: number;
  concurrency: number | null;
  sequential: boolean;
  runId: string | null;
  startedAt: number | null;
  finishedAt: number | null;
  trustScore: number | null;
  startFromApplication: (applicationId: string) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export interface InitialAnalysisState {
  runId: string;
  claims: ResumeClaims;
  laneResults: LaneResult[];
  report: VerificationReport;
  trustScore: number;
  startedAt: string;
  finishedAt: string;
  filename?: string;
}

export function AnalysisProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: InitialAnalysisState;
}) {
  const initialIsDone = !!initial;
  const [phase, setPhase] = useState<Phase>(initialIsDone ? "done" : "idle");
  const [filename, setFilename] = useState<string | null>(
    initial?.filename ?? null
  );
  const [claims, setClaims] = useState<ResumeClaims | null>(
    initial?.claims ?? null
  );
  const [job, setJob] = useState<JobContext | null>(null);
  const [lanes, setLanes] = useState<Record<LaneId, LaneState>>(() =>
    initial ? lanesFromSaved(initial.laneResults) : emptyLanes()
  );
  const [report, setReport] = useState<VerificationReport | null>(
    initial?.report ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [concurrency, setConcurrency] = useState<number | null>(null);
  const [sequential, setSequential] = useState(false);
  const [runId, setRunId] = useState<string | null>(initial?.runId ?? null);
  const [startedAt, setStartedAt] = useState<number | null>(
    initial?.startedAt ? new Date(initial.startedAt).getTime() : null
  );
  const [finishedAt, setFinishedAt] = useState<number | null>(
    initial?.finishedAt ? new Date(initial.finishedAt).getTime() : null
  );
  const [trustScoreState, setTrustScoreState] = useState<number | null>(
    initial?.trustScore ?? null
  );
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    stopTimer();
    startedAtRef.current = null;
    setPhase("idle");
    setFilename(null);
    setClaims(null);
    setJob(null);
    setLanes(emptyLanes());
    setReport(null);
    setError(null);
    setElapsedMs(0);
    setConcurrency(null);
    setSequential(false);
    setRunId(null);
    setStartedAt(null);
    setFinishedAt(null);
    setTrustScoreState(null);
  }, [stopTimer]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    stopTimer();
    setPhase("idle");
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const updateLane = useCallback((laneId: LaneId, patch: Partial<LaneState>) => {
    setLanes((prev) => ({ ...prev, [laneId]: { ...prev[laneId], ...patch } }));
  }, []);

  const appendTrace = useCallback((laneId: LaneId, step: TraceStep) => {
    setLanes((prev) => {
      const lane = prev[laneId];
      if (lane.trace.some((s) => s.id === step.id)) return prev;
      return { ...prev, [laneId]: { ...lane, trace: [...lane.trace, step] } };
    });
  }, []);

  const appendFinding = useCallback((laneId: LaneId, finding: LaneFinding) => {
    setLanes((prev) => ({
      ...prev,
      [laneId]: { ...prev[laneId], findings: [...prev[laneId].findings, finding] },
    }));
  }, []);

  const handleEvent = useCallback(
    (type: string, data: unknown) => {
      switch (type) {
        case "runStarted": {
          const d = data as { runId: string; startedAt: number };
          setRunId(d.runId);
          setStartedAt(d.startedAt);
          break;
        }
        case "upload": {
          const d = data as { filename: string; bytes: number };
          if (d.filename) setFilename(d.filename);
          setPhase("parsing");
          break;
        }
        case "parsing":
          setPhase("parsing");
          break;
        case "claims":
          setClaims(data as ResumeClaims);
          setPhase("analyzing");
          break;
        case "job":
          setJob(data as JobContext);
          break;
        case "mode": {
          const d = data as { concurrency: number; sequential: boolean };
          setConcurrency(d.concurrency);
          setSequential(d.sequential);
          break;
        }
        case "laneStarted": {
          const d = data as { laneId: LaneId };
          updateLane(d.laneId, { status: "running" });
          break;
        }
        case "traceStep": {
          const d = data as { laneId: LaneId; step: TraceStep };
          appendTrace(d.laneId, d.step);
          break;
        }
        case "laneFinding": {
          const d = data as { laneId: LaneId; finding: LaneFinding };
          appendFinding(d.laneId, d.finding);
          break;
        }
        case "laneComplete": {
          const d = data as {
            laneId: LaneId;
            status: "ok" | "partial" | "failed";
            notes?: string;
          };
          updateLane(d.laneId, { status: d.status, notes: d.notes });
          break;
        }
        case "synthesizing":
          setPhase("synthesizing");
          break;
        case "report":
          setReport(data as VerificationReport);
          break;
        case "done": {
          const d = data as {
            elapsedMs: number;
            trustScore?: number;
          };
          setPhase("done");
          setFinishedAt(Date.now());
          if (typeof d.trustScore === "number") setTrustScoreState(d.trustScore);
          stopTimer();
          break;
        }
        case "error":
          setError((data as { message: string }).message);
          setPhase("error");
          setFinishedAt(Date.now());
          stopTimer();
          break;
      }
    },
    [appendFinding, appendTrace, stopTimer, updateLane]
  );

  const startFromApplication = useCallback(
    async (applicationId: string) => {
      reset();
      const controller = new AbortController();
      abortRef.current = controller;
      setPhase("uploading");
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current) {
          setElapsedMs(Date.now() - startedAtRef.current);
        }
      }, 500);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ applicationId }),
          signal: controller.signal,
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({
            error: `HTTP ${response.status}`,
          }));
          throw new Error(body.error ?? `HTTP ${response.status}`);
        }
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let eventType = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              try {
                const payload = JSON.parse(line.slice(6));
                handleEvent(eventType, payload);
              } catch {
                // ignore malformed
              }
            } else if (line === "") {
              eventType = "";
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : String(err));
        setPhase("error");
        stopTimer();
      }
    },
    [handleEvent, reset, stopTimer]
  );

  const value = useMemo<AnalysisContextValue>(
    () => ({
      phase,
      filename,
      claims,
      job,
      lanes,
      report,
      error,
      elapsedMs,
      concurrency,
      sequential,
      runId,
      startedAt,
      finishedAt,
      trustScore: trustScoreState,
      startFromApplication,
      cancel,
      reset,
    }),
    [
      phase,
      filename,
      claims,
      job,
      lanes,
      report,
      error,
      elapsedMs,
      concurrency,
      sequential,
      runId,
      startedAt,
      finishedAt,
      trustScoreState,
      startFromApplication,
      cancel,
      reset,
    ]
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}

export { LANE_IDS };
