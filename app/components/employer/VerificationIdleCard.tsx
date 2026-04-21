"use client";

import { ShieldCheck } from "lucide-react";
import { RunVerificationButton } from "./RunVerificationButton";

interface Props {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
}

export function VerificationIdleCard({
  applicationId,
  candidateName,
  jobTitle,
}: Props) {
  return (
    <div className="apollo-card-strong p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-md bg-apollo-navy/10 text-apollo-navy flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-apollo-muted">
            Verification
          </div>
          <h3 className="apollo-serif text-[20px] text-apollo-ink leading-tight mt-0.5">
            Run a background check on {candidateName}
          </h3>
          <p className="text-[13px] text-apollo-ink/70 mt-2 leading-relaxed max-w-xl">
            Apollo will spin up four parallel browser agents — employer, LinkedIn, GitHub, public
            web — and verify the resume&apos;s claims <em>for the {jobTitle} role</em>. You&apos;ll watch
            the investigation live; the trust-scored dossier persists when it finishes.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <RunVerificationButton applicationId={applicationId} />
            <span className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-apollo-muted">
              Typically 40–90 seconds
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
