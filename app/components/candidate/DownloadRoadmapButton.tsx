"use client";

import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { rankGaps } from "../../lib/skills/gaps";
import type {
  ExtractedSkill,
  Job,
  MatchResult,
} from "../../lib/skills/types";

interface DownloadRoadmapButtonProps {
  extractedSkills: ExtractedSkill[];
  matches: MatchResult[];
  /** Full job dataset — used to compute leverage across all roles, not just top 3. */
  jobs: Job[];
  resumeFilename?: string;
}

/**
 * One-click export of the candidate's analysis as a polished PDF.
 *
 * The jsPDF module is heavy (~200KB+) so we dynamic-import it inside the
 * click handler. It never appears in the initial page bundle.
 */
export function DownloadRoadmapButton({
  extractedSkills,
  matches,
  jobs,
  resumeFilename,
}: DownloadRoadmapButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const disabled = matches.length === 0 || isGenerating;

  const handleDownload = async () => {
    if (disabled) return;
    setIsGenerating(true);
    try {
      const { generateRoadmapPdf } = await import(
        "../../lib/roadmap-pdf"
      );
      const userSkillNames = extractedSkills.map((s) => s.name);
      const gaps = rankGaps(userSkillNames, jobs);
      await generateRoadmapPdf({
        extractedSkills,
        matches,
        gaps,
        resumeFilename,
      });
      toast.success("Roadmap PDF downloaded");
    } catch (err) {
      console.error("Roadmap PDF generation failed", err);
      toast.error("Couldn't generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-apollo-navy text-white text-[12px] font-mono uppercase tracking-[0.16em] hover:bg-apollo-navy-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <FileDown className="w-3.5 h-3.5" />
          Download roadmap (PDF)
        </>
      )}
    </button>
  );
}
