/**
 * SKILL SETU — Phase 6 Academia Portal data models (master spec §12, §19, §26, §28, §30, §45, §65).
 *
 * Academic-specific models that COMPLEMENT (not duplicate) Phase 3+4+5.
 * Student/Skill/Role/Competency/Evidence/Opportunity/Application models are reused.
 */

// ─── Curriculum (master spec §12, §13) ──────────────────────────
export type CoverageLevel = "Not Covered" | "Introductory" | "Moderate" | "Strong";

export interface Course {
  id: string;
  name: string;
  department: string;
  semester: number;
}

export interface CurriculumSkillCoverage {
  courseId: string;
  courseName: string;
  skillId: string;
  skillName: string;
  coverage: CoverageLevel;
}

export interface Department {
  id: string;
  name: string;
  institution: string;
}

// ─── Faculty opportunities (master spec §19, §20) ──────────────
export type FacultyOppType = "FACULTY_INTERNSHIP" | "INDUSTRIAL_TRAINING" | "FDP" | "CONSULTANCY" | "RESEARCH_COLLABORATION" | "MENTORSHIP" | "GUEST_LECTURE" | "WORKSHOP";

export interface FacultyOpportunity {
  id: string;
  title: string;
  organization: string;
  type: FacultyOppType;
  description: string;
  location: string;
  mode: string;
  duration: string;
  deadline: string;
  skills: { skillId: string; skillName: string }[];
  targetRoles: string[];
  eligibility: string;
  responsibilities?: string[];
  expectedOutcomes?: string;
  contact?: string;
  status: "Published" | "Closed";
  createdAt: string;
}

// ─── Faculty application (reuses Phase 4 application status) ─────
export type FacultyAppStatus = "Applied" | "Under Review" | "Shortlisted" | "Selected" | "Rejected";

export interface FacultyApplication {
  id: string;
  facultyId: string;
  opportunityId: string;
  status: FacultyAppStatus;
  appliedAt: string;
}

// ─── Collaboration (master spec §45, §46) ──────────────────────
export type CollaborationType = "Workshop" | "Guest Lecture" | "Live Project" | "Mentorship" | "Innovation Challenge" | "Research" | "Faculty Training";
export type CollaborationStatus = "Proposed" | "Approved" | "Scheduled" | "Active" | "Completed" | "Feedback";

export interface Collaboration {
  id: string;
  organization: string;
  type: CollaborationType;
  title: string;
  skills: { skillId: string; skillName: string }[];
  targetRoles: string[];
  participants: number;
  date: string;
  status: CollaborationStatus;
  outcome?: string;
  requestedBy: "Academia" | "Industry";
  createdAt: string;
}

// ─── Mentorship (master spec §28, §29, §30) ────────────────────
export type SessionStatus = "Requested" | "Accepted" | "Scheduled" | "Completed" | "Cancelled";

export interface MentorshipSession {
  id: string;
  studentId: string;
  studentName: string;
  facultyId: string;
  facultyName: string;
  skillId: string;
  skillName: string;
  topic: string;
  date: string;
  time: string;
  status: SessionStatus;
  notes?: string;
}

// ─── Faculty profile (master spec §65, §66) ────────────────────
export interface FacultyProfile {
  facultyId: string;
  name: string;
  department: string;
  institution: string;
  expertise: string[];
  skills: { skillId: string; skillName: string }[];
  researchDomains: string[];
  mentoringAreas: string[];
  availability: "Available" | "Limited" | "Unavailable";
  bio: string;
}

// ─── Academia notification (master spec §70) ────────────────────
export interface AcademiaNotification {
  id: string;
  type: "New Industry Signal" | "Curriculum Alert" | "Faculty Opportunity" | "Mentor Request" | "Workshop Request" | "Collaboration Update" | "Research Opportunity" | "Student Recommendation" | "Feedback Request" | "Project Invitation";
  title: string;
  detail: string;
  time: string;
  read: boolean;
}

// ─── Curriculum alignment result (master spec §11, §14) ────────
export interface CurriculumAlignmentRow {
  skillId: string;
  skillName: string;
  industryDemand: "High" | "Medium" | "Low";
  demandCount: number;
  curriculumCoverage: CoverageLevel;
  alignment: "Aligned" | "Needs Attention" | "Gap";
  studentAvgCompetency: number;
  practicalEvidence: "Strong" | "Moderate" | "Limited" | "None";
  practicalExposureGap: "Low" | "Medium" | "High";
  targetRoles: string[];
  suggestedEnrichment: string[];
}

// ─── Industry skill signal (master spec §5) ───────────────────
export interface IndustrySkillSignal {
  skillId: string;
  skillName: string;
  demandLevel: "High" | "Medium" | "Low";
  opportunityCount: number;
  targetRoles: string[];
  recentSignal: string;
}

// ─── Student cohort gap (master spec §9, §10) ──────────────────
export interface CohortSkillGap {
  skillId: string;
  skillName: string;
  avgCompetency: number;
  gap: "High" | "Medium" | "Low";
  affectedStudents: number;
  roleImportance: number;
  targetRoles: string[];
}
