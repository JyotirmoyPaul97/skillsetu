// Centralised portal theme config for SKILL SETU
// Keeps the four-portal colour system in one place so every section stays consistent.

export type PortalKey = "student" | "industry" | "academia" | "institution";

export interface PortalTheme {
  key: PortalKey;
  name: string; // "Student Portal"
  short: string; // "Student"
  index: string; // "01"
  description: string;
  tags: string[];
  /** Solid accent colour (hex) */
  accent: string;
  /** Soft tinted background (hex) */
  tint: string;
  /** Border tint (rgba) */
  borderTint: string;
  /** Lucide icon name (kept in sync with the icon map in components) */
  icon: "graduationCap" | "factory" | "bookOpen" | "building2";
}

export const PORTALS: PortalTheme[] = [
  {
    key: "student",
    name: "Student Portal",
    short: "Student",
    index: "01",
    description:
      "Understand your skills, identify career gaps, take the right next action, and discover opportunities matched to your evidence.",
    tags: ["Skill Intelligence", "Career Readiness", "Skill Gap", "Opportunities"],
    accent: "#0D9488", // teal-700
    tint: "#CCFBF1", // teal-100
    borderTint: "rgba(13,148,136,0.18)",
    icon: "graduationCap",
  },
  {
    key: "industry",
    name: "Industry Portal",
    short: "Industry",
    index: "02",
    description:
      "Discover evidence-backed talent, post opportunities, build project teams, and turn real-world feedback into stronger skill evidence.",
    tags: ["Talent Discovery", "Opportunity Management", "AI Team Builder", "Industry Feedback"],
    accent: "#B45309", // amber-700
    tint: "#FEF3C7", // amber-100
    borderTint: "rgba(180,83,9,0.18)",
    icon: "factory",
  },
  {
    key: "academia",
    name: "Academia Portal",
    short: "Academia",
    index: "03",
    description:
      "Connect faculty with industry opportunities, emerging skills, practical exposure, mentorship, and curriculum-alignment insights.",
    tags: ["Industry Opportunities", "Curriculum Alignment", "Collaboration", "Faculty Development"],
    accent: "#BE123C", // rose-700
    tint: "#FFE4E6", // rose-100
    borderTint: "rgba(190,18,60,0.18)",
    icon: "bookOpen",
  },
  {
    key: "institution",
    name: "Institution Portal",
    short: "Institution",
    index: "04",
    description:
      "Turn student skill data into institutional intelligence for interventions, industry alignment, internship and placement readiness.",
    tags: ["Skill Intelligence", "Branch Analytics", "Placement Insights", "Industry Alignment"],
    accent: "#6D28D9", // violet-700 (shifted from indigo toward violet per brand rules)
    tint: "#EDE9FE", // violet-100
    borderTint: "rgba(109,40,217,0.18)",
    icon: "building2",
  },
];

export const PORTAL_BY_KEY: Record<PortalKey, PortalTheme> = PORTALS.reduce(
  (acc, p) => {
    acc[p.key] = p;
    return acc;
  },
  {} as Record<PortalKey, PortalTheme>,
);

/** Closed-loop flow nodes (top row) */
export const FLOW_NODES = [
  { label: "Student", icon: "user" as const },
  { label: "Evidence", icon: "fileCheck" as const },
  { label: "Skill Intelligence", icon: "brain" as const },
  { label: "Industry Opportunity", icon: "briefcase" as const },
  { label: "Feedback", icon: "refreshCw" as const },
];

/** Closed-loop secondary nodes (bottom row) */
export const FLOW_SECONDARY = [
  { label: "Skill Passport", icon: "badgeCheck" as const },
  { label: "Institutional Insight", icon: "lineChart" as const },
];
