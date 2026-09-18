/**
 * SKILL SETU — Phase 3 Intelligence Engine (master spec §12, §20, §22, §25, §26, §31, §43, §45, §47).
 *
 * RULES CALCULATE. (AI may later explain — but no LLM computes readiness. See spec §43.)
 * All functions are PURE & DETERMINISTIC. They take the student's competencies + evidence
 * + role config and return structured, traceable results.
 */

import { getRoleConfig, COMPETENCY_TARGET_THRESHOLD, validateRoleWeights } from "./role-config";
import { skillName } from "./demo-data";
import type {
  Competency, EvidenceRecord, ReadinessResult, SkillBreakdownRow, SkillGap,
  NextAction, ActionType, ConfidenceLevel, Priority, IntelligenceResult,
} from "./types";

// ─── Validation (master spec §47) ────────────────────────────────
export function validateScore(score: number): { ok: boolean; error?: string } {
  if (typeof score !== "number" || isNaN(score)) return { ok: false, error: "Score must be a number" };
  if (score < 0 || score > 100) return { ok: false, error: "Score must be 0–100" };
  return { ok: true };
}

export function validateWeight(w: number): { ok: boolean; error?: string } {
  if (typeof w !== "number" || isNaN(w)) return { ok: false, error: "Weight must be a number" };
  if (w < 0 || w > 1) return { ok: false, error: "Weight must be 0–1" };
  return { ok: true };
}

// ─── Evidence confidence (master spec §31) ──────────────────────
/**
 * Transparent prototype confidence policy (NOT scientifically validated).
 *   Assessment only                              → Limited
 *   + project (submitted)                        → Moderate
 *   + evaluated project                          → Higher
 *   + industry/faculty feedback                  → Strong
 */
export function calculateEvidenceConfidence(
  skillId: string,
  evidence: EvidenceRecord[],
): { level: ConfidenceLevel; percent: number } {
  const ev = evidence.filter((e) => e.skillId === skillId);
  if (ev.length === 0) return { level: "None", percent: 0 };

  const hasAssessment = ev.some((e) => e.sourceType === "Assessment" && e.status === "Evaluated");
  const hasProject = ev.some((e) => e.sourceType === "Project");
  const projectEvaluated = ev.some((e) => e.sourceType === "Project" && e.status === "Evaluated");
  const hasFeedback = ev.some((e) => e.sourceType === "IndustryFeedback" || e.sourceType === "FacultyFeedback" || e.sourceType === "MentorFeedback");

  let level: ConfidenceLevel = "None";
  if (hasAssessment) level = "Limited";
  if (hasAssessment && hasProject) level = "Moderate";
  if (hasAssessment && projectEvaluated) level = "Higher";
  if (hasAssessment && projectEvaluated && hasFeedback) level = "Strong";

  // supporting percent: count of distinct evidence sources / 5, capped
  const distinctSources = new Set(ev.map((e) => e.sourceType)).size;
  const percent = Math.min(100, Math.round((distinctSources / 5) * 100) + (hasAssessment ? 20 : 0) + (projectEvaluated ? 20 : 0) + (hasFeedback ? 20 : 0));
  return { level, percent: Math.max(level === "None" ? 0 : 20, percent) };
}

// ─── Role readiness (master spec §12, §13, §14) ────────────────
/**
 * calculateRoleReadiness — deterministic.
 * Formula: SUM(competency × weight) / SUM(weights).
 * When weights sum to 1.0 (validated), this equals SUM(competency × weight).
 */
export function calculateRoleReadiness(
  studentId: string,
  roleId: string,
  competencies: Record<string, Competency>,
  evidence: EvidenceRecord[],
): ReadinessResult {
  const role = getRoleConfig(roleId);
  if (!role) {
    return {
      studentId, roleId, roleName: "Unknown",
      value: 0, displayValue: 0, calculatedAt: new Date().toISOString(),
      skillBreakdown: [], evidenceIds: [], explanation: "",
      status: "Error", error: `Unknown role: ${roleId}`,
    };
  }

  // validate weights sum to 1
  const wcheck = validateRoleWeights(roleId);
  const weightSum = wcheck.sum || 1;

  const breakdown: SkillBreakdownRow[] = [];
  const evidenceIds: string[] = [];
  let rawTotal = 0;

  for (const rs of role.skills) {
    const comp = competencies[rs.skillId];
    const competency = comp?.competencyScore ?? 0;
    const contribution = competency * rs.weight;
    rawTotal += contribution;
    const conf = calculateEvidenceConfidence(rs.skillId, evidence);
    breakdown.push({
      skillId: rs.skillId,
      skill: rs.skillName,
      competency,
      importance: rs.weight,
      importancePercent: Math.round(rs.weight * 100),
      contribution: Math.round(contribution * 100) / 100,
      evidenceConfidence: comp?.evidenceConfidence ?? conf.level,
      evidenceCount: comp?.evidenceCount ?? 0,
    });
    // gather evidence considered for this skill
    evidence.filter((e) => e.skillId === rs.skillId).forEach((e) => evidenceIds.push(e.evidenceId));
  }

  // normalise by weight sum (handles configs that don't sum to 1)
  const value = weightSum > 0 ? rawTotal / weightSum : 0;
  const displayValue = Math.round(value);

  const explanation = `Role Readiness is the weighted sum of your current competencies across the ${role.roleName} skill set. Formula: Σ(competency × importance) ÷ Σ(importance). Computed from ${breakdown.length} role skills using configured weights (sum ${(weightSum * 100).toFixed(0)}%).`;

  return {
    studentId,
    roleId,
    roleName: role.roleName,
    value: Math.round(value * 100) / 100,
    displayValue,
    calculatedAt: new Date().toISOString(),
    skillBreakdown: breakdown,
    evidenceIds,
    explanation,
    status: "Calculated",
  };
}

// ─── Skill gaps (master spec §20, §21, §22) ─────────────────────
/**
 * calculateSkillGaps — target threshold = 70 (CONFIGURED PROTOTYPE THRESHOLD,
 * NOT an industry standard — labelled accordingly in the UI).
 * Priority by deterministic score: gap × importance × (1 - confidenceFactor).
 */
export function calculateSkillGaps(
  studentId: string,
  roleId: string,
  competencies: Record<string, Competency>,
  evidence: EvidenceRecord[],
): SkillGap[] {
  const role = getRoleConfig(roleId);
  if (!role) return [];

  const confFactor: Record<ConfidenceLevel, number> = {
    None: 0, Limited: 0.6, Moderate: 0.4, Higher: 0.2, Strong: 0.1,
  };

  const gaps: SkillGap[] = [];
  for (const rs of role.skills) {
    const comp = competencies[rs.skillId];
    const current = comp?.competencyScore ?? 0;
    const target = COMPETENCY_TARGET_THRESHOLD;
    const gap = Math.max(0, target - current);
    if (gap <= 0) continue; // no gap
    const conf = calculateEvidenceConfidence(rs.skillId, evidence);
    const priorityScore = gap * rs.weight * (confFactor[comp?.evidenceConfidence ?? conf.level] ?? 0.5);
    // Priority labels (master spec §21, §23): High when the gap is severe OR
    // when gap + importance are both significant; Medium for moderate gaps or
    // notable importance; Low otherwise.
    const imp = Math.round(rs.weight * 100);
    let priority: Priority;
    if (gap >= 25 || (gap >= 15 && imp >= 25)) priority = "High";
    else if (gap >= 10 || imp >= 15) priority = "Medium";
    else priority = "Low";
    gaps.push({
      skillId: rs.skillId,
      skill: rs.skillName,
      currentScore: current,
      targetScore: target,
      gap,
      roleImportance: rs.weight,
      roleImportancePercent: Math.round(rs.weight * 100),
      priority,
      priorityScore: Math.round(priorityScore * 100) / 100,
      evidenceConfidence: comp?.evidenceConfidence ?? conf.level,
      reason: `${rs.skillName} has ${Math.round(rs.weight * 100)}% role importance and your current competency (${current}) is ${gap} points below the configured target threshold (${target}).`,
    });
  }

  // deterministic sort: priority score descending (gap severity × importance × confidence)
  gaps.sort((a, b) => b.priorityScore - a.priorityScore);
  return gaps;
}

// ─── Next Best Action (master spec §25, §26, §27) ────────────────
/**
 * getNextBestAction — deterministic RULES-based recommendation (NOT an LLM).
 * Picks the highest-priority gap and maps it to an action based on
 * evidence generation potential + current confidence.
 */
export function getNextBestAction(
  studentId: string,
  roleId: string,
  competencies: Record<string, Competency>,
  evidence: EvidenceRecord[],
): NextAction | null {
  const gaps = calculateSkillGaps(studentId, roleId, competencies, evidence);
  if (gaps.length === 0) {
    return {
      action: "Apply for Internship",
      actionTitle: "Apply for a relevant internship",
      skillId: "",
      skill: "—",
      priority: "Low",
      reason: "No critical skill gaps detected for this role. Consider gaining real-world experience to strengthen evidence.",
      projectedImpact: "Low",
      whyPoints: ["No gaps above the configured threshold", "Profile is role-ready", "Real-world experience adds evidence"],
      roleRelevance: 0,
      evidenceValue: "None",
    };
  }
  const top = gaps[0];
  const role = getRoleConfig(roleId);
  const roleName = role?.roleName ?? "";

  // deterministic action selection
  let action: ActionType = "Practice Skill";
  let actionTitle = `Practice ${top.skill}`;
  let why: string[] = [];

  const skillEvidence = evidence.filter((e) => e.skillId === top.skillId);
  const hasProject = skillEvidence.some((e) => e.sourceType === "Project");
  const hasAssessment = skillEvidence.some((e) => e.sourceType === "Assessment");

  if (top.priority === "High" && !hasProject) {
    action = "Build Project";
    actionTitle = `Build an End-to-End ${top.skill} Project`;
    why = [
      "High-impact skill gap",
      `Relevant to ${roleName} role`,
      "Produces project evidence",
      "Can later be evaluated by faculty/industry",
    ];
  } else if (top.priority === "High" && hasProject && !hasAssessment) {
    action = "Retake Assessment";
    actionTitle = `Retake ${top.skill} assessment`;
    why = ["High-impact gap", "Existing project evidence", "Need an evaluated score", "Assessment confirms competency"];
  } else if (top.priority === "Medium") {
    action = "Complete Learning";
    actionTitle = `Complete a ${top.skill} learning module`;
    why = ["Medium-priority gap", `Relevant to ${roleName}`, "Structured learning builds fundamentals", "Generates completion evidence"];
  } else {
    action = "Practice Skill";
    actionTitle = `Practice ${top.skill}`;
    why = ["Low-priority gap", "Reinforce fundamentals", "Quick wins", "Builds practice evidence"];
  }

  return {
    action,
    actionTitle,
    skillId: top.skillId,
    skill: top.skill,
    priority: top.priority,
    reason: `${top.skill} has a ${top.priority.toLowerCase()}-priority gap (current ${top.currentScore}, target ${top.targetScore}) with ${top.roleImportancePercent}% role importance. ${action} is recommended because it addresses the gap and generates new evidence.`,
    projectedImpact: top.priority,
    whyPoints: why,
    gapRef: top,
    roleRelevance: top.roleImportance,
    evidenceValue: top.evidenceConfidence,
  };
}

// ─── What-If projection (master spec §35) ───────────────────────
export function projectWhatIf(
  studentId: string,
  roleId: string,
  competencies: Record<string, Competency>,
  evidence: EvidenceRecord[],
  skillId: string,
  projectedScore: number,
): IntelligenceResult<{ currentReadiness: number; projectedReadiness: number; currentDisplay: number; projectedDisplay: number }> {
  const v = validateScore(projectedScore);
  if (!v.ok) return { ok: false, error: v.error! };

  const current = calculateRoleReadiness(studentId, roleId, competencies, evidence);
  // clone competencies and override
  const projectedComps: Record<string, Competency> = {
    ...competencies,
    [skillId]: { ...(competencies[skillId] ?? { skillId, skillName: skillName(skillId), competencyScore: 0, evidenceConfidence: "None", evidenceConfidencePercent: 0, lastUpdated: "", evidenceCount: 0, evidenceIds: [] }), competencyScore: projectedScore },
  };
  const projected = calculateRoleReadiness(studentId, roleId, projectedComps, evidence);
  return {
    ok: true,
    data: {
      currentReadiness: current.value,
      projectedReadiness: projected.value,
      currentDisplay: current.displayValue,
      projectedDisplay: projected.displayValue,
    },
  };
}

// ─── Service wrappers (master spec §39) ─────────────────────────
export function getStudentCompetency(studentId: string, competencies: Record<string, Competency>, skillId: string): Competency | undefined {
  return competencies[skillId];
}

export function getReadinessExplanation(result: ReadinessResult): string {
  if (result.status === "Error") return result.error ?? "Unable to calculate readiness.";
  const lines = result.skillBreakdown.map(
    (b) => `${b.skill}: ${b.competency} × ${b.importancePercent}% = ${b.contribution.toFixed(2)}`,
  );
  return [
    `Role: ${result.roleName}`,
    `Readiness: ${result.value.toFixed(2)}% (displayed ${result.displayValue}%)`,
    `Calculation:`,
    ...lines,
    `Total: ${result.value.toFixed(2)}%`,
    `Last calculated: ${new Date(result.calculatedAt).toLocaleString()}`,
  ].join("\n");
}
