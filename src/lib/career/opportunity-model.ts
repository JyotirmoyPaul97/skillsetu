/**
 * SKILL SETU — Phase 4 Career & Opportunity Intelligence data models (master spec §2, §3, §4, §14, §25, §34).
 *
 * ONE shared Opportunity model with a `type` field (no separate Job/Internship/Project models).
 * Opportunity skills reference the SAME centralized skillIds from Phase 3 (no "Python skill" strings).
 */

import type { ConfidenceLevel, Priority } from "@/lib/intelligence";

export type OpportunityType =
  | "JOB"
  | "INTERNSHIP"
  | "PROJECT"
  | "APPRENTICESHIP"
  | "TRAINING"
  | "WORKSHOP"
  | "CERTIFICATION"
  | "MENTORSHIP";

export type OpportunityStatus = "Draft" | "Published" | "Closed" | "Archived";
export type Mode = "On-site" | "Hybrid" | "Remote" | "Online";
export type CompensationType = "Paid" | "Unpaid" | "Stipend" | "Free" | "Salary";

/** A required/preferred skill on an opportunity — references Phase 3 centralized skillIds. */
export interface OpportunitySkillReq {
  skillId: string;
  skillName: string;
  importance: number;       // 0–1 weight within this opportunity
  requiredLevel: number;    // 0–100 minimum competency
}

export interface EligibilityRules {
  yearMin?: number;        // e.g. 2 (2nd year+)
  yearMax?: number;
  branch?: string[];       // allowed branches
  cgpaMin?: number;
  requiredRoleIds?: string[]; // student must target one of these roles
  location?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  organizationType?: string;
  description: string;
  type: OpportunityType;
  location: string;
  mode: Mode;
  duration?: string;
  compensationType: CompensationType;
  compensationAmount?: string;
  applicationDeadline: string; // ISO date
  startDate?: string;
  endDate?: string;
  requiredSkills: OpportunitySkillReq[];
  preferredSkills?: OpportunitySkillReq[];
  targetRoles: string[];       // roleIds
  eligibilityRules?: EligibilityRules;
  responsibilities?: string[];
  qualifications?: string[];
  benefits?: string[];
  // project-specific
  problem?: string;
  teamSize?: string;
  mentor?: string;
  // learning-specific
  provider?: string;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Application (master spec §25) ──────────────────────────────
export type ApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "SELECTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface Application {
  id: string;
  studentId: string;
  opportunityId: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  resumeVersion?: string;
  coverLetter?: string;
  notes?: string;
  nextAction?: string;
}

// ─── Match result (master spec §14) ─────────────────────────────
export type SkillMatchStatus = "Strong Match" | "Match" | "Partial" | "Gap";

export interface SkillMatchDetail {
  skillId: string;
  skillName: string;
  requiredLevel: number;
  studentLevel: number;
  status: SkillMatchStatus;
}

export interface MatchResult {
  opportunityId: string;
  studentId: string;
  matchScore: number;          // 0–100 final
  skillAlignment: number;      // 0–100 (weight 40%)
  roleAlignment: number;       // 0–100 (weight 20%)
  evidenceStrength: number;    // 0–100 (weight 15%)
  eligibility: number;         // 0–100 (weight 10%)
  experienceAlignment: number; // 0–100 (weight 10%)
  availability: number;        // 0–100 (weight 5%)
  matchedSkills: string[];     // skillNames meeting required level
  partialSkills: string[];    // within 10 of required
  missingSkills: string[];     // below required by >10
  skillDetails: SkillMatchDetail[];
  evidenceConsidered: string[];
  potentialGap?: string;
  roleAligned: boolean;
  eligible: boolean;
  explanation: string;
  matchLabel: "Strong Match" | "Good Match" | "Potential Match" | "Low Match";
  calculatedAt: string;
}

// ─── Eligibility (master spec §34) ───────────────────────────────
export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  failedRequirements: string[];
}

// ─── Recommendation (master spec §21, §22) ──────────────────────
export interface Recommendation {
  opportunity: Opportunity;
  match: MatchResult;
  whyPoints: string[];
  currentGap?: string;
}

// ─── Deadline status (master spec §33) ───────────────────────────
export type DeadlineStatus = "Open" | "Closing Soon" | "Closed";

// ─── Career notifications (master spec §48) ──────────────────────
export type CareerNotificationType =
  | "New Match"
  | "Application Submitted"
  | "Application Status Changed"
  | "Interview Update"
  | "Closing Soon"
  | "Opportunity Recommended";

export interface CareerNotification {
  id: string;
  studentId: string;
  type: CareerNotificationType;
  title: string;
  detail: string;
  opportunityId?: string;
  time: string;
  read: boolean;
}

export const MATCH_WEIGHTS = {
  skillAlignment: 0.40,
  roleAlignment: 0.20,
  evidenceStrength: 0.15,
  eligibility: 0.10,
  experienceAlignment: 0.10,
  availability: 0.05,
} as const;

export const APPLICATION_TIMELINE: ApplicationStatus[] = [
  "APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED",
];
