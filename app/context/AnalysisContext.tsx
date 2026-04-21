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
  LaneId,
  ResumeClaims,
  TraceStep,
  LaneFinding,
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

interface AnalysisContextValue {
  phase: Phase;
  filename: string | null;
  claims: ResumeClaims | null;
  lanes: Record<LaneId, LaneState>;
  report: VerificationReport | null;
  error: string | null;
  elapsedMs: number;
  concurrency: number | null;
  sequential: boolean;
  startAnalysis: (file: File) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [filename, setFilename] = useState<string | null>(null);
  const [claims, setClaims] = useState<ResumeClaims | null>(null);
  const [lanes, setLanes] = useState<Record<LaneId, LaneState>>(emptyLanes);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [concurrency, setConcurrency] = useState<number | null>(null);
  const [sequential, setSequential] = useState(false);
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
    setLanes(emptyLanes());
    setReport(null);
    setError(null);
    setElapsedMs(0);
    setConcurrency(null);
    setSequential(false);
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
        case "upload": {
          const d = data as { filename: string; bytes: number };
          setFilename(d.filename);
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
          const d = data as { laneId: LaneId; status: "ok" | "partial" | "failed"; notes?: string };
          updateLane(d.laneId, { status: d.status, notes: d.notes });
          break;
        }
        case "synthesizing":
          setPhase("synthesizing");
          break;
        case "report":
          setReport(data as VerificationReport);
          break;
        case "done":
          setPhase("done");
          stopTimer();
          break;
        case "error":
          setError((data as { message: string }).message);
          setPhase("error");
          stopTimer();
          break;
      }
    },
    [appendFinding, appendTrace, stopTimer, updateLane]
  );

  const startAnalysis = useCallback(
    async (file: File) => {
      reset();
      const controller = new AbortController();
      abortRef.current = controller;
      setFilename(file.name);
      setPhase("uploading");
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current) {
          setElapsedMs(Date.now() - startedAtRef.current);
        }
      }, 500);

      const form = new FormData();
      form.append("file", file);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          body: form,
          signal: controller.signal,
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
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
      lanes,
      report,
      error,
      elapsedMs,
      concurrency,
      sequential,
      startAnalysis,
      cancel,
      reset,
    }),
    [phase, filename, claims, lanes, report, error, elapsedMs, concurrency, sequential, startAnalysis, cancel, reset]
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}

export { LANE_IDS };
