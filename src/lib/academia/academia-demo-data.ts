/**
 * SKILL SETU — Phase 6 Academia demo data (master spec §76, §78).
 *
 * Controlled DEMO DATA. Courses/curriculum reference centralized Phase 3 skillIds.
 * Industry signals are derived from Phase 4/5 opportunity data (not duplicated).
 * Faculty user: Dr. Meena Krishnan, Computer Science, IIT Madras.
 */

import { SKILL_IDS } from "@/lib/intelligence/role-config";
import { skillName } from "@/lib/intelligence/demo-data";
import type { Course, CurriculumSkillCoverage, Department, FacultyOpportunity, Collaboration, FacultyProfile, CoverageLevel } from "./academia-model";

const s = SKILL_IDS;

// ─── Institution + departments ──────────────────────────────────
export const DEMO_INSTITUTION = {
  name: "Indian Institute of Technology, Madras",
  location: "Chennai, Tamil Nadu",
};

export const DEMO_DEPARTMENTS: Department[] = [
  { id: "dept-ai", name: "AI & Data Science", institution: DEMO_INSTITUTION.name },
  { id: "dept-cs", name: "Computer Science", institution: DEMO_INSTITUTION.name },
  { id: "dept-ec", name: "Electronics & Communication", institution: DEMO_INSTITUTION.name },
  { id: "dept-me", name: "Mechanical", institution: DEMO_INSTITUTION.name },
  { id: "dept-cv", name: "Civil", institution: DEMO_INSTITUTION.name },
];

// ─── Courses + curriculum skill coverage (§78) ────────────────
export const DEMO_COURSES: Course[] = [
  { id: "crs-ml", name: "Machine Learning", department: "AI & Data Science", semester: 5 },
  { id: "crs-db", name: "Database Management", department: "Computer Science", semester: 3 },
  { id: "crs-py", name: "Python Programming", department: "AI & Data Science", semester: 2 },
  { id: "crs-cloud", name: "Cloud Computing", department: "Computer Science", semester: 6 },
  { id: "crs-stats", name: "Probability & Statistics", department: "AI & Data Science", semester: 3 },
  { id: "crs-sec", name: "Information Security", department: "Computer Science", semester: 7 },
];

function cov(courseId: string, courseName: string, skillId: string, level: CoverageLevel): CurriculumSkillCoverage {
  return { courseId, courseName, skillId, skillName: skillName(skillId), coverage: level };
}

export const DEMO_CURRICULUM: CurriculumSkillCoverage[] = [
  cov("crs-ml", "Machine Learning", s.machineLearning, "Moderate"),
  cov("crs-ml", "Machine Learning", s.statistics, "Introductory"),
  cov("crs-ml", "Machine Learning", s.python, "Strong"),
  cov("crs-db", "Database Management", s.sql, "Strong"),
  cov("crs-db", "Database Management", s.databaseMgmt, "Moderate"),
  cov("crs-py", "Python Programming", s.python, "Strong"),
  cov("crs-py", "Python Programming", s.problemSolving, "Moderate"),
  cov("crs-cloud", "Cloud Computing", s.cloudPlatforms, "Introductory"),
  cov("crs-cloud", "Cloud Computing", s.dockerK8s, "Not Covered"),
  cov("crs-cloud", "Cloud Computing", s.cloudArchitecture, "Introductory"),
  cov("crs-stats", "Probability & Statistics", s.statistics, "Moderate"),
  cov("crs-stats", "Probability & Statistics", s.mathStatistics, "Moderate"),
  cov("crs-sec", "Information Security", s.networkSecurity, "Introductory"),
  cov("crs-sec", "Information Security", s.cybersecurityFundamentals, "Moderate"),
];

// ─── Faculty profile (§65, §66) ────────────────────────────────
export const DEMO_FACULTY: FacultyProfile = {
  facultyId: "F-001",
  name: "Dr. Meena Krishnan",
  department: "AI & Data Science",
  institution: DEMO_INSTITUTION.name,
  expertise: ["Machine Learning", "NLP", "Distributed Systems"],
  skills: [{ skillId: s.machineLearning, skillName: skillName(s.machineLearning) }, { skillId: s.python, skillName: skillName(s.python) }, { skillId: s.statistics, skillName: skillName(s.statistics) }],
  researchDomains: ["NLP", "Computer Vision", "Recommender Systems"],
  mentoringAreas: ["ML", "Python", "Statistics"],
  availability: "Available",
  bio: "Professor in AI & Data Science with 12+ years of research in NLP and ML systems. Mentors students in ML projects and industry collaborations.",
};

// ─── Faculty opportunities (§19) ────────────────────────────────
export const DEMO_FACULTY_OPPS: FacultyOpportunity[] = [
  { id: "fo-1", title: "Faculty Internship: ML Systems", organization: "Nova Analytics", type: "FACULTY_INTERNSHIP", description: "Spend 2 months embedded in Nova Analytics' ML team building production models.", location: "Pune", mode: "On-site", duration: "2 Months", deadline: "2026-10-15", skills: [{ skillId: s.machineLearning, skillName: skillName(s.machineLearning) }, { skillId: s.python, skillName: skillName(s.python) }], targetRoles: ["data-scientist", "ml-engineer"], eligibility: "Faculty in CS/AI", responsibilities: ["Build production ML pipelines", "Document best practices"], expectedOutcomes: "Faculty Development Record + industry exposure", contact: "meera@nova-analytics.demo", status: "Published", createdAt: "2026-09-10T10:00:00" },
  { id: "fo-2", title: "Industrial Training: Cloud DevOps", organization: "CloudPeak Systems", type: "INDUSTRIAL_TRAINING", description: "5-day intensive on cloud-native DevOps practices.", location: "Online", mode: "Online", duration: "5 Days", deadline: "2026-10-01", skills: [{ skillId: s.cloudPlatforms, skillName: skillName(s.cloudPlatforms) }, { skillId: s.dockerK8s, skillName: skillName(s.dockerK8s) }, { skillId: s.cicd, skillName: skillName(s.cicd) }], targetRoles: ["devops-engineer"], eligibility: "Any faculty", expectedOutcomes: "Training certificate (pending verification)", status: "Published", createdAt: "2026-09-08T09:00:00" },
  { id: "fo-3", title: "FDP: Advanced Deep Learning", organization: "Coursera + IIT Madras", type: "FDP", description: "Faculty Development Program on transformers, attention, and LLMs.", location: "Hybrid", mode: "Hybrid", duration: "1 Week", deadline: "2026-09-25", skills: [{ skillId: s.deepLearning, skillName: skillName(s.deepLearning) }, { skillId: s.machineLearning, skillName: skillName(s.machineLearning) }], targetRoles: ["data-scientist", "ml-engineer"], eligibility: "CS/AI faculty", expectedOutcomes: "FDP certificate + curriculum material", status: "Published", createdAt: "2026-09-05T08:00:00" },
  { id: "fo-4", title: "Research Collaboration: Document AI", organization: "Nova Analytics", type: "RESEARCH_COLLABORATION", description: "Joint research on document classification + extraction.", location: "Hybrid", mode: "Hybrid", duration: "6 Months", deadline: "2026-10-30", skills: [{ skillId: s.machineLearning, skillName: skillName(s.machineLearning) }, { skillId: s.deepLearning, skillName: skillName(s.deepLearning) }], targetRoles: ["data-scientist", "ml-engineer"], eligibility: "Faculty + 2 students", expectedOutcomes: "Publication + patent potential", status: "Published", createdAt: "2026-09-07T10:00:00" },
  { id: "fo-5", title: "Guest Lecture: Industry ML Pipelines", organization: "Vertex Labs", type: "GUEST_LECTURE", description: "Deliver a guest lecture on production ML pipeline design.", location: "Online", mode: "Online", duration: "2 Hours", deadline: "2026-09-28", skills: [{ skillId: s.machineLearning, skillName: skillName(s.machineLearning) }], targetRoles: ["data-scientist"], eligibility: "Any CS/AI faculty", expectedOutcomes: "Guest lecture certificate", status: "Published", createdAt: "2026-09-12T11:00:00" },
  { id: "fo-6", title: "Consultancy: Analytics Platform", organization: "Insightify", type: "CONSULTANCY", description: "Advisory on building an analytics platform for campus data.", location: "Remote", mode: "Remote", duration: "3 Months", deadline: "2026-11-01", skills: [{ skillId: s.sql, skillName: skillName(s.sql) }, { skillId: s.python, skillName: skillName(s.python) }], targetRoles: ["data-scientist"], eligibility: "Senior faculty", status: "Published", createdAt: "2026-09-09T14:00:00" },
];

// ─── Collaborations (§45) ──────────────────────────────────────
export const DEMO_COLLABORATIONS: Collaboration[] = [
  { id: "col-1", organization: "Nova Analytics", type: "Workshop", title: "ML Practical Workshop", skills: [{ skillId: s.machineLearning, skillName: skillName(s.machineLearning) }], targetRoles: ["data-scientist"], participants: 45, date: "2026-10-10", status: "Scheduled", requestedBy: "Academia", createdAt: "2026-09-12T10:00:00" },
  { id: "col-2", organization: "Vertex Labs", type: "Guest Lecture", title: "Production ML at Scale", skills: [{ skillId: s.machineLearning, skillName: skillName(s.machineLearning) }, { skillId: s.deepLearning, skillName: skillName(s.deepLearning) }], targetRoles: ["ml-engineer"], participants: 80, date: "2026-09-28", status: "Active", requestedBy: "Industry", createdAt: "2026-09-08T09:00:00" },
  { id: "col-3", organization: "CloudPeak Systems", type: "Faculty Training", title: "Cloud DevOps Bootcamp", skills: [{ skillId: s.cloudPlatforms, skillName: skillName(s.cloudPlatforms) }], targetRoles: ["devops-engineer"], participants: 12, date: "2026-10-01", status: "Proposed", requestedBy: "Academia", createdAt: "2026-09-14T14:00:00" },
];

// ─── Mentorship sessions (§30) ────────────────────────────────
export const DEMO_MENTORSHIP_SESSIONS = [
  { id: "ms-1", studentId: "S042", studentName: "Aarav Sharma", facultyId: "F-001", facultyName: "Dr. Meena Krishnan", skillId: s.machineLearning, skillName: skillName(s.machineLearning), topic: "Model selection & cross-validation", date: "2026-09-20", time: "16:00", status: "Scheduled" as const },
  { id: "ms-2", studentId: "S051", studentName: "Priya Nair", facultyId: "F-001", facultyName: "Dr. Meena Krishnan", skillId: s.deepLearning, skillName: skillName(s.deepLearning), topic: "Transformer fine-tuning", date: "2026-09-22", time: "15:00", status: "Requested" as const },
];

// ─── Academia notifications (§70) ─────────────────────────────
export const DEMO_ACADEMIA_NOTIFICATIONS = [
  { id: "an-1", type: "New Industry Signal" as const, title: "Machine Learning demand high", detail: "4 active opportunities require ML skills.", time: "2026-09-17T10:00:00", read: false },
  { id: "an-2", type: "Curriculum Alert" as const, title: "Cloud Computing needs attention", detail: "High demand but limited curriculum coverage.", time: "2026-09-16T14:00:00", read: false },
  { id: "an-3", type: "Faculty Opportunity" as const, title: "FDP: Advanced Deep Learning", detail: "Registration open — deadline 25 Sept.", time: "2026-09-15T09:00:00", read: true },
  { id: "an-4", type: "Mentor Request" as const, title: "Priya Nair requested mentorship", detail: "Deep Learning mentorship session requested.", time: "2026-09-14T16:00:00", read: false },
];
