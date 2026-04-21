import type { Job, JobSkillRequirement } from "./types";

// Helper so the data table stays scannable and `core` always derives from
// `weight` — no chance of the two drifting out of sync by accident.
function req(
  name: string,
  weight: 1 | 2,
): JobSkillRequirement {
  return { name, weight, core: weight === 2 };
}

export const JOBS: Job[] = [
  // ── Data (3) ───────────────────────────────────────────────────────────
  {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Data",
    description:
      "Turns raw business data into dashboards and insights that drive decisions.",
    skills_required: [
      req("SQL", 2),
      req("Excel", 2),
      req("Data Visualization", 2),
      req("Python", 1),
      req("Statistics", 1),
      req("Tableau", 1),
    ],
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    category: "Data",
    description:
      "Builds statistical and machine-learning models to answer open-ended business questions.",
    skills_required: [
      req("Python", 2),
      req("Machine Learning", 2),
      req("Statistics", 2),
      req("SQL", 1),
      req("Data Visualization", 1),
      req("Deep Learning", 1),
      req("NLP", 1),
    ],
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    category: "Data",
    description:
      "Bridges stakeholders and engineering by translating business needs into clear requirements.",
    skills_required: [
      req("Business Analysis", 2),
      req("Excel", 2),
      req("SQL", 2),
      req("Stakeholder Management", 1),
      req("Data Visualization", 1),
      req("Requirements Gathering", 1),
    ],
  },

  // ── Engineering (4) ────────────────────────────────────────────────────
  {
    id: "backend-engineer",
    title: "Backend Engineer",
    category: "Engineering",
    description:
      "Designs, builds, and operates the server-side systems that power the product.",
    skills_required: [
      req("Python", 2),
      req("REST APIs", 2),
      req("SQL", 2),
      req("Docker", 1),
      req("Git", 1),
      req("CI/CD", 1),
      req("System Design", 1),
    ],
  },
  {
    id: "frontend-engineer",
    title: "Frontend Engineer",
    category: "Engineering",
    description:
      "Builds the user-facing interface — what customers see, click, and feel in the product.",
    skills_required: [
      req("JavaScript", 2),
      req("React", 2),
      req("CSS", 2),
      req("TypeScript", 1),
      req("HTML", 1),
      req("Git", 1),
    ],
  },
  {
    id: "full-stack-engineer",
    title: "Full-Stack Engineer",
    category: "Engineering",
    description:
      "Owns features end-to-end across the frontend, backend, and data layer.",
    skills_required: [
      req("JavaScript", 2),
      req("React", 2),
      req("Node.js", 2),
      req("SQL", 1),
      req("REST APIs", 1),
      req("Git", 1),
      req("Docker", 1),
    ],
  },
  {
    id: "qa-engineer",
    title: "QA Engineer",
    category: "Engineering",
    description:
      "Protects product quality through test planning, automation, and release-gate ownership.",
    skills_required: [
      req("Quality Assurance", 2),
      req("Test Automation", 2),
      req("SQL", 1),
      req("Python", 1),
      req("Agile", 1),
      req("Performance Testing", 1),
    ],
  },

  // ── Design (2) ─────────────────────────────────────────────────────────
  {
    id: "graphic-designer",
    title: "Graphic Designer",
    category: "Design",
    description:
      "Creates brand, marketing, and product visuals across print and digital channels.",
    skills_required: [
      req("Adobe Photoshop", 2),
      req("Adobe Illustrator", 2),
      req("UI Design", 2),
      req("Figma", 1),
      req("Communication", 1),
    ],
  },
  {
    id: "ux-designer",
    title: "UX Designer",
    category: "Design",
    description:
      "Researches user needs and designs flows that make complex products feel simple.",
    skills_required: [
      req("UX Research", 2),
      req("UX Design", 2),
      req("Figma", 2),
      req("User Research", 1),
      req("Communication", 1),
      req("A/B Testing", 1),
    ],
  },

  // ── Marketing (3) ──────────────────────────────────────────────────────
  {
    id: "seo-specialist",
    title: "SEO Specialist",
    category: "Marketing",
    description:
      "Grows organic search traffic through on-page, technical, and content strategy.",
    skills_required: [
      req("SEO", 2),
      req("Google Analytics", 2),
      req("Content Strategy", 2),
      req("HTML", 1),
      req("A/B Testing", 1),
    ],
  },
  {
    id: "content-marketer",
    title: "Content Marketer",
    category: "Marketing",
    description:
      "Plans and produces content that attracts, educates, and converts the target audience.",
    skills_required: [
      req("Content Strategy", 2),
      req("Copywriting", 2),
      req("SEO", 2),
      req("Social Media Marketing", 1),
      req("Email Marketing", 1),
      req("Google Analytics", 1),
    ],
  },
  {
    id: "copywriter",
    title: "Copywriter",
    category: "Marketing",
    description:
      "Writes persuasive, brand-consistent copy across web, ad, and email channels.",
    skills_required: [
      req("Copywriting", 2),
      req("Communication", 2),
      req("Content Strategy", 1),
      req("SEO", 1),
      req("Social Media Marketing", 1),
    ],
  },

  // ── Operations (3) ─────────────────────────────────────────────────────
  {
    id: "project-manager",
    title: "Project Manager",
    category: "Operations",
    description:
      "Plans, tracks, and unblocks cross-functional work to ship on time and on scope.",
    skills_required: [
      req("Project Planning", 2),
      req("Agile", 2),
      req("Stakeholder Management", 2),
      req("Jira", 1),
      req("Risk Management", 1),
      req("Communication", 1),
    ],
  },
  {
    id: "virtual-assistant",
    title: "Virtual Assistant",
    category: "Operations",
    description:
      "Supports executives and teams with scheduling, research, and day-to-day operations remotely.",
    skills_required: [
      req("Communication", 2),
      req("Time Management", 2),
      req("Excel", 2),
      req("Google Sheets", 1),
      req("Email Marketing", 1),
    ],
  },
  {
    id: "customer-success-manager",
    title: "Customer Success Manager",
    category: "Operations",
    description:
      "Owns the post-sale relationship — drives adoption, retention, and expansion.",
    skills_required: [
      req("Customer Success", 2),
      req("Communication", 2),
      req("Stakeholder Management", 2),
      req("Salesforce", 1),
      req("Problem Solving", 1),
    ],
  },
];
