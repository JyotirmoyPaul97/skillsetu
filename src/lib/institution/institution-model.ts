/**
 * SKILL SETU — Phase 7 Institution Portal data models (master spec §20, §23, §49, §60).
 *
 * Institution-specific models that AGGREGATE shared Phase 3+4+5+6 data.
 * No duplicate student/skill/evidence/opportunity/readiness models.
 */

// ─── Intervention (master spec §20, §23, §24) ───────────────────
export type InterventionType =
  | "Industry Workshop" | "Bootcamp" | "Faculty Mentorship" | "Project-Based Learning"
  | "Hackathon" | "Certification" | "Industry Project" | "Guest Lecture"
  | "Curriculum Enrichment" | "Mentor Program";

export type InterventionStatus =
  | "Recommended" | "Proposed" | "Approved" | "Scheduled" | "Active" | "Completed" | "Evaluated";

export type Priority = "Critical" | "High" | "Medium" | "Low";

export interface Intervention {
  id: string;
  skillId: string;
  skillName: string;
  department: string;
  targetCohort: string;
  owner: string;
  type: InterventionType;
  status: InterventionStatus;
  startDate?: string;
  endDate?: string;
  outcome?: string;
  expectedOutcome: string;
  reason: string;
  priority: Priority;
  affectedStudents: number;
  createdAt: string;
}

// ─── Institution user (master spec §60) ─────────────────────────
export type InstitutionRole = "Institution Admin" | "Academic Administrator" | "Placement Coordinator" | "Training & Placement" | "Department Head";

export interface InstitutionUser {
  userId: string;
  name: string;
  role: InstitutionRole;
  institution: string;
  email: string;
  avatarColor: string;
}

// ─── Institution alert (master spec §49, §50) ──────────────────
export interface InstitutionAlert {
  id: string;
  type: "Critical Skill Gap" | "Emerging Industry Skill" | "Low Practical Exposure" | "Opportunity Demand Increase" | "Low Evidence Confidence" | "Upcoming Intervention" | "Collaboration Request";
  title: string;
  detail: string;
  priority: Priority;
  skillId?: string;
  department?: string;
  time: string;
  read: boolean;
}

// ─── Institution notification (master spec §66) ────────────────
export interface InstitutionNotification {
  id: string;
  type: "Critical Skill Gap" | "New Industry Demand" | "Emerging Skill" | "Intervention Recommendation" | "Industry Collaboration" | "Hackathon Participation" | "Placement Update" | "Internship Update" | "Report Ready";
  title: string;
  detail: string;
  time: string;
  read: boolean;
}

// ─── Demand-Supply row (master spec §10, §13) ──────────────────
export interface DemandSupplyRow {
  skillId: string;
  skillName: string;
  demand: number;        // 0-100 derived from opportunities
  supply: number;        // 0-100 derived from student competency
  gap: number;
  demandSources: number;  // number of opportunities
  supplySources: number;  // number of students
  targetRoles: string[];
}

// ─── Branch × Skill matrix cell (master spec §7, §8) ───────────
export interface BranchSkillCell {
  department: string;
  skillId: string;
  skillName: string;
  avgCompetency: number;
  affectedStudents: number;
  roleRelevance: string[];
  industryDemand: "High" | "Medium" | "Low";
  gap: Priority;
}

// ─── Role readiness aggregation (master spec §17) ──────────────
export interface RoleReadinessAgg {
  roleId: string;
  roleName: string;
  avgReadiness: number;
  studentCount: number;
  topGaps: { skillName: string; avgCompetency: number }[];
  evidenceConfidence: string;
}

// ─── Cohort intervention need (master spec §19) ────────────────
export interface CohortIntervention {
  skillId: string;
  skillName: string;
  gap: Priority;
  affectedStudents: number;
  avgCompetency: number;
  targetRoles: string[];
  suggestedAction: InterventionType;
  reason: string;
}

// ─── Executive summary (master spec §4) ────────────────────────
export interface ExecutiveSummary {
  strong: string[];
  needsAttention: string[];
  emerging: string[];
  suggestedActions: string[];
}
