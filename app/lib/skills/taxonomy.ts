import type { CanonicalSkillName } from "./types";

// ---------------------------------------------------------------------------
// Canonical skills — the single source of truth.
// Every skill name referenced anywhere in jobs/learning/extraction output
// MUST appear in this array.
// ---------------------------------------------------------------------------
export const CANONICAL_SKILLS: CanonicalSkillName[] = [
  // ── Technical / hard skills (~65) ──────────────────────────────────────
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "R",
  "Scala",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "MongoDB",
  "Redis",
  "GraphQL",
  "REST APIs",
  "HTML",
  "CSS",
  "Sass",
  "React",
  "Vue",
  "Svelte",
  "Angular",
  "Next.js",
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "Spring Boot",
  "Ruby on Rails",
  ".NET",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Git",
  "CI/CD",
  "Linux",
  "Terraform",
  "Ansible",
  "Webpack",
  "Vite",
  "TDD",
  "Data Structures",
  "Algorithms",
  "Machine Learning",
  "Deep Learning",
  "NLP",
  "Computer Vision",
  "Data Engineering",
  "ETL",
  "Apache Spark",
  "Kafka",
  "Elasticsearch",
  "Microservices",
  "System Design",
  "API Design",
  "WebSockets",

  // ── Soft / process skills (~40) ────────────────────────────────────────
  "Agile",
  "Scrum",
  "Kanban",
  "Stakeholder Management",
  "Technical Writing",
  "Code Review",
  "Mentoring",
  "Cross-functional Collaboration",
  "Problem Solving",
  "Critical Thinking",
  "Communication",
  "Presentation Skills",
  "Time Management",
  "Leadership",
  "Conflict Resolution",
  "Negotiation",
  "Project Planning",
  "Risk Management",
  "Requirements Gathering",
  "User Research",
  "Team Management",
  "Decision Making",
  "Adaptability",
  "Active Listening",
  "Strategic Thinking",
  "Goal Setting",
  "Change Management",
  "Process Improvement",
  "Documentation",
  "Customer Empathy",
  "Emotional Intelligence",
  "Delegation",
  "Prioritization",
  "Coaching",
  "Facilitation",
  "Public Speaking",
  "Writing",
  "Research",
  "Analytical Thinking",
  "Attention to Detail",

  // ── Domain skills (~30) ────────────────────────────────────────────────
  "Financial Modeling",
  "UX Research",
  "UX Design",
  "UI Design",
  "SEO",
  "SEM",
  "Content Strategy",
  "Copywriting",
  "Email Marketing",
  "Social Media Marketing",
  "Growth Hacking",
  "A/B Testing",
  "Data Visualization",
  "Statistics",
  "Business Analysis",
  "Market Research",
  "Customer Success",
  "Account Management",
  "Sales Operations",
  "Supply Chain",
  "Inventory Management",
  "Quality Assurance",
  "Test Automation",
  "Performance Testing",
  "Security Testing",
  "Product Management",
  "Technical Recruiting",
  "Branding",
  "Public Relations",
  "Event Management",

  // ── Tools (~20) ────────────────────────────────────────────────────────
  "Figma",
  "Sketch",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Adobe XD",
  "Tableau",
  "Power BI",
  "Excel",
  "Google Sheets",
  "Jira",
  "Notion",
  "Confluence",
  "Slack",
  "Salesforce",
  "HubSpot",
  "Google Analytics",
  "Mixpanel",
  "Postman",
  "VS Code",
  "IntelliJ",
];

// ---------------------------------------------------------------------------
// Aliases — variants → canonical. All keys MUST be lowercase.
// ---------------------------------------------------------------------------
const RAW_ALIASES: Record<string, CanonicalSkillName> = {
  // Programming languages
  js: "JavaScript",
  "java script": "JavaScript",
  ts: "TypeScript",
  py: "Python",
  cpp: "C++",
  "c plus plus": "C++",
  csharp: "C#",
  "c sharp": "C#",
  golang: "Go",

  // Databases
  postgres: "PostgreSQL",
  psql: "PostgreSQL",
  "postgre sql": "PostgreSQL",
  mongo: "MongoDB",

  // Frameworks / runtimes
  "react.js": "React",
  reactjs: "React",
  "vue.js": "Vue",
  vuejs: "Vue",
  "angular.js": "Angular",
  angularjs: "Angular",
  nextjs: "Next.js",
  "next js": "Next.js",
  node: "Node.js",
  nodejs: "Node.js",
  "node js": "Node.js",
  "express.js": "Express",
  expressjs: "Express",
  "ruby on rails": "Ruby on Rails",
  rails: "Ruby on Rails",
  dotnet: ".NET",
  "asp.net": ".NET",

  // Cloud / infra
  "amazon web services": "AWS",
  "google cloud": "GCP",
  "google cloud platform": "GCP",
  "microsoft azure": "Azure",
  k8s: "Kubernetes",

  // Styles
  scss: "Sass",
  "sass/scss": "Sass",

  // API / protocols
  rest: "REST APIs",
  "rest api": "REST APIs",
  "rest apis": "REST APIs",
  restful: "REST APIs",
  "restful apis": "REST APIs",
  "web sockets": "WebSockets",

  // CI/CD
  "ci/cd": "CI/CD",
  cicd: "CI/CD",
  "continuous integration": "CI/CD",
  "continuous delivery": "CI/CD",
  "continuous deployment": "CI/CD",

  // ML / DS
  ml: "Machine Learning",
  "deep-learning": "Deep Learning",
  "natural language processing": "NLP",
  "computer vision": "Computer Vision",
  spark: "Apache Spark",
  "apache kafka": "Kafka",

  // VCS
  github: "Git",
  gitlab: "Git",
  bitbucket: "Git",
  "version control": "Git",

  // OS
  unix: "Linux",
  bash: "Linux",
  shell: "Linux",
  "shell scripting": "Linux",

  // HTML/CSS
  html5: "HTML",
  css3: "CSS",

  // Testing
  qa: "Quality Assurance",
  "test-driven development": "TDD",
  "test driven development": "TDD",

  // DSA
  dsa: "Data Structures",

  // Design
  ux: "UX Design",
  ui: "UI Design",
  "user experience": "UX Design",
  "user interface": "UI Design",
  "user experience design": "UX Design",
  "user interface design": "UI Design",
  photoshop: "Adobe Photoshop",
  illustrator: "Adobe Illustrator",
  "adobe xd": "Adobe XD",

  // Analytics / BI
  "power bi": "Power BI",
  pbi: "Power BI",
  ga: "Google Analytics",
  ga4: "Google Analytics",

  // Marketing
  "a/b testing": "A/B Testing",
  "ab testing": "A/B Testing",
  "split testing": "A/B Testing",
  "search engine optimization": "SEO",
  "search engine marketing": "SEM",
  "social media": "Social Media Marketing",
  smm: "Social Media Marketing",
  copywriter: "Copywriting",
  "copy writing": "Copywriting",

  // Data
  "data viz": "Data Visualization",
  dataviz: "Data Visualization",
  stats: "Statistics",

  // Office / collab
  "ms excel": "Excel",
  "microsoft excel": "Excel",
  "google sheet": "Google Sheets",
  gsheets: "Google Sheets",
  sfdc: "Salesforce",

  // Agile family
  "agile methodology": "Agile",
  "scrum master": "Scrum",

  // Soft
  "problem-solving": "Problem Solving",
  "critical-thinking": "Critical Thinking",
  "time-management": "Time Management",
  "cross functional collaboration": "Cross-functional Collaboration",
  "cross-functional": "Cross-functional Collaboration",
};

// Build the effective alias map: every canonical skill is also aliased to
// itself via its lowercase form, so `snapToCanonical` is a single lookup.
const CANONICAL_LOWER: Record<string, CanonicalSkillName> = {};
for (const skill of CANONICAL_SKILLS) {
  CANONICAL_LOWER[skill.toLowerCase()] = skill;
}

export const SKILL_ALIASES: Record<string, CanonicalSkillName> = {
  ...CANONICAL_LOWER,
  ...RAW_ALIASES,
};

// ---------------------------------------------------------------------------
// Adjacency — symmetric pairs that share enough conceptual overlap that
// someone competent in one could pick up the other in ~20 hours or less.
// ---------------------------------------------------------------------------
export const SKILL_ADJACENCY: Array<[CanonicalSkillName, CanonicalSkillName]> =
  [
    ["PostgreSQL", "MySQL"],
    ["PostgreSQL", "SQLite"],
    ["MySQL", "SQLite"],
    ["React", "Vue"],
    ["React", "Svelte"],
    ["React", "Angular"],
    ["Vue", "Svelte"],
    ["AWS", "GCP"],
    ["AWS", "Azure"],
    ["GCP", "Azure"],
    ["Docker", "Kubernetes"],
    ["TypeScript", "JavaScript"],
    ["Django", "Flask"],
    ["Figma", "Sketch"],
    ["Figma", "Adobe XD"],
    ["Tableau", "Power BI"],
    ["Agile", "Scrum"],
    ["Agile", "Kanban"],
    ["Scrum", "Kanban"],
    ["SEO", "SEM"],
    ["Adobe Photoshop", "Adobe Illustrator"],
    ["Google Analytics", "Mixpanel"],
    ["Excel", "Google Sheets"],
    ["Jira", "Notion"],
  ];

// Pre-compute an O(1) adjacency set at module load.
const ADJACENCY_SET: Set<string> = (() => {
  const set = new Set<string>();
  for (const [a, b] of SKILL_ADJACENCY) {
    set.add(`${a}|${b}`);
    set.add(`${b}|${a}`);
  }
  return set;
})();

const CANONICAL_SET: Set<CanonicalSkillName> = new Set(CANONICAL_SKILLS);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map a raw, possibly-variant skill string to its canonical form.
 * Returns null if the skill is unknown.
 */
export function snapToCanonical(raw: string): CanonicalSkillName | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  return SKILL_ALIASES[key] ?? null;
}

/**
 * True iff `a` and `b` are listed as an adjacency pair in either direction.
 * Both inputs must already be canonical.
 */
export function areAdjacent(
  a: CanonicalSkillName,
  b: CanonicalSkillName,
): boolean {
  if (a === b) return false;
  return ADJACENCY_SET.has(`${a}|${b}`);
}

/**
 * True iff the given name is a canonical skill.
 */
export function isCanonical(name: string): boolean {
  return CANONICAL_SET.has(name);
}
