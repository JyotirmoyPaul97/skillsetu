/**
 * SKILL SETU — Phase 3 controlled demo data for student S042 (master spec §6, §11, §36).
 *
 * This is a CONTROLLED DEMONSTRATION DATASET. Per the spec, role-specific competency
 * profiles are used so the documented test values reproduce exactly:
 *   - Data Scientist  → 60.70% (display 61%)  [Problem Solving = 75]
 *   - Full Stack      → 74.00% (display 74%)  [Problem Solving = 78]
 *
 * Problem Solving differs between the two demo profiles because the spec's controlled
 * datasets specify different values (75 for DS, 78 for Full Stack). This is clearly
 * labelled as demo data. In a real system, competency is a single per-student value.
 */

import type { Student, EvidenceRecord, AssessmentResult, ReadinessHistoryEntry } from "./types";
import { SKILL_IDS } from "./role-config";

const s = SKILL_IDS;

export const DEMO_STUDENT: Student = {
  studentId: "S042",
  name: "Aarav Sharma",
  branch: "AI & Data Science",
  year: 3,
  college: "Indian Institute of Technology, Madras",
  location: "Chennai, Tamil Nadu",
  avatarColor: "#0D9488",
};

/**
 * Role-specific demo competency profiles. Loaded when the target role changes
 * (controlled demonstration dataset — see note above).
 */
export const DEMO_ROLE_PROFILES: Record<string, Record<string, number>> = {
  "data-scientist": {
    [s.python]: 82,
    [s.sql]: 64,
    [s.statistics]: 51,
    [s.machineLearning]: 43,
    [s.problemSolving]: 75,
  },
  "full-stack-developer": {
    [s.frontend]: 85,
    [s.backend]: 72,
    [s.databaseMgmt]: 68,
    [s.apiIntegration]: 60,
    [s.problemSolving]: 78,
  },
  "ml-engineer": {
    [s.python]: 82,
    [s.machineLearning]: 43,
    [s.deepLearning]: 40,
    [s.mathStatistics]: 55,
    [s.problemSolving]: 75,
  },
  "software-engineer": {
    [s.programming]: 78,
    [s.dsa]: 72,
    [s.databaseMgmt]: 68,
    [s.softwareEngineering]: 70,
    [s.problemSolving]: 75,
  },
  "cybersecurity-analyst": {
    [s.networkSecurity]: 55,
    [s.cybersecurityFundamentals]: 50,
    [s.threatAnalysis]: 45,
    [s.linux]: 65,
    [s.problemSolving]: 75,
  },
  "devops-engineer": {
    [s.linux]: 65,
    [s.cicd]: 50,
    [s.cloudPlatforms]: 45,
    [s.dockerK8s]: 48,
    [s.scripting]: 70,
  },
  "cloud-architect": {
    [s.cloudPlatforms]: 45,
    [s.cloudArchitecture]: 40,
    [s.networking]: 50,
    [s.security]: 45,
    [s.systemDesign]: 55,
  },
  "embedded-systems-engineer": {
    [s.cpp]: 60,
    [s.microcontrollers]: 40,
    [s.embeddedSystems]: 38,
    [s.electronicsFundamentals]: 50,
    [s.problemSolving]: 75,
  },
  "mechanical-design-engineer": {
    [s.cad3d]: 35,
    [s.engineeringDrawing]: 40,
    [s.materialManufacturing]: 38,
    [s.mechanicalAnalysis]: 35,
    [s.problemSolving]: 75,
  },
  "power-systems-engineer": {
    [s.powerSystems]: 30,
    [s.electricalMachines]: 35,
    [s.powerElectronics]: 32,
    [s.electricalProtection]: 28,
    [s.circuitAnalysis]: 45,
  },
  "structural-engineer": {
    [s.structuralAnalysis]: 35,
    [s.structuralDesign]: 38,
    [s.engineeringMechanics]: 42,
    [s.autocad]: 40,
    [s.problemSolving]: 75,
  },
  "vlsi-design-engineer": {
    [s.digitalElectronics]: 50,
    [s.verilogHdl]: 35,
    [s.vlsiDesign]: 30,
    [s.cmosSemiconductor]: 32,
    [s.problemSolving]: 75,
  },
};

/** Skill display names keyed by skillId (for the UI). */
export const SKILL_NAMES: Record<string, string> = {
  [s.python]: "Python",
  [s.sql]: "SQL",
  [s.statistics]: "Statistics",
  [s.machineLearning]: "Machine Learning",
  [s.problemSolving]: "Problem Solving",
  [s.deepLearning]: "Deep Learning",
  [s.mathStatistics]: "Mathematics & Statistics",
  [s.programming]: "Programming",
  [s.dsa]: "Data Structures & Algorithms",
  [s.databaseMgmt]: "Database Management",
  [s.softwareEngineering]: "Software Engineering",
  [s.frontend]: "Frontend Development",
  [s.backend]: "Backend Development",
  [s.apiIntegration]: "API Integration",
  [s.networkSecurity]: "Network Security",
  [s.cybersecurityFundamentals]: "Cybersecurity Fundamentals",
  [s.threatAnalysis]: "Threat Analysis",
  [s.linux]: "Linux",
  [s.cicd]: "CI/CD",
  [s.cloudPlatforms]: "Cloud Platforms",
  [s.dockerK8s]: "Docker & Kubernetes",
  [s.scripting]: "Scripting",
  [s.cloudArchitecture]: "Cloud Architecture",
  [s.networking]: "Networking",
  [s.security]: "Security",
  [s.systemDesign]: "System Design",
  [s.cpp]: "C/C++ Programming",
  [s.microcontrollers]: "Microcontrollers",
  [s.embeddedSystems]: "Embedded Systems",
  [s.electronicsFundamentals]: "Electronics Fundamentals",
  [s.cad3d]: "CAD / 3D Modelling",
  [s.engineeringDrawing]: "Engineering Drawing",
  [s.materialManufacturing]: "Material & Manufacturing",
  [s.mechanicalAnalysis]: "Mechanical Analysis",
  [s.powerSystems]: "Power Systems",
  [s.electricalMachines]: "Electrical Machines",
  [s.powerElectronics]: "Power Electronics",
  [s.electricalProtection]: "Electrical Protection",
  [s.circuitAnalysis]: "Circuit Analysis",
  [s.structuralAnalysis]: "Structural Analysis",
  [s.structuralDesign]: "Structural Design",
  [s.engineeringMechanics]: "Engineering Mechanics",
  [s.autocad]: "AutoCAD / Structural Software",
  [s.digitalElectronics]: "Digital Electronics",
  [s.verilogHdl]: "Verilog / HDL",
  [s.vlsiDesign]: "VLSI Design",
  [s.cmosSemiconductor]: "CMOS / Semiconductor Fundamentals",
};

export function skillName(id: string): string {
  return SKILL_NAMES[id] ?? id;
}

/**
 * Initial timestamped evidence records (master spec §11).
 * Statuses mix Submitted / Evaluated — Submitted ≠ Evaluated ≠ Verified.
 */
export const INITIAL_EVIDENCE: EvidenceRecord[] = [
  {
    evidenceId: "ev-1",
    studentId: "S042",
    skillId: s.machineLearning,
    skillName: "Machine Learning",
    sourceType: "Assessment",
    sourceTitle: "Technical Assessment",
    score: 43,
    status: "Evaluated",
    verificationStatus: "Pending",
    createdAt: "2026-09-15T14:30:00",
    updatedAt: "2026-09-15T14:30:00",
    description: "Technical assessment covering supervised learning fundamentals, model evaluation and basic feature engineering.",
    reference: "TA-ML-2026-09",
  },
  {
    evidenceId: "ev-2",
    studentId: "S042",
    skillId: s.python,
    skillName: "Python",
    sourceType: "Project",
    sourceTitle: "Project Evidence",
    score: null,
    status: "Submitted",
    verificationStatus: "Pending",
    createdAt: "2026-09-16T10:15:00",
    updatedAt: "2026-09-16T10:15:00",
    description: "Submitted a data-cleaning and EDA notebook for review.",
    reference: "PRJ-PY-2026-04",
  },
  {
    evidenceId: "ev-3",
    studentId: "S042",
    skillId: s.machineLearning,
    skillName: "Machine Learning",
    sourceType: "Coding / Practical",
    sourceTitle: "Practice Activity",
    score: null,
    status: "Submitted",
    verificationStatus: "Pending",
    createdAt: "2026-09-17T09:00:00",
    updatedAt: "2026-09-17T09:00:00",
    description: "45 minutes of guided ML practice on model selection and cross-validation.",
  },
  {
    evidenceId: "ev-4",
    studentId: "S042",
    skillId: s.sql,
    skillName: "SQL",
    sourceType: "Assessment",
    sourceTitle: "Technical Assessment",
    score: 64,
    status: "Evaluated",
    verificationStatus: "Pending",
    createdAt: "2026-09-14T16:45:00",
    updatedAt: "2026-09-14T16:45:00",
    description: "SQL assessment covering joins, aggregations and window functions.",
    reference: "TA-SQL-2026-08",
  },
  {
    evidenceId: "ev-5",
    studentId: "S042",
    skillId: s.statistics,
    skillName: "Statistics",
    sourceType: "Assessment",
    sourceTitle: "Coursework",
    score: 51,
    status: "Evaluated",
    verificationStatus: "Pending",
    createdAt: "2026-09-12T11:20:00",
    updatedAt: "2026-09-12T11:20:00",
    description: "Inferential statistics coursework submission.",
    reference: "CW-STAT-2026-05",
  },
  {
    evidenceId: "ev-6",
    studentId: "S042",
    skillId: s.python,
    skillName: "Python",
    sourceType: "Assessment",
    sourceTitle: "Technical Assessment",
    score: 82,
    status: "Evaluated",
    verificationStatus: "Pending",
    createdAt: "2026-09-16T18:00:00",
    updatedAt: "2026-09-16T18:00:00",
    description: "Python proficiency assessment — advanced types, data structures, OOP.",
    reference: "TA-PY-2026-12",
  },
];

/** Initial assessment results (master spec §7, §8) — assessment → competency. */
export const INITIAL_ASSESSMENT_RESULTS: AssessmentResult[] = [
  { resultId: "ar-1", studentId: "S042", roleId: "data-scientist", skillId: s.machineLearning, skillName: "Machine Learning", score: 43, assessmentId: "as-2", attemptId: "att-1", completedAt: "2026-09-15T14:30:00" },
  { resultId: "ar-2", studentId: "S042", roleId: "data-scientist", skillId: s.sql, skillName: "SQL", score: 64, assessmentId: "as-2", attemptId: "att-2", completedAt: "2026-09-14T16:45:00" },
  { resultId: "ar-3", studentId: "S042", roleId: "data-scientist", skillId: s.python, skillName: "Python", score: 82, assessmentId: "as-2", attemptId: "att-3", completedAt: "2026-09-16T18:00:00" },
  { resultId: "ar-4", studentId: "S042", roleId: "data-scientist", skillId: s.statistics, skillName: "Statistics", score: 51, assessmentId: "as-2", attemptId: "att-4", completedAt: "2026-09-12T11:20:00" },
];

/** Controlled demo readiness history (master spec §36) — only 2 labelled demo entries. */
export const INITIAL_READINESS_HISTORY: ReadinessHistoryEntry[] = [
  { date: "2026-09-15", roleId: "data-scientist", roleName: "Data Scientist", readiness: 60.7, demo: true },
  { date: "2026-09-17", roleId: "data-scientist", roleName: "Data Scientist", readiness: 60.7, demo: true },
];
