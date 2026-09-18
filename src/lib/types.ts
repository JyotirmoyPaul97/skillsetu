import type { Role, EvidenceType, OpportunityType, ApplicationStatus } from "@prisma/client";

// ─── Auth ────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarColor: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type RegisterRole = "STUDENT" | "INDUSTRY" | "ACADEMIA" | "INSTITUTION";

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: RegisterRole;
  // role-specific optional fields
  rollNo?: string;
  branch?: string;
  year?: number;
  cgpa?: number;
  targetRole?: string;
  institutionId?: string;
  companyName?: string;
  industry?: string;
  website?: string;
  location?: string;
  size?: string;
  department?: string;
  designation?: string;
  researchAreas?: string;
}

// ─── Skill / Evidence / Passport ─────────────────────────────────
export interface SkillInfo {
  id: string;
  name: string;
  category: string;
}

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  score: number;
  verified: boolean;
  provider: string;
  skill: SkillInfo;
  createdAt: string;
}

export interface SkillAgg {
  skill: SkillInfo;
  level: number; // 0-100 derived from evidence
  evidenceCount: number;
  verifiedCount: number;
  topEvidence: EvidenceItem | null;
}

export interface GapItem {
  skill: SkillInfo;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  weight: number;
  suggestions: string[];
}

export interface SkillPassport {
  targetRole: string;
  overallReadiness: number; // 0-100
  skills: SkillAgg[];
  gaps: GapItem[];
  evidence: EvidenceItem[];
  feedbackReceived: FeedbackItem[];
}

// ─── Opportunities / Applications ─────────────────────────────────
export interface RequiredSkill {
  name: string;
  weight: number;
  minLevel: number;
}

export interface OpportunityCard {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  requiredSkills: RequiredSkill[];
  location: string;
  stipend: string;
  deadline: string;
  openings: number;
  status: string;
  industry: { id: string; name: string; avatarColor: string; industry?: string; location?: string };
  createdAt: string;
  matchScore?: number; // when student context
  applied?: boolean;
}

export interface ApplicationRow {
  id: string;
  status: ApplicationStatus;
  matchScore: number;
  coverNote: string;
  createdAt: string;
  opportunity: OpportunityCard;
}

export interface TalentRow {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  branch: string;
  year: number;
  cgpa: number;
  targetRole: string;
  matchScore: number;
  topSkills: { name: string; level: number }[];
  institutionName?: string;
}

// ─── Feedback ─────────────────────────────────────────────────────
export interface FeedbackItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  fromUser: { id: string; name: string; avatarColor: string; role: Role };
  opportunity?: { id: string; title: string } | null;
}

// ─── Academia / Curriculum ────────────────────────────────────────
export interface CurriculumGapRow {
  id: string;
  branch: string;
  skill: SkillInfo;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  recommendation: string;
}

// ─── Institution analytics ────────────────────────────────────────
export interface BranchStatRow {
  branch: string;
  academicYear: string;
  avgSkillScore: number;
  placementRate: number;
  internshipRate: number;
  studentCount: number;
}

export interface PlacementRow {
  branch: string;
  academicYear: string;
  totalStudents: number;
  placed: number;
  avgPackage: number;
  topRecruiters: string[];
}

// ─── AI ────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface TeamBuildResult {
  projectName: string;
  members: TalentRow[];
  reasoning: string;
}
