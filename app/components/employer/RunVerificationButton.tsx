"use client";

import { useAnalysis } from "../../context/AnalysisContext";

interface Props {
  applicationId: string;
  label?: string;
  variant?: "primary" | "secondary";
}

export function RunVerificationButton({
  applicationId,
  label = "Run verification",
  variant = "primary",
}: Props) {
  const { startFromApplication, phase } = useAnalysis();
  const running =
    phase === "uploading" ||
    phase === "parsing" ||
    phase === "analyzing" ||
    phase === "synthesizing";

  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const skin =
    variant === "primary"
      ? "bg-apollo-navy text-white hover:bg-apollo-navy-soft"
      : "border border-apollo-border-strong text-apollo-ink hover:bg-white";

  return (
    <button
      type="button"
      onClick={() => startFromApplication(applicationId)}
      disabled={running}
      className={`${base} ${skin}`}
    >
      {running ? "Running…" : label}
    </button>
  );
}
