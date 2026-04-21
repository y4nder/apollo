import { Briefcase, IdCard, GitBranch, Newspaper, type LucideIcon } from "lucide-react";
import type { LaneId } from "../../lib/schemas";

export const LaneIcon: Record<LaneId, LucideIcon> = {
  employer: Briefcase,
  linkedin: IdCard,
  github: GitBranch,
  news: Newspaper,
};

export const LANE_TITLE: Record<LaneId, string> = {
  employer: "Employer verification",
  linkedin: "LinkedIn profile",
  github: "GitHub / portfolio",
  news: "News & mentions",
};

export const LANE_SHORT: Record<LaneId, string> = {
  employer: "Employer",
  linkedin: "LinkedIn",
  github: "GitHub",
  news: "News",
};

export const LANE_TAGLINE: Record<LaneId, string> = {
  employer: "Confirms current & past roles against company sources.",
  linkedin: "Cross-checks the profile against the resume claims.",
  github: "Verifies repos, portfolio, and handle activity.",
  news: "Scans the open web for press, mentions, and reputation.",
};
