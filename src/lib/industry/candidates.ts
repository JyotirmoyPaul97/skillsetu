/**
 * SKILL SETU — Phase 5 demo candidate pool (master spec §64, §66).
 *
 * These are READ-ONLY views of students for the Industry Portal. S042 uses the SAME
 * data as Phase 3 (no duplicate). Other candidates are controlled DEMO DATA.
 * All competencies reference the centralized Phase 3 skillIds.
 */

import { DEMO_ROLE_PROFILES, INITIAL_EVIDENCE, skillName, SKILL_NAMES } from "@/lib/intelligence/demo-data";
import { calculateRoleReadiness, calculateEvidenceConfidence } from "@/lib/intelligence/engine";
import { SKILL_IDS } from "@/lib/intelligence/role-config";
import type { EvidenceRecord, Competency } from "@/lib/intelligence/types";
import type { Candidate } from "./industry-model";

const s = SKILL_IDS;

function buildCompetencies(profile: Record<string, number>, evidence: EvidenceRecord[]): Record<string, Competency> {
  const out: Record<string, Competency> = {};
  for (const [skillId, score] of Object.entries(profile)) {
    const ev = evidence.filter((e) => e.skillId === skillId);
    const conf = calculateEvidenceConfidence(skillId, evidence);
    out[skillId] = {
      skillId,
      skillName: skillName(skillId),
      competencyScore: score,
      evidenceConfidence: conf.level,
      evidenceConfidencePercent: conf.percent,
      lastUpdated: ev.length ? ev.map((e) => e.createdAt).sort().reverse()[0] : new Date().toISOString(),
      evidenceCount: ev.length,
      evidenceIds: ev.map((e) => e.evidenceId),
    };
  }
  return out;
}

// Candidate evidence (controlled demo — some shared with S042's INITIAL_EVIDENCE)
function makeEvidence(studentId: string, rows: { id: string; skillId: string; source: string; score: number | null; status: "Evaluated" | "Submitted"; date: string }[]): EvidenceRecord[] {
  return rows.map((r) => ({
    evidenceId: r.id,
    studentId,
    skillId: r.skillId,
    skillName: SKILL_NAMES[r.skillId] ?? r.skillId,
    sourceType: "Assessment" as const,
    sourceTitle: r.source,
    score: r.score,
    status: r.status,
    verificationStatus: "Pending" as const,
    createdAt: r.date,
    updatedAt: r.date,
    description: `${r.source} for ${SKILL_NAMES[r.skillId] ?? r.skillId}.`,
  }));
}

// S042 — reuses Phase 3 exact data (no duplicate)
const s042Profile = DEMO_ROLE_PROFILES["data-scientist"];
const s042Readiness = calculateRoleReadiness("S042", "data-scientist", buildCompetencies(s042Profile, INITIAL_EVIDENCE), INITIAL_EVIDENCE);

// Other demo candidates
const s051Profile: Record<string, number> = {
  [s.python]: 85, [s.machineLearning]: 78, [s.deepLearning]: 62, [s.mathStatistics]: 70, [s.problemSolving]: 80,
};
const s051Evidence = makeEvidence("S051", [
  { id: "ev-s051-1", skillId: s.python, source: "Technical Assessment", score: 85, status: "Evaluated", date: "2026-09-14T10:00:00" },
  { id: "ev-s051-2", skillId: s.machineLearning, source: "Technical Assessment", score: 78, status: "Evaluated", date: "2026-09-15T12:00:00" },
  { id: "ev-s051-3", skillId: s.deepLearning, source: "Project Evidence", score: null, status: "Submitted", date: "2026-09-16T09:00:00" },
]);
const s051Comps = buildCompetencies(s051Profile, s051Evidence);
const s051Readiness = calculateRoleReadiness("S051", "ml-engineer", s051Comps, s051Evidence);

const s038Profile: Record<string, number> = {
  [s.frontend]: 80, [s.backend]: 75, [s.databaseMgmt]: 70, [s.apiIntegration]: 65, [s.problemSolving]: 78,
};
const s038Evidence = makeEvidence("S038", [
  { id: "ev-s038-1", skillId: s.frontend, source: "Technical Assessment", score: 80, status: "Evaluated", date: "2026-09-13T11:00:00" },
  { id: "ev-s038-2", skillId: s.backend, source: "Project Evidence", score: 75, status: "Evaluated", date: "2026-09-14T15:00:00" },
]);
const s038Comps = buildCompetencies(s038Profile, s038Evidence);
const s038Readiness = calculateRoleReadiness("S038", "full-stack-developer", s038Comps, s038Evidence);

const s067Profile: Record<string, number> = {
  [s.python]: 75, [s.sql]: 70, [s.statistics]: 65, [s.machineLearning]: 55, [s.problemSolving]: 72,
};
const s067Evidence = makeEvidence("S067", [
  { id: "ev-s067-1", skillId: s.python, source: "Technical Assessment", score: 75, status: "Evaluated", date: "2026-09-12T10:00:00" },
  { id: "ev-s067-2", skillId: s.machineLearning, source: "Technical Assessment", score: 55, status: "Evaluated", date: "2026-09-15T14:00:00" },
]);
const s067Comps = buildCompetencies(s067Profile, s067Evidence);
const s067Readiness = calculateRoleReadiness("S067", "data-scientist", s067Comps, s067Evidence);

export const DEMO_CANDIDATES: Candidate[] = [
  {
    studentId: "S042", name: "Aarav Sharma", branch: "AI & Data Science", year: 3,
    college: "IIT Madras", targetRole: "Data Scientist", roleId: "data-scientist",
    roleReadiness: s042Readiness.displayValue,
    competencies: buildCompetencies(s042Profile, INITIAL_EVIDENCE),
    evidence: INITIAL_EVIDENCE, avatarColor: "#0D9488", cgpa: 8.4, location: "Chennai", available: true,
  },
  {
    studentId: "S051", name: "Priya Nair", branch: "AI & Data Science", year: 4,
    college: "IIT Madras", targetRole: "ML Engineer", roleId: "ml-engineer",
    roleReadiness: s051Readiness.displayValue,
    competencies: s051Comps, evidence: s051Evidence, avatarColor: "#6D28D9", cgpa: 9.1, location: "Chennai", available: true,
  },
  {
    studentId: "S038", name: "Rohan Gupta", branch: "Computer Science", year: 4,
    college: "NIT Trichy", targetRole: "Full Stack Developer", roleId: "full-stack-developer",
    roleReadiness: s038Readiness.displayValue,
    competencies: s038Comps, evidence: s038Evidence, avatarColor: "#2563EB", cgpa: 8.7, location: "Tiruchirappalli", available: true,
  },
  {
    studentId: "S067", name: "Sneha Patel", branch: "Data Science", year: 3,
    college: "VIT Vellore", targetRole: "Data Scientist", roleId: "data-scientist",
    roleReadiness: s067Readiness.displayValue,
    competencies: s067Comps, evidence: s067Evidence, avatarColor: "#EA580C", cgpa: 8.6, location: "Vellore", available: false,
  },
];

export function findCandidate(studentId: string): Candidate | undefined {
  return DEMO_CANDIDATES.find((c) => c.studentId === studentId);
}

export const DEMO_COMPANY = {
  companyName: "Nova Analytics",
  industry: "Data & Analytics",
  website: "https://nova-analytics.demo",
  location: "Pune, India",
  about: "Nova Analytics is a data & analytics product company building intelligence platforms for enterprise. We hire evidence-backed talent through SKILL SETU.",
  activeOpportunities: 3,
  challenges: 1,
  mentors: 2,
};

export const DEMO_INDUSTRY_USER = {
  userId: "IU-001",
  name: "Meera Krishnan",
  role: "Recruiter" as const,
  organization: "Nova Analytics",
  email: "meera@nova-analytics.demo",
  avatarColor: "#B45309",
};
