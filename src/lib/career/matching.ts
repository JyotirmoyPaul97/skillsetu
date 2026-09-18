/**
 * SKILL SETU — Phase 4 Opportunity Matching Engine (master spec §12, §13, §14, §17, §18, §19, §20, §34, §56).
 *
 * RULES CALCULATE. Deterministic, transparent weighted model. Consumes Phase 3 intelligence
 * (competencies, evidence, evidence confidence, role). No hardcoded match values.
 *
 * Weights (master spec §13): skill 40%, role 20%, evidence 15%, eligibility 10%, experience 10%, availability 5%.
 */

import { calculateEvidenceConfidence } from "@/lib/intelligence/engine";
import type { Competency, EvidenceRecord } from "@/lib/intelligence/types";
import type { Student } from "@/lib/intelligence";
import type {
  Opportunity, MatchResult, SkillMatchDetail, SkillMatchStatus,
  EligibilityResult, Recommendation, DeadlineStatus, ApplicationStatus,
} from "./opportunity-model";
import { MATCH_WEIGHTS, APPLICATION_TIMELINE } from "./opportunity-model";

// Demo "today" reference for deadline logic (the controlled demo timeline).
// Uses the real current date so deadline states reflect the actual passage of time.
const NOW = () => new Date();

// ─── Deadline intelligence (master spec §33) ────────────────────
export function getDeadlineStatus(opportunity: Opportunity): DeadlineStatus {
  const deadline = new Date(opportunity.applicationDeadline + "T23:59:59");
  const now = NOW();
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);
  if (daysLeft < 0) return "Closed";
  if (daysLeft <= 7) return "Closing Soon";
  return "Open";
}

export function daysUntilDeadline(opportunity: Opportunity): number {
  const deadline = new Date(opportunity.applicationDeadline + "T23:59:59");
  return Math.ceil((deadline.getTime() - NOW().getTime()) / 86400000);
}

// ─── Skill match detail (master spec §17) ────────────────────────
export function getSkillMatchDetail(
  opp: Opportunity,
  skillId: string,
  competencies: Record<string, Competency>,
): SkillMatchDetail {
  const rs = opp.requiredSkills.find((r) => r.skillId === skillId) ?? opp.preferredSkills?.find((r) => r.skillId === skillId);
  const requiredLevel = rs?.requiredLevel ?? 0;
  const studentLevel = competencies[skillId]?.competencyScore ?? 0;
  let status: SkillMatchStatus;
  if (studentLevel >= requiredLevel + 10) status = "Strong Match";
  else if (studentLevel >= requiredLevel) status = "Match";
  else if (studentLevel >= requiredLevel - 10) status = "Partial";
  else status = "Gap";
  return { skillId, skillName: rs?.skillName ?? skillId, requiredLevel, studentLevel, status };
}

// ─── Eligibility (master spec §34, §35) ──────────────────────────
export function checkOpportunityEligibility(
  student: Student,
  opportunity: Opportunity,
  roleId: string,
  competencies: Record<string, Competency>,
  cgpa: number,
): EligibilityResult {
  const rules = opportunity.eligibilityRules ?? {};
  const reasons: string[] = [];
  const failed: string[] = [];

  if (rules.yearMin !== undefined && student.year < rules.yearMin) {
    failed.push(`Year: requires ${rules.yearMin}+, you are in year ${student.year}`);
  } else {
    reasons.push(`Year ${student.year} meets requirement`);
  }
  if (rules.yearMax !== undefined && student.year > rules.yearMax) {
    failed.push(`Year: max ${rules.yearMax}, you are in year ${student.year}`);
  }
  if (rules.branch && rules.branch.length > 0 && !rules.branch.some((b) => student.branch.toLowerCase().includes(b.toLowerCase()))) {
    failed.push(`Branch: requires ${rules.branch.join("/")}, you are in ${student.branch}`);
  } else {
    reasons.push(`Branch ${student.branch} accepted`);
  }
  if (rules.cgpaMin !== undefined && cgpa < rules.cgpaMin) {
    failed.push(`CGPA: requires ${rules.cgpaMin}+, you have ${cgpa}`);
  } else if (rules.cgpaMin !== undefined) {
    reasons.push(`CGPA ${cgpa} meets minimum ${rules.cgpaMin}`);
  }
  if (rules.requiredRoleIds && rules.requiredRoleIds.length > 0 && !rules.requiredRoleIds.includes(roleId)) {
    failed.push(`Target role: opportunity targets a different role`);
  } else {
    reasons.push(`Target role is compatible`);
  }
  // NOTE: per-skill required levels are shown in "Your Skill Fit" (match detail) and
  // reflected in the skill-alignment score — they are NOT a hard eligibility gate in
  // this prototype (master spec §34 lists "Required Skill Level" as an optional
  // eligibility rule; we surface it as a gap, not an application blocker, so the
  // Apply flow in §23 works while still being honest about the gap).

  return { eligible: failed.length === 0, reasons, failedRequirements: failed };
}

// ─── Opportunity match (master spec §12, §13, §14) ──────────────
export function calculateOpportunityMatch(
  studentId: string,
  opportunity: Opportunity,
  competencies: Record<string, Competency>,
  evidence: EvidenceRecord[],
  roleId: string,
  student: Student,
  cgpa: number,
): MatchResult {
  // ── 1. Skill alignment (40%) ──
  let skillSum = 0, skillWeightTotal = 0;
  const matched: string[] = [], partial: string[] = [], missing: string[] = [];
  const skillDetails: SkillMatchDetail[] = [];
  for (const rs of opportunity.requiredSkills) {
    const detail = getSkillMatchDetail(opportunity, rs.skillId, competencies);
    skillDetails.push(detail);
    const studentLevel = detail.studentLevel;
    // per-skill score: 100 if >= required, scaled down if below
    const skillScore = studentLevel >= rs.requiredLevel
      ? 100
      : Math.max(0, (studentLevel / Math.max(1, rs.requiredLevel)) * 80); // partial credit
    skillSum += skillScore * rs.importance;
    skillWeightTotal += rs.importance;
    if (detail.status === "Strong Match" || detail.status === "Match") matched.push(rs.skillName);
    else if (detail.status === "Partial") partial.push(rs.skillName);
    else missing.push(rs.skillName);
  }
  const skillAlignment = skillWeightTotal > 0 ? Math.round(skillSum / skillWeightTotal) : 0;

  // ── 2. Role alignment (20%) ──
  const roleAligned = opportunity.targetRoles.includes(roleId);
  // not auto-disqualify on role mismatch (§19) — 100 if aligned, 40 if not
  const roleAlignment = roleAligned ? 100 : 40;

  // ── 3. Evidence strength (15%) — uses Phase 3 evidence confidence ──
  let evSum = 0, evCount = 0;
  const evidenceConsidered: string[] = [];
  for (const rs of opportunity.requiredSkills) {
    const conf = calculateEvidenceConfidence(rs.skillId, evidence);
    evSum += conf.percent;
    evCount++;
    const skillEv = evidence.filter((e) => e.skillId === rs.skillId);
    skillEv.forEach((e) => { if (!evidenceConsidered.includes(e.sourceTitle)) evidenceConsidered.push(e.sourceTitle); });
  }
  const evidenceStrength = evCount > 0 ? Math.round(evSum / evCount) : 0;

  // ── 4. Eligibility (10%) ──
  const elig = checkOpportunityEligibility(student, opportunity, roleId, competencies, cgpa);
  const eligibility = elig.eligible ? 100 : 0;

  // ── 5. Experience alignment (10%) — relevant project/internship evidence ──
  const hasProjectEvidence = evidence.some((e) =>
    (e.sourceType === "Project" || e.sourceType === "Internship") &&
    opportunity.requiredSkills.some((rs) => rs.skillId === e.skillId),
  );
  const experienceAlignment = hasProjectEvidence ? 100 : 30;

  // ── 6. Availability (5%) ──
  const dl = getDeadlineStatus(opportunity);
  const availability = dl === "Open" ? 100 : dl === "Closing Soon" ? 70 : 0;

  // ── Final match (weighted) ──
  const matchScore = Math.round(
    skillAlignment * MATCH_WEIGHTS.skillAlignment +
    roleAlignment * MATCH_WEIGHTS.roleAlignment +
    evidenceStrength * MATCH_WEIGHTS.evidenceStrength +
    eligibility * MATCH_WEIGHTS.eligibility +
    experienceAlignment * MATCH_WEIGHTS.experienceAlignment +
    availability * MATCH_WEIGHTS.availability,
  );

  const matchLabel: MatchResult["matchLabel"] =
    matchScore >= 80 ? "Strong Match" : matchScore >= 60 ? "Good Match" : matchScore >= 40 ? "Potential Match" : "Low Match";

  // potential gap = highest-importance missing/partial skill
  const gapSkill = opportunity.requiredSkills
    .filter((rs) => (competencies[rs.skillId]?.competencyScore ?? 0) < rs.requiredLevel)
    .sort((a, b) => b.importance - a.importance)[0];
  const potentialGap = gapSkill?.skillName;

  const explanation = `Match ${matchScore}% = skill ${skillAlignment}×40% + role ${roleAlignment}×20% + evidence ${evidenceStrength}×15% + eligibility ${eligibility}×10% + experience ${experienceAlignment}×10% + availability ${availability}×5%. ${matched.length} strong/partial match(es), ${missing.length} gap(s).`;

  return {
    opportunityId: opportunity.id,
    studentId,
    matchScore,
    skillAlignment, roleAlignment, evidenceStrength, eligibility, experienceAlignment, availability,
    matchedSkills: matched, partialSkills: partial, missingSkills: missing,
    skillDetails, evidenceConsidered, potentialGap, roleAligned, eligible: elig.eligible,
    explanation, matchLabel, calculatedAt: new Date().toISOString(),
  };
}

// ─── Recommendations (master spec §21, §22, §39) ────────────────
export function getRecommendations(
  opportunities: Opportunity[],
  studentId: string,
  competencies: Record<string, Competency>,
  evidence: EvidenceRecord[],
  roleId: string,
  student: Student,
  cgpa: number,
): Recommendation[] {
  const recs: Recommendation[] = opportunities
    .filter((o) => o.status === "Published")
    .map((o) => {
      const match = calculateOpportunityMatch(studentId, o, competencies, evidence, roleId, student, cgpa);
      const whyPoints: string[] = [];
      if (match.roleAligned) whyPoints.push("Matches your target role");
      if (match.matchedSkills.length > 0) whyPoints.push(`Strong ${match.matchedSkills.slice(0, 2).join(" + ")} alignment`);
      if (match.evidenceStrength >= 40) whyPoints.push("Relevant evidence available");
      if (match.eligible) whyPoints.push("You meet eligibility");
      const gap = match.missingSkills[0] ?? match.partialSkills[0];
      return { opportunity: o, match, whyPoints, currentGap: gap };
    })
    // exclude completely ineligible (§39)
    .filter((r) => r.match.eligible || r.match.matchScore >= 30)
    .sort((a, b) => b.match.matchScore - a.match.matchScore);
  return recs;
}

// ─── Application timeline (master spec §27) ───────────────────────
export function getApplicationTimeline(status: ApplicationStatus): { steps: ApplicationStatus[]; rejected: boolean } {
  if (status === "REJECTED" || status === "WITHDRAWN") {
    return { steps: ["APPLIED", "UNDER_REVIEW", status], rejected: true };
  }
  return { steps: APPLICATION_TIMELINE, rejected: false };
}

export function getTimelineIndex(status: ApplicationStatus, timeline: ApplicationStatus[]): number {
  return timeline.indexOf(status);
}
