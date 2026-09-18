/**
 * SKILL SETU — Phase 8 demo hackathon data (master spec §90, §91, §92, §93).
 * 3 demo hackathons with problem statements referencing centralized Phase 3 skillIds.
 * Demo team "AI Innovators" with existing candidates (no duplicate students).
 */

import { SKILL_IDS } from "@/lib/intelligence/role-config";
import { skillName } from "@/lib/intelligence/demo-data";
import type { Hackathon, ProblemStatement, Mentor } from "./hackathon-model";

const s = SKILL_IDS;

function req(skillId: string, importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW", requiredLevel: number) {
  return { skillId, skillName: skillName(skillId), importance, requiredLevel };
}

const defaultEvalCriteria = [
  { id: "ec-1", name: "Innovation", weight: 0.20 },
  { id: "ec-2", name: "Technical Implementation", weight: 0.30 },
  { id: "ec-3", name: "Problem Solving", weight: 0.20 },
  { id: "ec-4", name: "Feasibility", weight: 0.10 },
  { id: "ec-5", name: "UI/UX", weight: 0.10 },
  { id: "ec-6", name: "Impact", weight: 0.10 },
];

export const DEMO_HACKATHONS: Hackathon[] = [
  {
    id: "hk-1",
    title: "AI Innovation Challenge",
    description: "Build an AI-powered solution for real-world problems. Focus on predictive analytics, NLP, or computer vision.",
    organizer: "Nova Analytics",
    organizerType: "Industry",
    domain: "AI / ML",
    category: "AI / ML",
    theme: "AI for Social Good",
    mode: "Hybrid",
    location: "Pune / Online",
    registrationStart: "2026-09-15",
    registrationDeadline: "2026-09-30",
    startDate: "2026-10-10",
    endDate: "2026-10-12",
    status: "REGISTRATION_OPEN",
    minTeamSize: 2,
    maxTeamSize: 4,
    soloAllowed: false,
    crossCollegeAllowed: true,
    crossYearAllowed: true,
    crossDepartmentAllowed: true,
    maxTeamsPerParticipant: 1,
    eligibilityRules: { yearMin: 2, cgpaMin: 7.0 },
    evaluationCriteria: defaultEvalCriteria,
    requiredSkills: [
      req(s.python, "CRITICAL", 70),
      req(s.machineLearning, "CRITICAL", 70),
      req(s.sql, "HIGH", 60),
      req(s.cloudPlatforms, "MEDIUM", 50),
    ],
    createdAt: "2026-09-01T10:00:00",
    updatedAt: "2026-09-01T10:00:00",
  },
  {
    id: "hk-2",
    title: "Cybersecurity Sprint",
    description: "48-hour sprint to identify vulnerabilities, build defensive tools, or create security awareness solutions.",
    organizer: "CloudPeak Systems",
    organizerType: "Industry",
    domain: "Cybersecurity",
    category: "Cybersecurity",
    mode: "Online",
    location: "Online",
    registrationStart: "2026-09-20",
    registrationDeadline: "2026-10-10",
    startDate: "2026-10-15",
    endDate: "2026-10-17",
    status: "PUBLISHED",
    minTeamSize: 1,
    maxTeamSize: 4,
    soloAllowed: true,
    crossCollegeAllowed: true,
    crossYearAllowed: true,
    crossDepartmentAllowed: true,
    maxTeamsPerParticipant: 1,
    eligibilityRules: { yearMin: 1 },
    evaluationCriteria: defaultEvalCriteria,
    requiredSkills: [
      req(s.linux, "HIGH", 50),
      req(s.cybersecurityFundamentals, "HIGH", 50),
      req(s.networkSecurity, "HIGH", 50),
      req(s.problemSolving, "MEDIUM", 60),
    ],
    createdAt: "2026-09-05T09:00:00",
    updatedAt: "2026-09-05T09:00:00",
  },
  {
    id: "hk-3",
    title: "Smart Campus Buildathon",
    description: "Build a full-stack smart campus application — events, clubs, facilities, analytics.",
    organizer: "IIT Madras",
    organizerType: "Institution",
    domain: "Web Development",
    category: "Web Development",
    mode: "On-site",
    location: "IIT Madras, Chennai",
    registrationStart: "2026-09-25",
    registrationDeadline: "2026-10-15",
    startDate: "2026-10-20",
    endDate: "2026-10-22",
    status: "PUBLISHED",
    minTeamSize: 3,
    maxTeamSize: 5,
    soloAllowed: false,
    crossCollegeAllowed: false,
    crossYearAllowed: true,
    crossDepartmentAllowed: true,
    maxTeamsPerParticipant: 1,
    eligibilityRules: { yearMin: 2 },
    evaluationCriteria: defaultEvalCriteria,
    requiredSkills: [
      req(s.frontend, "HIGH", 65),
      req(s.backend, "HIGH", 65),
      req(s.databaseMgmt, "MEDIUM", 55),
      req(s.apiIntegration, "MEDIUM", 55),
    ],
    createdAt: "2026-09-10T12:00:00",
    updatedAt: "2026-09-10T12:00:00",
  },
];

export const DEMO_PROBLEM_STATEMENTS: ProblemStatement[] = [
  {
    id: "ps-1",
    hackathonId: "hk-1",
    title: "Predictive Healthcare Analytics",
    description: "Build a predictive model for patient risk assessment using anonymized healthcare data.",
    background: "Healthcare providers need early-warning systems to identify high-risk patients before adverse events occur.",
    objective: "Create a working ML model + dashboard that predicts patient risk scores from historical data.",
    expectedOutcome: "A trained model, evaluation metrics, and an interactive risk-score dashboard.",
    domain: "AI / ML",
    difficulty: "Advanced",
    constraints: "Use only the provided anonymized dataset. No PHI.",
    requiredSkills: [req(s.python, "CRITICAL", 70), req(s.machineLearning, "CRITICAL", 70), req(s.sql, "HIGH", 60)],
    preferredSkills: [req(s.cloudPlatforms, "MEDIUM", 50), req(s.statistics, "MEDIUM", 50)],
    technologyTags: ["Python", "scikit-learn", "Pandas", "Streamlit"],
    resources: [{ type: "Dataset", title: "Anonymized Healthcare Dataset", url: "https://example.dataset" }],
    submissionRequirements: "GitHub repo + live demo + 5-min presentation",
    status: "Open",
  },
  {
    id: "ps-2",
    hackathonId: "hk-1",
    title: "NLP Document Classifier",
    description: "Classify and extract structured data from unstructured business documents.",
    background: "Companies process thousands of documents daily. Manual classification is slow and error-prone.",
    objective: "Build a document classification + extraction pipeline.",
    expectedOutcome: "Working classifier + extraction API + accuracy report.",
    domain: "AI / ML",
    difficulty: "Intermediate",
    requiredSkills: [req(s.python, "HIGH", 65), req(s.machineLearning, "HIGH", 60)],
    preferredSkills: [req(s.deepLearning, "MEDIUM", 50)],
    technologyTags: ["Python", "transformers", "FastAPI"],
    status: "Open",
  },
  {
    id: "ps-3",
    hackathonId: "hk-2",
    title: "Network Anomaly Detector",
    description: "Build a tool that detects anomalous network traffic patterns in real-time.",
    background: "Network security teams need automated detection of suspicious traffic.",
    objective: "Create a real-time anomaly detection tool for network traffic.",
    expectedOutcome: "Working detector + alerting system + test report.",
    domain: "Cybersecurity",
    difficulty: "Advanced",
    requiredSkills: [req(s.linux, "HIGH", 50), req(s.networkSecurity, "HIGH", 50), req(s.python, "MEDIUM", 50)],
    technologyTags: ["Python", "Scapy", "Elasticsearch"],
    status: "Open",
  },
  {
    id: "ps-4",
    hackathonId: "hk-3",
    title: "Campus Event & Club Platform",
    description: "Build a full-stack platform for campus events, club management, and analytics.",
    background: "Campuses lack a unified platform for event discovery and club management.",
    objective: "Create a production-ready web application with auth, CRUD, and analytics.",
    expectedOutcome: "Deployed web app + API + database schema + demo.",
    domain: "Web Development",
    difficulty: "Intermediate",
    requiredSkills: [req(s.frontend, "HIGH", 65), req(s.backend, "HIGH", 65), req(s.databaseMgmt, "MEDIUM", 55)],
    preferredSkills: [req(s.apiIntegration, "MEDIUM", 55)],
    technologyTags: ["React", "Node.js", "PostgreSQL"],
    status: "Open",
  },
];

export const DEMO_MENTORS: Mentor[] = [
  { id: "mt-1", name: "Dr. Meena Krishnan", expertise: ["Machine Learning", "NLP", "Distributed Systems"], skills: [{ skillId: s.machineLearning, skillName: skillName(s.machineLearning) }, { skillId: s.python, skillName: skillName(s.python) }, { skillId: s.statistics, skillName: skillName(s.statistics) }], domain: "AI / ML", category: "AI/ML", availability: "Available", bio: "Professor at IIT Madras, 12+ years in NLP and ML systems." },
  { id: "mt-2", name: "Ankit Verma", expertise: ["Cloud DevOps", "Kubernetes", "CI/CD"], skills: [{ skillId: s.cloudPlatforms, skillName: skillName(s.cloudPlatforms) }, { skillId: s.dockerK8s, skillName: skillName(s.dockerK8s) }], domain: "Cloud", category: "Cloud", availability: "Limited", bio: "Senior Cloud Engineer at CloudPeak Systems." },
  { id: "mt-3", name: "Suresh Pillai", expertise: ["Network Security", "Penetration Testing"], skills: [{ skillId: s.networkSecurity, skillName: skillName(s.networkSecurity) }, { skillId: s.cybersecurityFundamentals, skillName: skillName(s.cybersecurityFundamentals) }], domain: "Cybersecurity", category: "Cybersecurity", availability: "Available", bio: "Security researcher with 8+ years in network defense." },
];

// Demo team "AI Innovators" — 3/4 members, existing candidates from Phase 5
export const DEMO_TEAM_MEMBERS = [
  { studentId: "S042", studentName: "Aarav Sharma", teamRole: "ML Engineer", joinedAt: "2026-09-18T10:00:00", status: "Leader" as const },
  { studentId: "S038", studentName: "Rohan Gupta", teamRole: "Full Stack Developer", joinedAt: "2026-09-18T11:00:00", status: "Member" as const },
  { studentId: "S051", studentName: "Priya Nair", teamRole: "ML Engineer", joinedAt: "2026-09-18T12:00:00", status: "Member" as const },
];

export const DEMO_TEAM = {
  id: "tm-1",
  hackathonId: "hk-1",
  problemStatementId: "ps-1",
  name: "AI Innovators",
  leaderId: "S042",
  members: DEMO_TEAM_MEMBERS,
  openRoles: [{ name: "Cloud Engineer", requiredSkills: [{ skillId: s.cloudPlatforms, skillName: skillName(s.cloudPlatforms) }], open: 1 }],
  status: "Formed" as const,
  createdAt: "2026-09-18T10:00:00",
};

export function findHackathon(id: string): Hackathon | undefined { return DEMO_HACKATHONS.find((h) => h.id === id); }
export function findProblem(id: string): ProblemStatement | undefined { return DEMO_PROBLEM_STATEMENTS.find((p) => p.id === id); }
export function getProblemsForHackathon(hackathonId: string): ProblemStatement[] { return DEMO_PROBLEM_STATEMENTS.filter((p) => p.hackathonId === hackathonId); }
