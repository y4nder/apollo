"use client";

import { useCallback, useRef, useState } from "react";

interface UploadDropzoneProps {
  onFile: (file: File) => void;
  maxBytes: number;
  disabled?: boolean;
}

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
        className={`w-full aspect-[4/2.2] rounded-md border-2 border-dashed transition-all text-left px-8 py-10 flex flex-col justify-between ${
          hover
            ? "border-apollo-navy bg-white shadow-[0_10px_40px_-20px_rgba(11,37,69,0.4)]"
            : "border-apollo-border-strong bg-white/80 hover:bg-white hover:border-apollo-navy/60"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-apollo-muted font-mono">
            <span className="w-2 h-2 bg-apollo-navy rounded-full" />
            Intake
          </div>
          <h3 className="apollo-serif text-3xl mt-3 text-apollo-ink leading-tight">
            Drop a candidate&apos;s resume.
          </h3>
          <p className="text-sm text-apollo-muted mt-2 max-w-sm leading-relaxed">
            PDF only, up to {Math.round(maxBytes / 1024 / 1024)} MB. Four agents verify the claims in parallel while you watch.
          </p>
        </div>
        <div className="flex items-end justify-between gap-4 pt-8">
          <div className="flex flex-wrap gap-1.5">
            {["Employer", "LinkedIn", "GitHub", "News"].map((lane) => (
              <span key={lane} className="apollo-chip">{lane}</span>
            ))}
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-apollo-navy text-white text-sm font-medium hover:bg-apollo-navy-soft transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v13m0-13l-4 4m4-4l4 4M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
      <p className="mt-4 text-xs text-apollo-muted text-center">
        Claims are verified via live browser sessions — nothing persisted, nothing shared.
      </p>
    </div>
  );
}
