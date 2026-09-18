/**
 * SKILL SETU — Phase 5 Industry Portal data models (master spec §6, §8, §30, §33, §36, §51, §52, §53, §55).
 *
 * Industry-specific models that COMPLEMENT (not duplicate) Phase 3+4.
 * Student/Skill/Competency/Evidence/Opportunity/Application models are reused from Phase 3+4.
 */

import type { OpportunityType } from "@/lib/career/opportunity-model";

// ─── Demand config (master spec §6, §7, §8) ─────────────────────
export type SkillImportance = "Critical" | "High" | "Medium" | "Low";

export interface DemandSkill {
  skillId: string;
  skillName: string;
  importance: SkillImportance;
  requiredLevel: number;   // 0–100
  preferredLevel?: number; // 0–100
}

export interface DemandConfig {
  id: string;
  roleId: string;
  roleName: string;
  skills: DemandSkill[];
  opportunityType: OpportunityType;
  eligibility?: { yearMin?: number; branch?: string[]; cgpaMin?: number; requiredRoleIds?: string[] };
  experience?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Industry feedback (master spec §30, §31, §33) ──────────────
export type FeedbackCategory = "Technical" | "Problem Solving" | "Communication" | "Teamwork" | "Leadership" | "Adaptability" | "Professionalism";
export type FeedbackStatus = "Draft" | "Submitted" | "Reviewed";

export interface IndustryFeedback {
  id: string;
  studentId: string;
  studentName: string;
  opportunityId?: string;
  opportunityTitle?: string;
  experience: string;       // internship/project/hackathon
  technicalFeedback: string;
  professionalFeedback: string;
  strengths: string;
  areasForImprovement: string;
  skillScores: { skillId: string; skillName: string; score: number }[];
  categoryScores: { category: FeedbackCategory; score: number }[];
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Challenge (master spec §36, §37) — industry-side entry point ──
export interface Challenge {
  id: string;
  title: string;
  description: string;
  domain: string;
  objective: string;
  expectedOutcome: string;
  requiredSkills: { skillId: string; skillName: string; requiredLevel: number }[];
  preferredSkills?: { skillId: string; skillName: string }[];
  eligibility?: { yearMin?: number; branch?: string[] };
  mode: string;
  startDate: string;
  endDate: string;
  teamSize: string;
  evaluationCriteria: string[];
  resources?: string[];
  status: "Draft" | "Published" | "Closed";
  createdAt: string;
}

// ─── Invitation (master spec §27, §28, §29) ──────────────────────
export type InvitationType = "Interview" | "Internship" | "Project" | "Mentorship";
export type InvitationStatus = "Pending" | "Accepted" | "Declined" | "Completed";

export interface Invitation {
  id: string;
  studentId: string;
  studentName: string;
  opportunityId?: string;
  opportunityTitle?: string;
  type: InvitationType;
  message: string;
  date?: string;
  status: InvitationStatus;
  createdAt: string;
}

// ─── Audit log (master spec §55) ────────────────────────────────
export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
}

// ─── Industry user + company (master spec §51, §52, §53) ────────
export type IndustryRole = "Recruiter" | "Hiring Manager" | "Mentor" | "Evaluator" | "Admin";

export interface IndustryUser {
  userId: string;
  name: string;
  role: IndustryRole;
  organization: string;
  email: string;
  avatarColor: string;
}

export interface CompanyProfile {
  companyName: string;
  industry: string;
  website: string;
  location: string;
  about: string;
  activeOpportunities: number;
  challenges: number;
  mentors: number;
}

// ─── Industry notification (master spec §54) ─────────────────────
export interface IndustryNotification {
  id: string;
  type: "New Applicant" | "Candidate Match" | "Application Update" | "Interview Response" | "Project Submission" | "Evaluation Due" | "Mentor Request" | "Feedback Reminder" | "Opportunity Deadline";
  title: string;
  detail: string;
  opportunityId?: string;
  studentId?: string;
  time: string;
  read: boolean;
}

// ─── Candidate (read-only view of a student for industry) ───────
export interface Candidate {
  studentId: string;
  name: string;
  branch: string;
  year: number;
  college: string;
  targetRole: string;
  roleId: string;
  roleReadiness: number;     // calculated from Phase 3
  competencies: Record<string, { skillId: string; skillName: string; competencyScore: number; evidenceConfidence: string; evidenceCount: number }>;
  evidence: import("@/lib/intelligence/types").EvidenceRecord[];
  avatarColor: string;
  cgpa: number;
  location: string;
  available: boolean;
}
