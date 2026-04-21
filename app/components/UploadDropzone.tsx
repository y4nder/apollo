"use client";

import { useCallback, useRef, useState } from "react";
import { ArrowDown, FileText, ChevronRight } from "lucide-react";

interface UploadDropzoneProps {
  onFile: (file: File) => void;
  maxBytes: number;
  disabled?: boolean;
}

const STEPS = [
  { label: "Parse", sub: "extract claims" },
  { label: "Dispatch", sub: "4 agents in parallel" },
  { label: "Synthesize", sub: "verified dossier" },
];

export default function UploadDropzone({ onFile, maxBytes, disabled }: UploadDropzoneProps) {
  const [hover, setHover] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback(
    (file: File): string | null => {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) return "Please upload a PDF resume.";
      if (file.size > maxBytes) return `File exceeds ${Math.round(maxBytes / 1024 / 1024)} MB limit.`;
      return null;
    },
    [maxBytes]
  );

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setLocalError(err);
        return;
      }
      setLocalError(null);
      onFile(file);
    },
    [onFile, validate]
  );

  return (
    <div className="w-full max-w-xl mx-auto apollo-fade-up">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`relative w-full aspect-[4/2.1] rounded-md border-2 border-dashed transition-all text-left px-8 py-8 flex flex-col justify-between overflow-hidden ${
          hover
            ? "border-apollo-navy bg-white shadow-[0_20px_60px_-24px_rgba(11,37,69,0.45)]"
            : "border-apollo-border-strong bg-white/80 hover:bg-white hover:border-apollo-navy/60"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-apollo-muted font-mono">
            <span className="w-2 h-2 bg-apollo-navy rounded-full apollo-pulse-dot" />
            Intake
          </div>
          <h3 className="apollo-serif text-[28px] mt-3 text-apollo-ink leading-[1.1]">
            Drop a candidate&apos;s resume.
          </h3>
          <p className="text-sm text-apollo-muted mt-2 max-w-sm leading-relaxed">
            PDF only, up to {Math.round(maxBytes / 1024 / 1024)} MB. Four agents verify the claims in parallel while you watch.
          </p>
        </div>

        <div className="flex items-end justify-between gap-6 pt-4">
          <div className="flex items-center gap-1.5 text-apollo-muted/70">
            <span
              className={`w-10 h-10 rounded-full border border-dashed border-apollo-border-strong flex items-center justify-center ${hover ? "" : "apollo-bob"}`}
            >
              {hover ? (
                <FileText className="w-5 h-5 text-apollo-navy" strokeWidth={1.75} />
              ) : (
                <ArrowDown className="w-5 h-5 text-apollo-muted" strokeWidth={1.75} />
              )}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
              {hover ? "Release to upload" : "Drop or click"}
            </span>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-apollo-navy text-white text-sm font-medium hover:bg-apollo-navy-soft transition-colors shrink-0">
            <FileText className="w-3.5 h-3.5" strokeWidth={2} />
            Choose PDF
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </button>

      {localError && (
        <p className="mt-3 text-sm text-apollo-contradict text-center">{localError}</p>
      )}

      <div className="mt-5 flex items-center justify-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.18em] text-apollo-muted">
        {STEPS.map((s, i) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-apollo-border-strong" />
            <span className="text-apollo-ink/80">{s.label}</span>
            <span className="text-apollo-muted/80 normal-case tracking-normal text-[10.5px]">
              · {s.sub}
            </span>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-3 h-3 text-apollo-border-strong mx-1" strokeWidth={2} />
            )}
          </span>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-apollo-muted text-center">
        Verified via live browser sessions — nothing persisted, nothing shared.
      </p>
    </div>
  );
}
