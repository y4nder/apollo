"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle2, FileText, Loader2, RefreshCw } from "lucide-react";
import UploadDropzone from "./components/UploadDropzone";
import OrbitalBackdrop from "./components/idle/OrbitalBackdrop";
import { SkillChipRow } from "./components/candidate/SkillChip";
import { JobMatchList } from "./components/candidate/JobMatchList";
import { ApplyDialog } from "./components/candidate/ApplyDialog";
import type { JobWithEmployer } from "./components/candidate/JobMatchCard";
import { rankAllJobs } from "./lib/skills/ranker";
import type {
  ExtractedSkill,
  ExtractionResult,
  MatchResult,
} from "./lib/skills/types";

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

type Phase = "idle" | "extracting" | "matched" | "error";

type JobFromApi = JobWithEmployer;

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [extracted, setExtracted] = useState<ExtractionResult | null>(null);
  const [jobs, setJobs] = useState<JobFromApi[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [applyTarget, setApplyTarget] = useState<JobFromApi | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [lastApplication, setLastApplication] = useState<{
    jobTitle: string;
    company: string;
  } | null>(null);

  const matches = useMemo<Array<MatchResult & { job: JobWithEmployer }>>(() => {
    if (!extracted || jobs.length === 0) return [];
    const userSkillNames = extracted.skills.map((s) => s.name);
    const ranked = rankAllJobs(userSkillNames, jobs);
    return ranked as Array<MatchResult & { job: JobWithEmployer }>;
  }, [extracted, jobs]);

  const startExtract = useCallback(async (droppedFile: File) => {
    setFile(droppedFile);
    setPhase("extracting");
    setError(null);
    try {
      const form = new FormData();
      form.append("file", droppedFile);
      const [extractRes, jobsRes] = await Promise.all([
        fetch("/api/extract", { method: "POST", body: form }),
        fetch("/api/jobs"),
      ]);
      if (!extractRes.ok) {
        const body = await extractRes.json().catch(() => ({ error: `HTTP ${extractRes.status}` }));
        throw new Error(body.error ?? `HTTP ${extractRes.status}`);
      }
      if (!jobsRes.ok) {
        throw new Error(`Could not load jobs (HTTP ${jobsRes.status})`);
      }
      const extractBody = (await extractRes.json()) as ExtractionResult;
      const jobsBody = (await jobsRes.json()) as { jobs: JobFromApi[] };
      setExtracted(extractBody);
      setJobs(jobsBody.jobs);
      setPhase("matched");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("error");
    }
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setFile(null);
    setExtracted(null);
    setJobs([]);
    setError(null);
    setApplyTarget(null);
    setAppliedJobIds(new Set());
    setLastApplication(null);
  }, []);

  const submitApply = useCallback(
    async ({ name, email }: { name: string; email: string }) => {
      if (!applyTarget || !file) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        const form = new FormData();
        form.append("jobId", applyTarget.id);
        form.append("candidateName", name);
        form.append("candidateEmail", email);
        form.append("file", file);
        const res = await fetch("/api/apply", { method: "POST", body: form });
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        setAppliedJobIds((prev) => new Set(prev).add(applyTarget.id));
        setLastApplication({
          jobTitle: applyTarget.title,
          company: applyTarget.employer.company_name,
        });
        setApplyTarget(null);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : String(err));
      } finally {
        setSubmitting(false);
      }
    },
    [applyTarget, file]
  );

  if (phase === "idle") {
    return (
      <div className="flex-1 flex flex-col apollo-grid relative">
        <OrbitalBackdrop />
        <div className="relative flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center px-6 py-14">
            <div className="text-center max-w-2xl mb-10">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-apollo-muted font-mono">
                <span className="w-1 h-1 rounded-full bg-apollo-verify" />
                Resume intake · MVP
              </div>
              <h1 className="apollo-serif text-[56px] mt-4 leading-[1.02] text-apollo-ink tracking-[-0.015em]">
                Drop your resume.{" "}
                <span className="relative inline-block text-apollo-navy">
                  See the roles that fit.
                  <span className="absolute left-0 right-0 -bottom-0.5 h-[6px] bg-apollo-verify/25 -z-0" />
                </span>
              </h1>
              <p className="mt-5 text-[15px] text-apollo-ink/70 leading-relaxed max-w-lg mx-auto">
                Apollo reads your resume, matches you against live openings, and
                sends your application when you&apos;re ready. The hiring team sees
                the match before they see you.
              </p>
            </div>
            <UploadDropzone onFile={startExtract} maxBytes={DEFAULT_MAX_BYTES} />
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  if (phase === "extracting") {
    return (
      <div className="flex-1 flex flex-col apollo-grid">
        <Header subtle />
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <ExtractingCard filename={file?.name ?? "resume.pdf"} />
        </main>
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
            <h2 className="apollo-serif text-2xl mt-2 text-apollo-ink">
              Couldn&apos;t read that resume
            </h2>
            <p className="text-sm text-apollo-ink/70 mt-3">{error}</p>
            <button
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-apollo-navy text-white text-sm hover:bg-apollo-navy-soft transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try another resume
            </button>
          </div>
        </main>
      </div>
    );
  }

  // matched
  return (
    <div className="flex-1 flex flex-col apollo-grid">
      <Header subtle />
      {lastApplication && (
        <AppliedBanner
          jobTitle={lastApplication.jobTitle}
          company={lastApplication.company}
          onDismiss={() => setLastApplication(null)}
        />
      )}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <SkillsPanel
            filename={file?.name ?? "resume.pdf"}
            skills={extracted?.skills ?? []}
            onReset={reset}
          />
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
                  {matches.length} roles · ranked by fit
                </div>
                <h2 className="apollo-serif text-[28px] mt-1 text-apollo-ink">
                  Matching openings
                </h2>
              </div>
            </div>
            <JobMatchList
              matches={matches}
              onApply={(job) => {
                setSubmitError(null);
                setApplyTarget(job);
              }}
              appliedJobIds={appliedJobIds}
            />
          </section>
        </div>
      </main>
      <ApplyDialog
        job={applyTarget}
        onClose={() => setApplyTarget(null)}
        onSubmit={submitApply}
        submitting={submitting}
        error={submitError}
      />
      <Footer />
    </div>
  );
}

function Header({ subtle }: { subtle?: boolean } = {}) {
  return (
    <header
      className={`border-b border-apollo-border ${subtle ? "bg-white/50" : "bg-transparent"} backdrop-blur-sm`}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Apollo logo" width={28} height={28} />
          <div>
            <div className="apollo-serif text-xl text-apollo-ink leading-none">
              Apollo
            </div>
            <div className="text-[9px] tracking-[0.28em] uppercase text-apollo-muted font-mono mt-0.5">
              Hiring due diligence
            </div>
          </div>
        </div>
        <a
          href="/employer/login"
          className="text-[11px] font-mono uppercase tracking-[0.2em] text-apollo-muted hover:text-apollo-ink transition-colors"
        >
          Employers →
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-apollo-border bg-white/40">
      <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between text-[11px] text-apollo-muted font-mono uppercase tracking-[0.2em]">
        <span>Resume stored for employer review · Verified on request</span>
        <span>v0.1 · MVP</span>
      </div>
    </footer>
  );
}

function ExtractingCard({ filename }: { filename: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="apollo-card-strong max-w-md w-full p-8 text-center"
    >
      <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
        <Loader2 className="w-3 h-3 animate-spin" />
        Reading · matching
      </div>
      <h2 className="apollo-serif text-2xl mt-2 text-apollo-ink">
        Extracting your skills
      </h2>
      <p className="text-sm text-apollo-ink/70 mt-3 leading-relaxed">
        {filename}
      </p>
      <div className="mt-5 flex items-center justify-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
        <Step label="Parse PDF" on />
        <Dot />
        <Step label="Extract skills" on />
        <Dot />
        <Step label="Rank jobs" on />
      </div>
    </motion.div>
  );
}

function Step({ label, on }: { label: string; on: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${on ? "bg-apollo-navy apollo-pulse-dot" : "bg-apollo-border-strong"}`}
      />
      <span className={on ? "text-apollo-ink/80" : "text-apollo-muted"}>
        {label}
      </span>
    </span>
  );
}

function Dot() {
  return <span className="text-apollo-border-strong">·</span>;
}

function SkillsPanel({
  filename,
  skills,
  onReset,
}: {
  filename: string;
  skills: ExtractedSkill[];
  onReset: () => void;
}) {
  return (
    <aside className="apollo-card-strong p-5 space-y-4 self-start lg:sticky lg:top-6">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
          <FileText className="w-3 h-3" />
          Your resume
        </div>
        <p className="text-sm text-apollo-ink mt-1 break-all">{filename}</p>
      </div>
      <div className="apollo-divider" />
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
            {skills.length} skills extracted
          </span>
        </div>
        <SkillChipRow skills={skills} />
        {skills.length === 0 && (
          <p className="text-[12px] text-apollo-muted italic">
            No canonical skills identified. Your resume may still match — try adding more project details.
          </p>
        )}
      </div>
      <div className="apollo-divider" />
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-apollo-muted hover:text-apollo-ink transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        Swap resume
      </button>
    </aside>
  );
}

function AppliedBanner({
  jobTitle,
  company,
  onDismiss,
}: {
  jobTitle: string;
  company: string;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="border-b border-apollo-verify/30 bg-apollo-verify/10"
      >
        <div className="max-w-[1100px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-apollo-verify shrink-0" />
            <p className="text-[13px] text-apollo-ink">
              Applied to{" "}
              <span className="font-medium">{jobTitle}</span> at{" "}
              <span className="font-medium">{company}</span>. The team will
              review — they may verify your claims first.
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-apollo-muted hover:text-apollo-ink transition-colors shrink-0"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
