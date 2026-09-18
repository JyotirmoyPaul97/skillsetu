/**
 * SKILL SETU — Phase 8 Hackathon & Challenge Intelligence models (master spec §3, §10, §11, §19-22, §27, §32-33, §39-40, §44-45, §50-52).
 *
 * All required/preferred skills reference the EXISTING Phase 3 centralized skillIds.
 * No duplicate student/skill/evidence/opportunity models.
 */

import type { SkillImportance } from "@/lib/industry/industry-model";

// ─── Hackathon (§3, §4) ──────────────────────────────────────────
export type HackathonStatus = "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "LIVE" | "SUBMISSION_OPEN" | "EVALUATION" | "COMPLETED" | "ARCHIVED";
export type HackathonMode = "On-site" | "Hybrid" | "Remote" | "Online";
export type HackathonCategory = "AI / ML" | "Data Science" | "Web Development" | "Cybersecurity" | "Cloud" | "FinTech" | "Healthcare" | "Education" | "Sustainability" | "Embedded Systems" | "IoT" | "Blockchain / Web3" | "Social Impact" | "Open Innovation";

export interface HackathonRequiredSkill {
  skillId: string;
  skillName: string;
  importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  requiredLevel: number; // 0–100
}

export interface HackathonTrack {
  id: string;
  name: string;
  description: string;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  weight: number; // 0-1, must sum to 1
}

export interface HackathonResource {
  type: "Dataset" | "API Documentation" | "Starter Repository" | "Reference" | "Template" | "Documentation" | "Design Assets";
  title: string;
  url?: string;
}

export interface HackathonEligibility {
  yearMin?: number;
  yearMax?: number;
  department?: string[];
  cgpaMin?: number;
  requiredRoleIds?: string[];
}

export interface Hackathon {
  id: string;
  title: string;
  description: string;
  organizer: string;
  organizerType: "Industry" | "Institution" | "Community";
  domain: string;
  category: HackathonCategory;
  theme?: string;
  mode: HackathonMode;
  location: string;
  registrationStart: string;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  status: HackathonStatus;
  minTeamSize: number;
  maxTeamSize: number;
  soloAllowed: boolean;
  crossCollegeAllowed: boolean;
  crossYearAllowed: boolean;
  crossDepartmentAllowed: boolean;
  maxTeamsPerParticipant: number;
  eligibilityRules?: HackathonEligibility;
  tracks?: HackathonTrack[];
  evaluationCriteria: EvaluationCriterion[];
  resources?: HackathonResource[];
  requiredSkills: HackathonRequiredSkill[];
  createdAt: string;
  updatedAt: string;
}

// ─── Problem Statement (§10) ──────────────────────────────────
export type ProblemDifficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";
export type ProblemStatus = "Open" | "Assigned" | "Closed";

export interface ProblemStatement {
  id: string;
  hackathonId: string;
  title: string;
  description: string;
  background: string;
  objective: string;
  expectedOutcome: string;
  domain: string;
  difficulty: ProblemDifficulty;
  constraints?: string;
  requiredSkills: HackathonRequiredSkill[];
  preferredSkills?: HackathonRequiredSkill[];
  technologyTags: string[];
  resources?: HackathonResource[];
  submissionRequirements?: string;
  status: ProblemStatus;
}

// ─── Registration (§17, §18) ──────────────────────────────────
export type RegistrationStatus = "Registered" | "Team Forming" | "Team Formed" | "Submission Pending" | "Submitted" | "Completed";

export interface HackathonRegistration {
  id: string;
  studentId: string;
  studentName: string;
  hackathonId: string;
  status: RegistrationStatus;
  registeredAt: string;
}

// ─── Team (§20, §21, §22) ──────────────────────────────────────
export type TeamStatus = "Forming" | "Formed" | "Building" | "Submitted" | "Evaluated" | "Disbanded";
export type TeamMemberStatus = "Leader" | "Member" | "Invited" | "Requested" | "Left";

export interface TeamRole {
  name: string;
  requiredSkills: { skillId: string; skillName: string }[];
  open: number;
}

export interface TeamMember {
  studentId: string;
  studentName: string;
  teamRole: string;
  joinedAt: string;
  status: TeamMemberStatus;
}

export interface Team {
  id: string;
  hackathonId: string;
  problemStatementId?: string;
  name: string;
  leaderId: string;
  members: TeamMember[];
  openRoles: TeamRole[];
  status: TeamStatus;
  createdAt: string;
}

// ─── Milestones & Tasks (§32, §33) ────────────────────────────
export type MilestoneStatus = "Not Started" | "In Progress" | "Completed" | "Overdue";
export type TaskStatus = "Todo" | "In Progress" | "Blocked" | "Done";

export interface Milestone {
  id: string;
  teamId: string;
  title: string;
  description: string;
  deadline?: string;
  status: MilestoneStatus;
  assignedMembers: string[];
  deliverable?: string;
}

export interface Task {
  id: string;
  teamId: string;
  title: string;
  description: string;
  assignedTo?: string;
  priority: "High" | "Medium" | "Low";
  deadline?: string;
  status: TaskStatus;
}

// ─── Submission (§39, §40) ─────────────────────────────────────
export type SubmissionVersion = "Draft" | "Version 1" | "Version 2" | "Final";
export type SubmissionStatus = "Draft" | "Submitted" | "Under Review" | "Evaluated";

export interface TeamContribution {
  studentId: string;
  studentName: string;
  role: string;
  contribution: string;
  technologies: string[];
  skillsDemonstrated: { skillId: string; skillName: string }[];
}

export interface Submission {
  id: string;
  teamId: string;
  hackathonId: string;
  problemStatementId?: string;
  projectTitle: string;
  description: string;
  problemSolved: string;
  approach: string;
  architecture?: string;
  technology: string[];
  githubUrl?: string;
  githubStatus: "Not Linked" | "Submitted" | "Pending Verification" | "Verified";
  liveDemoUrl?: string;
  contributions: TeamContribution[];
  version: SubmissionVersion;
  status: SubmissionStatus;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Evaluation (§44, §45, §48) ────────────────────────────────
export type EvaluationStatus = "Not Started" | "In Progress" | "Submitted" | "Reviewed";

export interface EvaluationScore {
  criterionId: string;
  criterionName: string;
  score: number; // 0-100
  weight: number; // 0-1
  comment?: string;
}

export interface Evaluation {
  id: string;
  submissionId: string;
  teamId: string;
  hackathonId: string;
  evaluatorName: string;
  scores: EvaluationScore[];
  totalScore: number; // calculated
  feedback: {
    technicalStrengths?: string;
    technicalWeaknesses?: string;
    innovation?: string;
    problemSolving?: string;
    professionalSkills?: string;
    recommendations?: string;
  };
  status: EvaluationStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Mentor (§35-38) ──────────────────────────────────────────
export type MentorCategory = "Technical" | "AI/ML" | "Cloud" | "Cybersecurity" | "Product" | "Domain" | "Career";
export type MentorAvailability = "Available" | "Limited" | "Unavailable";

export interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  skills: { skillId: string; skillName: string }[];
  domain: string;
  category: MentorCategory;
  availability: MentorAvailability;
  bio: string;
}

export type MentorSessionStatus = "Requested" | "Accepted" | "Scheduled" | "Completed" | "Cancelled";

export interface HackathonMentorSession {
  id: string;
  teamId: string;
  teamName: string;
  mentorId: string;
  mentorName: string;
  topic: string;
  skillId?: string;
  skillName?: string;
  date: string;
  time: string;
  status: MentorSessionStatus;
  notes?: string;
  feedback?: string;
}

// ─── Hackathon Activity (§71) ─────────────────────────────────
export interface HackathonActivity {
  id: string;
  hackathonId?: string;
  teamId?: string;
  timestamp: string;
  actor: string;
  event: string;
  entity: string;
}

// ─── Team Coverage (§27, §28) ─────────────────────────────────
export interface TeamCoverageRow {
  skillId: string;
  skillName: string;
  requiredLevel: number;
  bestMemberCompetency: number;
  coverage: number; // 0-1
  status: "Covered" | "Partial" | "Missing";
  coveredBy?: string;
}

export interface TeamCoverage {
  teamId: string;
  coverage: number; // 0-100
  covered: string[];
  partial: string[];
  missing: string[];
  rows: TeamCoverageRow[];
}
