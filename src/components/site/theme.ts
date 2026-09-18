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
    accent: "#0D9488", // teal (master palette)
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
    accent: "#EA580C", // orange (subtle accent — master palette)
    tint: "#FED7AA", // orange-100
    borderTint: "rgba(234,88,12,0.18)",
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
    accent: "#2563EB", // blue (master palette)
    tint: "#DBEAFE", // blue-100
    borderTint: "rgba(37,99,235,0.18)",
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
    accent: "#0F2547", // deep navy (master palette)
    tint: "#DBE7F5", // navy-tint
    borderTint: "rgba(15,37,71,0.18)",
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
