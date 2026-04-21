"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { JobWithEmployer } from "./JobMatchCard";

interface ApplyDialogProps {
  job: JobWithEmployer | null;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    email: string;
  }) => Promise<void> | void;
  submitting: boolean;
  error: string | null;
}

export function ApplyDialog(props: ApplyDialogProps) {
  const { job } = props;
  return (
    <AnimatePresence>
      {job && <DialogInner key={job.id} {...props} job={job} />}
    </AnimatePresence>
  );
}

function DialogInner({
  job,
  onClose,
  onSubmit,
  submitting,
  error,
}: ApplyDialogProps & { job: JobWithEmployer }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSubmit =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    !submitting;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-apollo-ink/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative apollo-card-strong w-full max-w-md p-6"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22 }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-apollo-muted hover:text-apollo-ink transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
          Apply · {job.employer.company_name}
        </div>
        <h3 className="apollo-serif text-[24px] mt-1.5 text-apollo-ink leading-tight">
          {job.title}
        </h3>
        <p className="text-[12.5px] text-apollo-ink/70 mt-2 leading-relaxed">
          Your resume stays with {job.employer.company_name} and Apollo. It may be verified by the hiring team before they get back to you.
        </p>
        <form
          className="mt-5 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit) return;
            await onSubmit({ name: name.trim(), email: email.trim() });
          }}
        >
          <label className="block">
            <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
              Full name
            </span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="mt-1 w-full px-3 py-2 rounded-md border border-apollo-border-strong bg-white text-sm text-apollo-ink focus:outline-none focus:border-apollo-navy focus:ring-1 focus:ring-apollo-navy/30"
              placeholder="Jordan Patel"
            />
          </label>
          <label className="block">
            <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="mt-1 w-full px-3 py-2 rounded-md border border-apollo-border-strong bg-white text-sm text-apollo-ink focus:outline-none focus:border-apollo-navy focus:ring-1 focus:ring-apollo-navy/30"
              placeholder="jordan@example.com"
            />
          </label>
          {error && (
            <p className="text-[12px] text-apollo-contradict">{error}</p>
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-md text-[13px] text-apollo-muted hover:text-apollo-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 rounded-md bg-apollo-navy text-white text-[13px] font-medium hover:bg-apollo-navy-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
