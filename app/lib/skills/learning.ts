import { CANONICAL_SKILLS } from "./taxonomy";
import type {
  CanonicalSkillName,
  LearningResource,
  SkillDifficulty,
} from "./types";

export interface SkillMeta {
  difficulty: SkillDifficulty;
  estimated_hours: number;
  learning: LearningResource[];
}

// Curated entries — every skill referenced by at least one job in lib/jobs.ts
// has a high-quality entry here. See the `DEFAULT_META` fallback below for
// skills that don't appear in any job (they're never shown as gaps, but we
// keep the map total to preserve the "every canonical skill covered" invariant).
const CURATED: Record<string, SkillMeta> = {
  // ── Data ──────────────────────────────────────────────────────────────
  SQL: {
    difficulty: "Beginner",
    estimated_hours: 20,
    learning: [
      {
        title: "SQL Tutorial — Full Database Course for Beginners",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
      },
      {
        title: "Learn SQL Basics for Data Science Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/learn-sql-basics-data-science",
      },
      {
        title: "SQL (Structured Query Language)",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/tag/sql/",
      },
    ],
  },
  Excel: {
    difficulty: "Beginner",
    estimated_hours: 15,
    learning: [
      {
        title: "Microsoft Excel Training",
        platform: "Official Docs",
        url: "https://support.microsoft.com/en-us/excel",
      },
      {
        title: "Excel Skills for Business Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/excel",
      },
    ],
  },
  "Data Visualization": {
    difficulty: "Intermediate",
    estimated_hours: 30,
    learning: [
      {
        title: "Data Visualization with Python",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/python-for-data-visualization",
      },
      {
        title: "Data Visualization Certification",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/data-visualization/",
      },
    ],
  },
  Python: {
    difficulty: "Beginner",
    estimated_hours: 40,
    learning: [
      {
        title: "Python for Everybody Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/python",
      },
      {
        title: "Scientific Computing with Python",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
      },
      {
        title: "The Python Tutorial",
        platform: "Official Docs",
        url: "https://docs.python.org/3/tutorial/",
      },
    ],
  },
  Statistics: {
    difficulty: "Intermediate",
    estimated_hours: 40,
    learning: [
      {
        title: "Statistics with Python Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/statistics-with-python",
      },
      {
        title: "Statistics and Probability — Khan Academy",
        platform: "YouTube",
        url: "https://www.youtube.com/playlist?list=PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7",
      },
    ],
  },
  Tableau: {
    difficulty: "Beginner",
    estimated_hours: 20,
    learning: [
      {
        title: "Tableau Training Videos",
        platform: "Official Docs",
        url: "https://www.tableau.com/learn/training",
      },
      {
        title: "Data Visualization with Tableau Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/data-visualization",
      },
    ],
  },
  "Machine Learning": {
    difficulty: "Advanced",
    estimated_hours: 100,
    learning: [
      {
        title: "Machine Learning Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/machine-learning-introduction",
      },
      {
        title: "Machine Learning Crash Course",
        platform: "Official Docs",
        url: "https://developers.google.com/machine-learning/crash-course",
      },
    ],
  },
  "Deep Learning": {
    difficulty: "Advanced",
    estimated_hours: 120,
    learning: [
      {
        title: "Deep Learning Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/deep-learning",
      },
      {
        title: "Practical Deep Learning for Coders",
        platform: "Official Docs",
        url: "https://course.fast.ai/",
      },
    ],
  },
  NLP: {
    difficulty: "Advanced",
    estimated_hours: 80,
    learning: [
      {
        title: "Natural Language Processing Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/natural-language-processing",
      },
      {
        title: "Hugging Face NLP Course",
        platform: "Official Docs",
        url: "https://huggingface.co/learn/nlp-course/",
      },
    ],
  },
  "Business Analysis": {
    difficulty: "Intermediate",
    estimated_hours: 40,
    learning: [
      {
        title: "Business Analysis & Process Management",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/business-analysis-process-management",
      },
    ],
  },
  "Stakeholder Management": {
    difficulty: "Intermediate",
    estimated_hours: 15,
    learning: [
      {
        title: "Strategies for Effective Stakeholder Management",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/strategies-for-effective-stakeholder-management",
      },
    ],
  },
  "Requirements Gathering": {
    difficulty: "Intermediate",
    estimated_hours: 20,
    learning: [
      {
        title: "Requirements Gathering for Secure Software Development",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/requirements-gathering-secure-software-development",
      },
    ],
  },

  // ── Engineering ───────────────────────────────────────────────────────
  "REST APIs": {
    difficulty: "Intermediate",
    estimated_hours: 25,
    learning: [
      {
        title: "REST API Tutorial",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=qbLc5a9jdXo",
      },
      {
        title: "APIs for Beginners",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/news/what-is-an-api-in-english-please/",
      },
    ],
  },
  Docker: {
    difficulty: "Intermediate",
    estimated_hours: 20,
    learning: [
      {
        title: "Get Started with Docker",
        platform: "Official Docs",
        url: "https://docs.docker.com/get-started/",
      },
      {
        title: "Docker Tutorial for Beginners",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=3c-iBn73dDE",
      },
    ],
  },
  Git: {
    difficulty: "Beginner",
    estimated_hours: 10,
    learning: [
      {
        title: "Git Documentation",
        platform: "Official Docs",
        url: "https://git-scm.com/doc",
      },
      {
        title: "Learn Git Branching",
        platform: "Official Docs",
        url: "https://learngitbranching.js.org/",
      },
    ],
  },
  "CI/CD": {
    difficulty: "Intermediate",
    estimated_hours: 25,
    learning: [
      {
        title: "GitHub Actions Documentation",
        platform: "Official Docs",
        url: "https://docs.github.com/en/actions",
      },
      {
        title: "CI/CD Pipelines Explained",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=scEDHsr3APg",
      },
    ],
  },
  "System Design": {
    difficulty: "Advanced",
    estimated_hours: 60,
    learning: [
      {
        title: "System Design Primer",
        platform: "Official Docs",
        url: "https://github.com/donnemartin/system-design-primer",
      },
      {
        title: "System Design Interview",
        platform: "YouTube",
        url: "https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX",
      },
    ],
  },
  JavaScript: {
    difficulty: "Beginner",
    estimated_hours: 40,
    learning: [
      {
        title: "JavaScript Algorithms and Data Structures",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
      },
      {
        title: "JavaScript Guide",
        platform: "Official Docs",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      },
    ],
  },
  React: {
    difficulty: "Intermediate",
    estimated_hours: 40,
    learning: [
      {
        title: "React — The Official Tutorial",
        platform: "Official Docs",
        url: "https://react.dev/learn",
      },
      {
        title: "React Course for Beginners",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
      },
    ],
  },
  CSS: {
    difficulty: "Beginner",
    estimated_hours: 25,
    learning: [
      {
        title: "Learn CSS",
        platform: "Official Docs",
        url: "https://web.dev/learn/css",
      },
      {
        title: "Responsive Web Design Certification",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
      },
    ],
  },
  TypeScript: {
    difficulty: "Intermediate",
    estimated_hours: 20,
    learning: [
      {
        title: "TypeScript Handbook",
        platform: "Official Docs",
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
      },
      {
        title: "Learn TypeScript",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=d56mG7DezGs",
      },
    ],
  },
  HTML: {
    difficulty: "Beginner",
    estimated_hours: 15,
    learning: [
      {
        title: "HTML: HyperText Markup Language",
        platform: "Official Docs",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
      },
      {
        title: "Responsive Web Design Certification",
        platform: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
      },
    ],
  },
  "Node.js": {
    difficulty: "Intermediate",
    estimated_hours: 30,
    learning: [
      {
        title: "Node.js Documentation",
        platform: "Official Docs",
        url: "https://nodejs.org/en/docs",
      },
      {
        title: "Node.js Tutorial for Beginners",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
      },
    ],
  },
  "Quality Assurance": {
    difficulty: "Intermediate",
    estimated_hours: 30,
    learning: [
      {
        title: "Software Testing Fundamentals",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/software-testing-automation-fundamentals",
      },
    ],
  },
  "Test Automation": {
    difficulty: "Intermediate",
    estimated_hours: 35,
    learning: [
      {
        title: "Playwright Documentation",
        platform: "Official Docs",
        url: "https://playwright.dev/docs/intro",
      },
      {
        title: "Selenium with Python",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=Xjv1sY630Uc",
      },
    ],
  },
  Agile: {
    difficulty: "Beginner",
    estimated_hours: 15,
    learning: [
      {
        title: "Agile with Atlassian Jira",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/agile-atlassian-jira",
      },
      {
        title: "Agile Manifesto",
        platform: "Official Docs",
        url: "https://agilemanifesto.org/",
      },
    ],
  },
  "Performance Testing": {
    difficulty: "Intermediate",
    estimated_hours: 25,
    learning: [
      {
        title: "k6 Documentation",
        platform: "Official Docs",
        url: "https://grafana.com/docs/k6/latest/",
      },
    ],
  },

  // ── Design ────────────────────────────────────────────────────────────
  "Adobe Photoshop": {
    difficulty: "Intermediate",
    estimated_hours: 40,
    learning: [
      {
        title: "Photoshop Tutorials",
        platform: "Official Docs",
        url: "https://helpx.adobe.com/photoshop/tutorials.html",
      },
      {
        title: "Photoshop for Beginners",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=IyR_uYsRdPs",
      },
    ],
  },
  "Adobe Illustrator": {
    difficulty: "Intermediate",
    estimated_hours: 40,
    learning: [
      {
        title: "Illustrator Tutorials",
        platform: "Official Docs",
        url: "https://helpx.adobe.com/illustrator/tutorials.html",
      },
    ],
  },
  "UI Design": {
    difficulty: "Intermediate",
    estimated_hours: 50,
    learning: [
      {
        title: "Google UX Design Professional Certificate",
        platform: "Coursera",
        url: "https://www.coursera.org/professional-certificates/google-ux-design",
      },
    ],
  },
  Figma: {
    difficulty: "Beginner",
    estimated_hours: 15,
    learning: [
      {
        title: "Figma Learn",
        platform: "Official Docs",
        url: "https://help.figma.com/hc/en-us/categories/360002051613-Get-started",
      },
      {
        title: "Figma UI Design Tutorial",
        platform: "YouTube",
        url: "https://www.youtube.com/watch?v=FTFaQWZBqQ8",
      },
    ],
  },
  Communication: {
    difficulty: "Beginner",
    estimated_hours: 20,
    learning: [
      {
        title: "Improve Your English Communication Skills",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/improve-english",
      },
    ],
  },
  "UX Research": {
    difficulty: "Intermediate",
    estimated_hours: 40,
    learning: [
      {
        title: "User Experience Research and Design Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/michiganux",
      },
    ],
  },
  "UX Design": {
    difficulty: "Intermediate",
    estimated_hours: 50,
    learning: [
      {
        title: "Google UX Design Professional Certificate",
        platform: "Coursera",
        url: "https://www.coursera.org/professional-certificates/google-ux-design",
      },
    ],
  },
  "User Research": {
    difficulty: "Intermediate",
    estimated_hours: 30,
    learning: [
      {
        title: "Nielsen Norman Group — UX Research",
        platform: "Official Docs",
        url: "https://www.nngroup.com/topic/ux-research-methods/",
      },
    ],
  },
  "A/B Testing": {
    difficulty: "Intermediate",
    estimated_hours: 15,
    learning: [
      {
        title: "A/B Testing by Google",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/ab-testing",
      },
    ],
  },

  // ── Marketing ─────────────────────────────────────────────────────────
  SEO: {
    difficulty: "Beginner",
    estimated_hours: 25,
    learning: [
      {
        title: "Google Search Essentials",
        platform: "Official Docs",
        url: "https://developers.google.com/search/docs",
      },
      {
        title: "SEO Training Course by Moz",
        platform: "YouTube",
        url: "https://www.youtube.com/playlist?list=PLfL1HKRcwT6e90qRqCddSoLOxEpe56Nxq",
      },
    ],
  },
  "Google Analytics": {
    difficulty: "Beginner",
    estimated_hours: 12,
    learning: [
      {
        title: "Google Analytics Academy",
        platform: "Official Docs",
        url: "https://analytics.google.com/analytics/academy/",
      },
    ],
  },
  "Content Strategy": {
    difficulty: "Intermediate",
    estimated_hours: 30,
    learning: [
      {
        title: "Content Strategy for Professionals Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/content-strategy",
      },
    ],
  },
  Copywriting: {
    difficulty: "Beginner",
    estimated_hours: 25,
    learning: [
      {
        title: "The Strategy of Content Marketing",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/content-marketing",
      },
    ],
  },
  "Social Media Marketing": {
    difficulty: "Beginner",
    estimated_hours: 20,
    learning: [
      {
        title: "Meta Social Media Marketing Professional Certificate",
        platform: "Coursera",
        url: "https://www.coursera.org/professional-certificates/facebook-social-media-marketing",
      },
    ],
  },
  "Email Marketing": {
    difficulty: "Beginner",
    estimated_hours: 15,
    learning: [
      {
        title: "Email Marketing Certification",
        platform: "Official Docs",
        url: "https://academy.hubspot.com/courses/email-marketing",
      },
    ],
  },

  // ── Operations ────────────────────────────────────────────────────────
  "Project Planning": {
    difficulty: "Intermediate",
    estimated_hours: 25,
    learning: [
      {
        title: "Google Project Management Professional Certificate",
        platform: "Coursera",
        url: "https://www.coursera.org/professional-certificates/google-project-management",
      },
    ],
  },
  Jira: {
    difficulty: "Beginner",
    estimated_hours: 8,
    learning: [
      {
        title: "Jira Software Documentation",
        platform: "Official Docs",
        url: "https://support.atlassian.com/jira-software-cloud/",
      },
    ],
  },
  "Risk Management": {
    difficulty: "Intermediate",
    estimated_hours: 20,
    learning: [
      {
        title: "Project Risk Management",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/project-risk-management",
      },
    ],
  },
  "Time Management": {
    difficulty: "Beginner",
    estimated_hours: 8,
    learning: [
      {
        title: "Work Smarter, Not Harder",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/work-smarter-not-harder",
      },
    ],
  },
  "Google Sheets": {
    difficulty: "Beginner",
    estimated_hours: 10,
    learning: [
      {
        title: "Google Sheets Training",
        platform: "Official Docs",
        url: "https://support.google.com/a/users/answer/9282959",
      },
    ],
  },
  "Customer Success": {
    difficulty: "Intermediate",
    estimated_hours: 20,
    learning: [
      {
        title: "Customer Success Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/customer-success",
      },
    ],
  },
  Salesforce: {
    difficulty: "Intermediate",
    estimated_hours: 30,
    learning: [
      {
        title: "Salesforce Trailhead",
        platform: "Official Docs",
        url: "https://trailhead.salesforce.com/",
      },
    ],
  },
  "Problem Solving": {
    difficulty: "Beginner",
    estimated_hours: 12,
    learning: [
      {
        title: "Creative Problem Solving",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/creative-problem-solving",
      },
    ],
  },
};

// Fallback for any canonical skill that didn't get a curated entry.
// These skills aren't currently referenced by any job, so they'd never be
// shown as a gap — but we still populate the map so the "every canonical
// skill covered" invariant holds.
const DEFAULT_META: SkillMeta = {
  difficulty: "Intermediate",
  estimated_hours: 30,
  learning: [
    {
      title: "Search for free tutorials",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=tutorial",
    },
    {
      title: "Coursera — browse courses",
      platform: "Coursera",
      url: "https://www.coursera.org/",
    },
  ],
};

export const SKILL_META: Record<CanonicalSkillName, SkillMeta> = (() => {
  const map: Record<CanonicalSkillName, SkillMeta> = {};
  for (const skill of CANONICAL_SKILLS) {
    map[skill] = CURATED[skill] ?? DEFAULT_META;
  }
  return map;
})();
