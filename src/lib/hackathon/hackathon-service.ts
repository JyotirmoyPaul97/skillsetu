/**
 * SKILL SETU — Phase 8 Hackathon intelligence service (master spec §7, §9, §13, §15, §27, §44-45).
 *
 * DERIVES all hackathon intelligence from shared Phase 3+5 stores.
 * Rules calculate (§89). Team coverage, evaluation scores, student fit — all deterministic.
 */

import { DEMO_HACKATHONS, DEMO_PROBLEM_STATEMENTS, DEMO_MENTORS, findHackathon, getProblemsForHackathon } from "./hackathon-demo-data";
import { useHackathonStore } from "./hackathon-store";
import { DEMO_CANDIDATES } from "@/lib/industry/candidates";
import { useIntelligence } from "@/lib/intelligence";
import { SKILL_NAMES } from "@/lib/intelligence/demo-data";
import type { Hackathon, ProblemStatement, TeamCoverage, TeamCoverageRow, HackathonRequiredSkill } from "./hackathon-model";
import type { Student } from "@/lib/intelligence";

const DEMO_TODAY = "2026-09-18";

export function getHackathonStatus(h: Hackathon): string {
  const now = DEMO_TODAY;
  if (h.status === "ARCHIVED" || h.status === "COMPLETED") return h.status;
  if (now < h.registrationStart) return "Upcoming";
  if (now <= h.registrationDeadline) return "Registration Open";
  if (now > h.registrationDeadline && now < h.startDate) return "Registration Closed";
  if (now >= h.startDate && now <= h.endDate) return "Live";
  return "Completed";
}

export function getDeadlineStatus(h: Hackathon): "Open" | "Closing Soon" | "Closed" {
  const deadline = new Date(h.registrationDeadline + "T23:59:59");
  const now = new Date(DEMO_TODAY + "T00:00:00");
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);
  if (daysLeft < 0) return "Closed";
  if (daysLeft <= 7) return "Closing Soon";
  return "Open";
}

// ─── Student Fit (§9, §13) ────────────────────────────────────
export interface SkillFitResult {
  skillId: string;
  skillName: string;
  requiredLevel: number;
  studentLevel: number;
  status: "Strong Match" | "Match" | "Partial" | "Gap";
}

export function calculateStudentFit(problem: ProblemStatement, studentId: string): SkillFitResult[] {
  const candidate = DEMO_CANDIDATES.find((c) => c.studentId === studentId);
  if (!candidate) return [];
  return problem.requiredSkills.map((rs) => {
    const comp = candidate.competencies[rs.skillId];
    const studentLevel = comp?.competencyScore ?? 0;
    let status: SkillFitResult["status"];
    if (studentLevel >= rs.requiredLevel + 10) status = "Strong Match";
    else if (studentLevel >= rs.requiredLevel) status = "Match";
    else if (studentLevel >= rs.requiredLevel - 10) status = "Partial";
    else status = "Gap";
    return { skillId: rs.skillId, skillName: rs.skillName, requiredLevel: rs.requiredLevel, studentLevel, status };
  });
}

export function calculateOverallFit(problem: ProblemStatement, studentId: string): number {
  const fit = calculateStudentFit(problem, studentId);
  if (fit.length === 0) return 0;
  const scores = fit.map((f) => f.studentLevel >= f.requiredLevel ? 100 : (f.studentLevel / f.requiredLevel) * 80);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// ─── Hackathon Recommendation (§7) ────────────────────────────
export interface HackathonRecommendation {
  hackathon: Hackathon;
  matchScore: number;
  whyPoints: string[];
  potentialGap?: string;
}

export function getRecommendedHackathons(studentId: string): HackathonRecommendation[] {
  const candidate = DEMO_CANDIDATES.find((c) => c.studentId === studentId);
  if (!candidate) return [];
  return DEMO_HACKATHONS.filter((h) => h.status !== "ARCHIVED" && h.status !== "COMPLETED").map((h) => {
    const matchScores = h.requiredSkills.map((rs) => {
      const comp = candidate.competencies[rs.skillId];
      const level = comp?.competencyScore ?? 0;
      return level >= rs.requiredLevel ? 100 : (level / rs.requiredLevel) * 80;
    });
    const matchScore = Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length);
    const whyPoints: string[] = [];
    const matched = h.requiredSkills.filter((rs) => (candidate.competencies[rs.skillId]?.competencyScore ?? 0) >= rs.requiredLevel);
    if (matched.length > 0) whyPoints.push(`${matched.map((m) => m.skillName).join(", ")} alignment`);
    if (h.domain === "AI / ML" && candidate.targetRole.includes("Data")) whyPoints.push("Matches target role");
    if (h.eligibilityRules?.yearMin && candidate.year >= h.eligibilityRules.yearMin) whyPoints.push("Eligible");
    const gap = h.requiredSkills.find((rs) => (candidate.competencies[rs.skillId]?.competencyScore ?? 0) < rs.requiredLevel);
    return { hackathon: h, matchScore, whyPoints, potentialGap: gap?.skillName };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

// ─── Team Coverage (§27, §28, §29) ─────────────────────────────
export function calculateTeamCoverage(teamId: string): TeamCoverage | null {
  const team = useHackathonStore.getState().teams.find((t) => t.id === teamId);
  if (!team) return null;
  const problem = team.problemStatementId ? DEMO_PROBLEM_STATEMENTS.find((p) => p.id === team.problemStatementId) : null;
  if (!problem) return null;

  const activeMembers = team.members.filter((m) => m.status === "Leader" || m.status === "Member");
  const rows: TeamCoverageRow[] = [];
  let totalCoverage = 0;
  let totalWeight = 0;
  const covered: string[] = [];
  const partial: string[] = [];
  const missing: string[] = [];

  for (const rs of problem.requiredSkills) {
    let bestComp = 0;
    let bestMember: string | undefined;
    for (const m of activeMembers) {
      const candidate = DEMO_CANDIDATES.find((c) => c.studentId === m.studentId);
      const comp = candidate?.competencies[rs.skillId]?.competencyScore ?? 0;
      if (comp > bestComp) { bestComp = comp; bestMember = m.studentName; }
    }
    const ratio = rs.requiredLevel > 0 ? Math.min(1, bestComp / rs.requiredLevel) : 0;
    const importanceWeight = rs.importance === "CRITICAL" ? 1.5 : rs.importance === "HIGH" ? 1.2 : rs.importance === "MEDIUM" ? 0.8 : 0.5;
    totalCoverage += ratio * importanceWeight;
    totalWeight += importanceWeight;
    let status: TeamCoverageRow["status"];
    if (bestComp >= rs.requiredLevel) { status = "Covered"; covered.push(rs.skillName); }
    else if (bestComp >= rs.requiredLevel - 15) { status = "Partial"; partial.push(rs.skillName); }
    else { status = "Missing"; missing.push(rs.skillName); }
    rows.push({ skillId: rs.skillId, skillName: rs.skillName, requiredLevel: rs.requiredLevel, bestMemberCompetency: bestComp, coverage: ratio, status, coveredBy: bestMember });
  }

  const coverage = totalWeight > 0 ? Math.round((totalCoverage / totalWeight) * 100) : 0;
  return { teamId, coverage, covered, partial, missing, rows };
}

// ─── Evaluation Calculation (§44, §45, §46) ────────────────────
export function calculateEvaluationTotal(scores: { score: number; weight: number }[]): number {
  return Math.round(scores.reduce((sum, s) => sum + s.score * s.weight, 0));
}

export function getEvaluationBreakdown(evaluationId: string): { criterion: string; score: number; weight: number; contribution: number }[] | null {
  const ev = useHackathonStore.getState().evaluations.find((e) => e.id === evaluationId);
  if (!ev) return null;
  return ev.scores.map((s) => ({ criterion: s.criterionName, score: s.score, weight: s.weight, contribution: Math.round(s.score * s.weight * 100) / 100 }));
}

// ─── Eligibility (§15, §16) ───────────────────────────────────
export function checkHackathonEligibility(hackathonId: string, studentId: string): { eligible: boolean; reasons: string[]; failed: string[] } {
  const h = findHackathon(hackathonId);
  const candidate = DEMO_CANDIDATES.find((c) => c.studentId === studentId);
  if (!h || !candidate) return { eligible: false, reasons: [], failed: ["Student or hackathon not found"] };
  const rules = h.eligibilityRules ?? {};
  const reasons: string[] = [];
  const failed: string[] = [];
  if (rules.yearMin && candidate.year < rules.yearMin) { failed.push(`Year: requires ${rules.yearMin}+, you are in year ${candidate.year}`); }
  else { reasons.push(`Year ${candidate.year} meets requirement`); }
  if (rules.cgpaMin && candidate.cgpa < rules.cgpaMin) { failed.push(`CGPA: requires ${rules.cgpaMin}+, you have ${candidate.cgpa}`); }
  else if (rules.cgpaMin) { reasons.push(`CGPA ${candidate.cgpa} meets minimum`); }
  return { eligible: failed.length === 0, reasons, failed };
}

// ─── Service ──────────────────────────────────────────────────
export const HackathonService = {
  getHackathons: (): Hackathon[] => DEMO_HACKATHONS,
  findHackathon,
  getProblems: (hackathonId: string) => getProblemsForHackathon(hackathonId),
  findProblem: (id: string) => DEMO_PROBLEM_STATEMENTS.find((p) => p.id === id),
  getMentors: () => DEMO_MENTORS,
  calculateStudentFit,
  calculateOverallFit,
  getRecommendedHackathons,
  calculateTeamCoverage,
  calculateEvaluationTotal,
  getEvaluationBreakdown,
  checkHackathonEligibility,
  getHackathonStatus,
  getDeadlineStatus,
};

export { DEMO_HACKATHONS, DEMO_PROBLEM_STATEMENTS, DEMO_MENTORS };
