/**
 * SKILL SETU — Phase 3 Intelligence Engine data models (master spec §2, §5, §7, §9, §14, §21, §26).
 * Pure TypeScript types shared by the engine, store, and UI.
 */

export type EvidenceStatus = "Submitted" | "Pending Evaluation" | "Evaluated" | "Verified";
export type VerificationStatus = "Pending" | "Verified" | "Rejected";
export type EvidenceSourceType =
  | "Assessment"
  | "Coding / Practical"
  | "Project"
  | "Git Repository"
  | "Certification"
  | "Internship"
  | "Hackathon"
  | "Faculty Feedback"
  | "IndustryFeedback"
  | "MentorFeedback";

export type ConfidenceLevel = "Limited" | "Moderate" | "Higher" | "Strong" | "None";
export type Priority = "High" | "Medium" | "Low";

// ─── Student ────────────────────────────────────────────────────
export interface Student {
  studentId: string;       // S042
  name: string;
  branch: string;
  year: number;
  college: string;
  location: string;
  avatarColor: string;
}

// ─── Competency (master spec §5) ────────────────────────────────
export interface Competency {
  skillId: string;
  skillName: string;
  competencyScore: number;     // 0–100 — what the system estimates the student can demonstrate
  evidenceConfidence: ConfidenceLevel; // how strongly evidence supports the estimate
  evidenceConfidencePercent: number;   // 0–100 supporting metric
  lastUpdated: string;        // ISO date
  evidenceCount: number;
  evidenceIds: string[];
}

// ─── Evidence (master spec §9) ──────────────────────────────────
export interface EvidenceRecord {
  evidenceId: string;
  studentId: string;
  skillId: string;
  skillName: string;
  sourceType: EvidenceSourceType;
  sourceTitle: string;
  score: number | null;       // null when not scored (e.g. practice, submitted project)
  status: EvidenceStatus;
  verificationStatus: VerificationStatus;
  createdAt: string;          // ISO datetime
  updatedAt: string;
  description: string;
  reference?: string;
}

// ─── Assessment result (master spec §7) ────────────────────────
export interface AssessmentResult {
  resultId: string;
  studentId: string;
  roleId: string;
  skillId: string;
  skillName: string;
  score: number;
  assessmentId: string;
  attemptId: string;
  completedAt: string; // ISO datetime
}

// ─── Readiness result (master spec §14) ─────────────────────────
export interface SkillBreakdownRow {
  skillId: string;
  skill: string;
  competency: number;
  importance: number;       // 0–1
  importancePercent: number; // 0–100
  contribution: number;     // competency × importance (since weights sum to 1)
  evidenceConfidence: ConfidenceLevel;
  evidenceCount: number;
}

export interface ReadinessResult {
  studentId: string;
  roleId: string;
  roleName: string;
  value: number;             // raw calculated value (e.g. 60.70)
  displayValue: number;      // rounded for display (e.g. 61)
  calculatedAt: string;
  skillBreakdown: SkillBreakdownRow[];
  evidenceIds: string[];
  explanation: string;
  status: "Calculated" | "Error";
  error?: string;
}

// ─── Skill gap (master spec §21) ────────────────────────────────
export interface SkillGap {
  skillId: string;
  skill: string;
  currentScore: number;
  targetScore: number;       // configured prototype threshold (70)
  gap: number;               // target - current (positive only)
  roleImportance: number;    // 0–1
  roleImportancePercent: number;
  priority: Priority;
  priorityScore: number;     // deterministic ranking score
  evidenceConfidence: ConfidenceLevel;
  reason: string;
}

// ─── Next Best Action (master spec §26) ─────────────────────────
export type ActionType =
  | "Practice Skill"
  | "Build Project"
  | "Join Hackathon"
  | "Complete Learning"
  | "Seek Mentor"
  | "Complete Certification"
  | "Apply for Internship"
  | "Apply for Job"
  | "Retake Assessment";

export interface NextAction {
  action: ActionType;
  actionTitle: string;
  skillId: string;
  skill: string;
  priority: Priority;
  reason: string;
  projectedImpact: Priority;
  whyPoints: string[];       // supporting reasons
  gapRef?: SkillGap;
  roleRelevance: number;     // role importance 0–1
  evidenceValue: ConfidenceLevel;
}

// ─── Readiness history (master spec §36) ───────────────────────
export interface ReadinessHistoryEntry {
  date: string;
  roleId: string;
  roleName: string;
  readiness: number;
  demo: boolean; // labelled demo data
}

// ─── What-If projection (master spec §35) ──────────────────────
export interface WhatIfProjection {
  skillId: string;
  skill: string;
  currentScore: number;
  projectedScore: number;
  currentReadiness: number;
  projectedReadiness: number;
  currentDisplay: number;
  projectedDisplay: number;
  label: "Projected / What-If";
}

// ─── Service result wrapper (for error handling, §45) ───────────
export interface IntelligenceError {
  ok: false;
  error: string;
}
export interface IntelligenceOk<T> {
  ok: true;
  data: T;
}
export type IntelligenceResult<T> = IntelligenceOk<T> | IntelligenceError;
