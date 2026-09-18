/**
 * SKILL SETU — Phase 9 Intelligence Aggregators.
 *
 * New derived aggregators that surface intelligence specifically for the
 * differentiated portal experiences in Phase 9 (Demand Pulse, Talent Supply,
 * Opportunity Intelligence, Team Builder, Institution Alerts, Next Actions,
 * Intervention Lifecycle, Outcome Monitoring).
 *
 * These REUSE the shared Phase 3/4/5/6/7 stores — NO duplicate engines,
 * NO duplicate student/skill/opportunity models (master spec §62, §80).
 *
 * Rules calculate (§60). AI explains (future — §57–§59).
 */

import { useCareerStore } from "@/lib/career/store";
import { DEMO_CANDIDATES } from "@/lib/industry/candidates";
import { useIndustryStore } from "@/lib/industry/industry-store";
import { useAcademiaStore } from "@/lib/academia/academia-store";
import { AcademiaService } from "@/lib/academia/academia-service";
import { useInstitutionStore } from "@/lib/institution/institution-store";
import { useHackathonStore } from "@/lib/hackathon/hackathon-store";
import { ALL_ROLES } from "@/lib/intelligence/role-config";
import { SKILL_NAMES } from "@/lib/intelligence/demo-data";
import type { Opportunity } from "@/lib/career/opportunity-model";
import type { Candidate } from "@/lib/industry";
import type { EvidenceRecord } from "@/lib/intelligence/types";

// ============================================================
// INDUSTRY AGGREGATORS
// ============================================================

export type DemandLevel = "High" | "Medium" | "Low";
export type SupplyLevel = "Strong" | "Moderate" | "Limited" | "Low Evidence" | "None";

export interface DemandPulseSkill {
  skillId: string;
  skillName: string;
  demandLevel: DemandLevel;
  opportunityCount: number;
  requiredRoleLevels: { roleId: string; roleName: string; requiredLevel: number }[];
  openRoles: number;
  openChallenges: number;
  talentCoverage: number; // 0–100, computed from candidates
  insufficientCoverage: boolean;
}

export const IndustryAggregator = {
  // §3 Demand Pulse — derived from published opportunities + candidate supply
  getDemandPulse: (): DemandPulseSkill[] => {
    const opps = useCareerStore.getState().opportunities.filter((o) => o.status === "Published");
    const candidates = DEMO_CANDIDATES;
    const challenges = useIndustryStore.getState().challenges;

    type Acc = {
      skillId: string;
      skillName: string;
      demandLevel: DemandLevel;
      opportunityCount: number;
      requiredRoleLevels: { roleId: string; roleName: string; requiredLevel: number }[];
      openRolesSet: Set<string>;
      openChallenges: number;
      talentCoverage: number;
      insufficientCoverage: boolean;
    };
    const map = new Map<string, Acc>();
    for (const o of opps) {
      for (const rs of o.requiredSkills) {
        const e = map.get(rs.skillId) ?? {
          skillId: rs.skillId,
          skillName: SKILL_NAMES[rs.skillId] ?? rs.skillId,
          demandLevel: "Low" as DemandLevel,
          opportunityCount: 0,
          requiredRoleLevels: [] as { roleId: string; roleName: string; requiredLevel: number }[],
          openRolesSet: new Set<string>(),
          openChallenges: 0,
          talentCoverage: 0,
          insufficientCoverage: false,
        };
        e.opportunityCount++;
        o.targetRoles.forEach((r) => e.openRolesSet.add(r));
        e.requiredRoleLevels.push({
          roleId: o.targetRoles[0] ?? "—",
          roleName: ALL_ROLES.find((role) => role.roleId === o.targetRoles[0])?.roleName ?? "—",
          requiredLevel: rs.requiredLevel,
        });
        map.set(rs.skillId, e);
      }
    }
    for (const ch of challenges) {
      for (const s of ch.requiredSkills) {
        const e = map.get(s.skillId);
        if (e) e.openChallenges++;
      }
    }

    const result: DemandPulseSkill[] = [];
    for (const [, e] of map) {
      const openRoles = e.openRolesSet.size;
      const demandLevel: DemandLevel = e.opportunityCount >= 3 ? "High" : e.opportunityCount >= 2 ? "Medium" : "Low";
      // supply: average competency among candidates who have this skill
      const scores = candidates
        .map((c) => c.competencies[e.skillId]?.competencyScore)
        .filter((s): s is number => typeof s === "number");
      const talentCoverage = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      result.push({
        skillId: e.skillId,
        skillName: e.skillName,
        demandLevel,
        opportunityCount: e.opportunityCount,
        requiredRoleLevels: e.requiredRoleLevels,
        openRoles,
        openChallenges: e.openChallenges,
        talentCoverage,
        insufficientCoverage: talentCoverage < 60,
      });
    }
    return result.sort((a, b) => b.opportunityCount - a.opportunityCount);
  },

  // §4 What We Need — top demanded role + its critical skills + required levels
  getWhatWeNeed: () => {
    const opps = useCareerStore.getState().opportunities.filter((o) => o.status === "Published");
    const candidates = DEMO_CANDIDATES;
    const roleMap = new Map<string, { roleId: string; roleName: string; criticalSkills: Map<string, { skillId: string; skillName: string; requiredLevel: number; importance: number }>; opportunityCount: number }>();

    for (const o of opps) {
      const roleId = o.targetRoles[0] ?? "—";
      const role = ALL_ROLES.find((r) => r.roleId === roleId);
      const e = roleMap.get(roleId) ?? {
        roleId,
        roleName: role?.roleName ?? roleId,
        criticalSkills: new Map<string, { skillId: string; skillName: string; requiredLevel: number; importance: number }>(),
        opportunityCount: 0,
      };
      e.opportunityCount++;
      for (const rs of o.requiredSkills) {
        e.criticalSkills.set(rs.skillId, {
          skillId: rs.skillId,
          skillName: SKILL_NAMES[rs.skillId] ?? rs.skillId,
          requiredLevel: rs.requiredLevel,
          importance: rs.importance,
        });
      }
      roleMap.set(roleId, e);
    }

    return [...roleMap.values()]
      .map((r) => {
        const skills = [...r.criticalSkills.values()];
        // Compute talent availability for each critical skill
        const skillAvailability = skills.map((s) => {
          const matchingCandidates = candidates.filter((c) => (c.competencies[s.skillId]?.competencyScore ?? 0) >= s.requiredLevel).length;
          return { skillId: s.skillId, skillName: s.skillName, requiredLevel: s.requiredLevel, importance: s.importance, availableCandidates: matchingCandidates, totalCandidatesConsidered: candidates.length };
        });
        const overallAvailability = skillAvailability.reduce((sum, s) => sum + s.availableCandidates, 0);
        return {
          roleId: r.roleId,
          roleName: r.roleName,
          opportunityCount: r.opportunityCount,
          criticalSkills: skillAvailability,
          overallAvailability,
          insufficient: overallAvailability < skills.length,
        };
      })
      .sort((a, b) => b.opportunityCount - a.opportunityCount);
  },

  // §5 Talent Supply — what the talent pool can demonstrate per skill
  getTalentSupply: () => {
    const candidates = DEMO_CANDIDATES;
    const opps = useCareerStore.getState().opportunities.filter((o) => o.status === "Published");
    const demandedSkillIds = new Set<string>();
    for (const o of opps) for (const rs of o.requiredSkills) demandedSkillIds.add(rs.skillId);

    const supplyMap = new Map<string, { skillId: string; skillName: string; scores: number[]; roles: Set<string> }>();
    for (const c of candidates) {
      for (const [, comp] of Object.entries(c.competencies)) {
        const e = supplyMap.get(comp.skillId) ?? { skillId: comp.skillId, skillName: SKILL_NAMES[comp.skillId] ?? comp.skillId, scores: [], roles: new Set<string>() };
        e.scores.push(comp.competencyScore);
        e.roles.add(c.targetRole);
        supplyMap.set(comp.skillId, e);
      }
    }

    const supply = [...supplyMap.entries()].map(([skillId, e]) => {
      const avg = e.scores.length > 0 ? Math.round(e.scores.reduce((a, b) => a + b, 0) / e.scores.length) : 0;
      const supplyLevel: SupplyLevel = avg >= 70 ? "Strong" : avg >= 50 ? "Moderate" : avg >= 30 ? "Limited" : avg > 0 ? "Low Evidence" : "None";
      return {
        skillId,
        skillName: e.skillName,
        avgCompetency: avg,
        supplyLevel,
        demonstratedBy: e.scores.length,
        targetRoles: [...e.roles],
        inDemand: demandedSkillIds.has(skillId),
      };
    });
    return supply.sort((a, b) => (a.inDemand === b.inDemand ? b.avgCompetency - a.avgCompetency : a.inDemand ? -1 : 1));
  },

  // §12 Opportunity Intelligence — projected talent availability before publishing
  getOpportunityIntelligence: (requiredSkills: { skillId: string; requiredLevel: number }[]) => {
    const candidates = DEMO_CANDIDATES;
    const perSkill = requiredSkills.map((rs) => {
      const matching = candidates.filter((c) => (c.competencies[rs.skillId]?.competencyScore ?? 0) >= rs.requiredLevel);
      const coverage = candidates.length > 0 ? Math.round((matching.length / candidates.length) * 100) : 0;
      return {
        skillId: rs.skillId,
        skillName: SKILL_NAMES[rs.skillId] ?? rs.skillId,
        requiredLevel: rs.requiredLevel,
        matchingCandidates: matching.length,
        totalCandidates: candidates.length,
        coverage,
        limited: matching.length < 2,
      };
    });
    const overallCoverage = perSkill.length > 0 ? Math.round(perSkill.reduce((a, b) => a + b.coverage, 0) / perSkill.length) : 0;
    const suggestion =
      overallCoverage >= 50 ? "Proceed with publishing — sufficient talent availability."
      : overallCoverage >= 25 ? "Consider also creating a project or challenge pipeline to widen the funnel."
      : "Talent availability is limited. Consider a project, challenge, or training pipeline before publishing.";
    return { perSkill, overallCoverage, suggestion, limited: overallCoverage < 25 };
  },

  // §14 Team Builder — skill coverage for a multi-role team spec
  getTeamBuilderCoverage: (teamSpec: { roleIds: string[] }) => {
    const candidates = DEMO_CANDIDATES;
    const requiredSkills = new Map<string, { skillId: string; skillName: string; requiredLevel: number; sourceRole: string }>();
    for (const roleId of teamSpec.roleIds) {
      const role = ALL_ROLES.find((r) => r.roleId === roleId);
      if (!role) continue;
      for (const ws of role.skills) {
        // RoleConfig has weight (0–1), not requiredLevel. Use 70 as the competency threshold
        // (per §3 — COMPETENCY_TARGET_THRESHOLD = 70).
        const e = requiredSkills.get(ws.skillId) ?? { skillId: ws.skillId, skillName: SKILL_NAMES[ws.skillId] ?? ws.skillId, requiredLevel: 70, sourceRole: roleId };
        e.requiredLevel = Math.max(e.requiredLevel, 70);
        requiredSkills.set(ws.skillId, e);
      }
    }
    const requiredList = [...requiredSkills.values()];
    const coverage = requiredList.map((rs) => {
      const candidatesWith = candidates.filter((c) => (c.competencies[rs.skillId]?.competencyScore ?? 0) >= rs.requiredLevel);
      return { ...rs, availableCandidates: candidatesWith.length, covered: candidatesWith.length > 0 };
    });
    const missing = coverage.filter((c) => !c.covered);
    return {
      requiredSkills: coverage,
      coveragePercent: requiredList.length > 0 ? Math.round((coverage.length - missing.length) / requiredList.length * 100) : 0,
      missing,
      candidateFits: candidates.map((c) => ({
        candidate: c,
        matchCount: coverage.filter((cs) => (c.competencies[cs.skillId]?.competencyScore ?? 0) >= cs.requiredLevel).length,
      })).sort((a, b) => b.matchCount - a.matchCount),
    };
  },

  // §17 Intelligence Summary — answers dashboard questions
  getIndustryIntelligenceSummary: () => {
    const demandPulse = IndustryAggregator.getDemandPulse();
    const whatWeNeed = IndustryAggregator.getWhatWeNeed();
    const talentSupply = IndustryAggregator.getTalentSupply();
    const missing = demandPulse.filter((d) => d.insufficientCoverage);
    return {
      whatWeNeed: whatWeNeed.slice(0, 3),
      whoCanDemonstrate: talentSupply.filter((s) => s.inDemand).slice(0, 4),
      whyTheyMatch: DEMO_CANDIDATES.slice(0, 3).map((c) => ({ candidate: c, roleReadiness: c.roleReadiness })),
      whatIsMissing: missing.slice(0, 3),
      whatShouldWeDo: missing.slice(0, 3).map((m) => ({
        skill: m.skillName,
        suggestion: m.openChallenges > 0 ? "Host a focused challenge to surface more candidates" : "Create internship or project pipeline for this skill",
      })),
    };
  },
};

// ============================================================
// ACADEMIA AGGREGATORS (additional to existing AcademiaService)
// ============================================================

export const AcademiaAggregator = {
  // §21 Industry Is Asking For — derived from opportunities
  getIndustryAskingFor: () => {
    const signals = AcademiaService.getIndustrySignals();
    const challenges = useIndustryStore.getState().challenges;
    return signals.slice(0, 6).map((s) => ({
      ...s,
      challengeCount: challenges.filter((c) => c.requiredSkills.some((rs) => rs.skillId === s.skillId)).length,
    }));
  },

  // §22 Our Students Are Demonstrating — cohort evidence confidence
  getStudentsDemonstrating: () => {
    const candidates = DEMO_CANDIDATES;
    const opps = useCareerStore.getState().opportunities.filter((o) => o.status === "Published");
    const demandedSkillIds = new Set<string>();
    for (const o of opps) for (const rs of o.requiredSkills) demandedSkillIds.add(rs.skillId);

    const map = new Map<string, { skillId: string; skillName: string; scores: number[]; evidenceCount: number; verifiedCount: number }>();
    for (const c of candidates) {
      for (const [, comp] of Object.entries(c.competencies)) {
        const e = map.get(comp.skillId) ?? { skillId: comp.skillId, skillName: SKILL_NAMES[comp.skillId] ?? comp.skillId, scores: [], evidenceCount: 0, verifiedCount: 0 };
        e.scores.push(comp.competencyScore);
        e.evidenceCount += c.evidence.filter((ev) => ev.skillId === comp.skillId).length;
        e.verifiedCount += c.evidence.filter((ev) => ev.skillId === comp.skillId && ev.status === "Verified").length;
        map.set(comp.skillId, e);
      }
    }
    return [...map.values()]
      .filter((m) => demandedSkillIds.has(m.skillId))
      .map((m) => {
        const avg = m.scores.length > 0 ? Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length) : 0;
        const evidenceConfidence = m.verifiedCount > 0 ? "High" : m.evidenceCount > 0 ? "Moderate" : "Low";
        const practicalExposure = m.verifiedCount >= 2 ? "Strong" : m.verifiedCount >= 1 ? "Moderate" : m.evidenceCount > 0 ? "Limited" : "None";
        return {
          skillId: m.skillId,
          skillName: m.skillName,
          avgCompetency: avg,
          evidenceCount: m.evidenceCount,
          verifiedCount: m.verifiedCount,
          evidenceConfidence: evidenceConfidence as "High" | "Moderate" | "Low",
          practicalExposure: practicalExposure as "Strong" | "Moderate" | "Limited" | "None",
        };
      })
      .sort((a, b) => b.avgCompetency - a.avgCompetency);
  },

  // §23 Where Is The Gap — centerpiece alignment gaps
  getAcademicAlignmentGaps: () => {
    const alignment = AcademiaService.getCurriculumAlignment();
    return alignment
      .filter((a) => a.alignment !== "Aligned")
      .sort((a, b) => {
        const rank = (x: string) => (x === "Gap" ? 0 : 1);
        return rank(a.alignment) - rank(b.alignment);
      });
  },

  // §24 Alignment Chain — for a single skill: demand → skill → coverage → competency → evidence → status
  getAlignmentChain: (skillId: string) => {
    const signals = AcademiaService.getIndustrySignals();
    const alignment = AcademiaService.getCurriculumAlignment();
    const sig = signals.find((s) => s.skillId === skillId);
    const al = alignment.find((a) => a.skillId === skillId);
    if (!sig || !al) return null;
    return [
      { label: "Industry Demand", value: `${sig.demandLevel} · ${sig.opportunityCount} opportunities`, tone: "demand" as const },
      { label: "Skill", value: sig.skillName, tone: "skill" as const },
      { label: "Curriculum Coverage", value: al.curriculumCoverage, tone: "coverage" as const },
      { label: "Student Competency", value: `${al.studentAvgCompetency} avg`, tone: "competency" as const },
      { label: "Practical Evidence", value: al.practicalEvidence, tone: "evidence" as const },
      { label: "Alignment Status", value: al.alignment, tone: "status" as const },
    ];
  },

  // §25 Course × Skill Matrix — for matrix visualization
  getCourseSkillMatrix: () => {
    const curriculum = AcademiaService.getCurriculum();
    const courses = AcademiaService.getCourses();
    const signals = AcademiaService.getIndustrySignals();
    const skillIds = [...new Set(curriculum.map((c) => c.skillId))];
    const matrix = curriculum.reduce((acc, c) => {
      acc[`${c.courseId}`] = acc[`${c.courseId}`] ?? {};
      acc[`${c.courseId}`][c.skillId] = {
        coverage: c.coverage,
        demand: signals.find((s) => s.skillId === c.skillId)?.demandLevel ?? "Low",
      };
      return acc;
    }, {} as Record<string, Record<string, { coverage: string; demand: string }>>);
    return {
      courseRows: courses,
      skillCols: skillIds.map((id) => ({ id, name: SKILL_NAMES[id] ?? id })),
      matrix,
    };
  },

  // §27 Action Center — recommended actions
  getAcademiaActionCenter: () => {
    const alignment = AcademiaService.getCurriculumAlignment();
    return alignment
      .filter((a) => a.alignment !== "Aligned")
      .map((a) => ({
        skillId: a.skillId,
        skillName: a.skillName,
        demand: a.industryDemand,
        gap: a.alignment === "Gap" ? "High" : "Medium",
        affectedCohort: a.targetRoles.join(", "),
        expectedOutcome: a.suggestedEnrichment.join(", "),
        recommendedActions: a.suggestedEnrichment,
      }));
  },

  // §31 Mentor Matching — student gap × faculty expertise (DEMO_FACULTY is a single profile)
  getMentorMatches: () => {
    const candidates = DEMO_CANDIDATES;
    const faculty = AcademiaService.getFaculty();
    const matches: { student: Candidate; gapSkills: string[]; faculty: typeof faculty | null; reason: string }[] = [];
    for (const c of candidates) {
      // Find skills where student is below target (gap)
      const role = ALL_ROLES.find((r) => r.roleId === c.roleId);
      if (!role) continue;
      const gapSkills = role.skills
        .filter((ws) => (c.competencies[ws.skillId]?.competencyScore ?? 0) < 70)
        .map((ws) => ws.skillId);
      if (gapSkills.length === 0) continue;
      // Match to faculty with expertise in any gap skill (by skill ID via faculty.skills)
      const facultyHasExpertise = faculty.skills.some((fs) => gapSkills.includes(fs.skillId));
      const matchedSkillNames = faculty.skills
        .filter((fs) => gapSkills.includes(fs.skillId))
        .map((fs) => fs.skillName);
      matches.push({
        student: c,
        gapSkills: gapSkills.map((id) => SKILL_NAMES[id] ?? id),
        faculty: facultyHasExpertise ? faculty : null,
        reason: facultyHasExpertise
          ? `Faculty ${faculty.name} has expertise in ${matchedSkillNames.join(", ")}.`
          : `No faculty expertise currently mapped for ${gapSkills.map((id) => SKILL_NAMES[id] ?? id).join(", ")}.`,
      });
    }
    return matches;
  },
};

// ============================================================
// INSTITUTION AGGREGATORS (additional to existing InstitutionService)
// ============================================================

export type AlertTone = "critical" | "warning" | "info" | "emerging";

export interface IntelligenceAlert {
  id: string;
  tone: AlertTone;
  category: "Critical Skill Gap" | "Emerging Skill" | "Low Practical Exposure" | "New Industry Demand" | "Low Evidence Confidence" | "Upcoming Intervention";
  what: string;
  why: string;
  suggestedAction: string;
  affectedItems: number;
}

export const InstitutionAggregator = {
  // §53 Intelligence Alerts — derived from demand-supply, gaps, practical exposure
  getAlerts: (): IntelligenceAlert[] => {
    const ds = useInstitutionStore.getState();
    const opps = useCareerStore.getState().opportunities.filter((o) => o.status === "Published");
    const candidates = DEMO_CANDIDATES;
    const alignments = AcademiaService.getCurriculumAlignment();
    const alerts: IntelligenceAlert[] = [];

    // Critical Skill Gap — demand-supply gap >= 30
    for (const a of alignments) {
      if (a.alignment === "Gap") {
        alerts.push({
          id: `alert-gap-${a.skillId}`,
          tone: "critical",
          category: "Critical Skill Gap",
          what: `${a.skillName} — supply ${a.studentAvgCompetency} vs demand ${a.demandCount} opportunities`,
          why: `Industry demand: ${a.industryDemand}. Curriculum coverage: ${a.curriculumCoverage}. Practical evidence: ${a.practicalEvidence}.`,
          suggestedAction: `Consider intervention: ${a.suggestedEnrichment.join(", ")}`,
          affectedItems: a.targetRoles.length,
        });
      }
    }

    // Emerging Skill — high demand but not in curriculum
    for (const a of alignments) {
      if (a.industryDemand === "High" && (a.curriculumCoverage === "Not Covered" || a.curriculumCoverage === "Introductory")) {
        alerts.push({
          id: `alert-emerging-${a.skillId}`,
          tone: "emerging",
          category: "Emerging Skill",
          what: `${a.skillName} — emerging industry demand not yet in curriculum`,
          why: `Demand: High (${a.demandCount} opportunities). Current coverage: ${a.curriculumCoverage}.`,
          suggestedAction: "Consider curriculum enrichment and faculty development.",
          affectedItems: a.targetRoles.length,
        });
      }
    }

    // Low Practical Exposure — curriculum strong but evidence low
    for (const a of alignments) {
      if ((a.curriculumCoverage === "Strong" || a.curriculumCoverage === "Moderate") && (a.practicalEvidence === "Limited" || a.practicalEvidence === "None")) {
        alerts.push({
          id: `alert-practical-${a.skillId}`,
          tone: "warning",
          category: "Low Practical Exposure",
          what: `${a.skillName} — theory covered, but practical evidence is ${a.practicalEvidence.toLowerCase()}`,
          why: `Curriculum: ${a.curriculumCoverage}. Student competency: ${a.studentAvgCompetency}. Verified evidence: limited.`,
          suggestedAction: "Introduce industry project, workshop, or hackathon exposure.",
          affectedItems: a.targetRoles.length,
        });
      }
    }

    // Low Evidence Confidence — many candidates, few verified evidence
    const evidenceBySkill = new Map<string, { total: number; verified: number }>();
    for (const c of candidates) {
      for (const ev of c.evidence) {
        const e = evidenceBySkill.get(ev.skillId) ?? { total: 0, verified: 0 };
        e.total++; if (ev.status === "Verified") e.verified++;
        evidenceBySkill.set(ev.skillId, e);
      }
    }
    for (const [skillId, e] of evidenceBySkill) {
      if (e.total >= 2 && e.verified === 0) {
        alerts.push({
          id: `alert-confidence-${skillId}`,
          tone: "info",
          category: "Low Evidence Confidence",
          what: `${SKILL_NAMES[skillId] ?? skillId} — ${e.total} evidence records, 0 verified`,
          why: "Evidence has been submitted but not yet verified by industry or faculty.",
          suggestedAction: "Engage industry or faculty to verify outstanding evidence.",
          affectedItems: e.total,
        });
      }
    }

    // Upcoming Intervention — interventions in Proposed/Recommended state
    for (const inv of ds.interventions) {
      if (inv.status === "Proposed" || inv.status === "Recommended") {
        alerts.push({
          id: `alert-intervention-${inv.id}`,
          tone: "info",
          category: "Upcoming Intervention",
          what: `${inv.type} for ${inv.skillName} — ${inv.status}`,
          why: `Targets: ${inv.skillName}. Affected: ${inv.affectedStudents} student(s). Department: ${inv.department}.`,
          suggestedAction: "Review and approve the intervention to begin execution.",
          affectedItems: inv.affectedStudents,
        });
      }
    }

    return alerts.slice(0, 12);
  },

  // §54 What Should The Institution Do Next — prioritized recommendations
  getNextActions: () => {
    const cohortInterventions: { skillName: string; suggestedAction: string; priority: string; affectedStudents: number; targetRoles: string[] }[] = [];
    {
      const opps = useCareerStore.getState().opportunities.filter((o) => o.status === "Published");
      const candidates = DEMO_CANDIDATES;
      const demandMap = new Map<string, { count: number; roles: Set<string> }>();
      for (const o of opps) for (const rs of o.requiredSkills) {
        const e = demandMap.get(rs.skillId) ?? { count: 0, roles: new Set<string>() };
        e.count++; o.targetRoles.forEach((r) => e.roles.add(r));
        demandMap.set(rs.skillId, e);
      }
      const supplyMap = new Map<string, number[]>();
      for (const c of candidates) for (const [, comp] of Object.entries(c.competencies)) {
        const arr = supplyMap.get(comp.skillId) ?? [];
        arr.push(comp.competencyScore); supplyMap.set(comp.skillId, arr);
      }
      for (const [skillId, { count, roles }] of demandMap) {
        const supply = supplyMap.get(skillId);
        const supplyScore = supply ? Math.round(supply.reduce((a, b) => a + b, 0) / supply.length) : 0;
        const demandScore = Math.min(100, count * 20);
        const gap = demandScore - supplyScore;
        if (gap <= 0) continue;
        const priority = gap >= 40 ? "Critical" : gap >= 25 ? "High" : gap >= 10 ? "Medium" : "Low";
        cohortInterventions.push({
          skillName: SKILL_NAMES[skillId] ?? skillId,
          suggestedAction: priority === "Critical" ? "Industry Workshop" : priority === "High" ? "Industry Project" : priority === "Medium" ? "Bootcamp" : "Certification",
          priority,
          affectedStudents: supply?.length ?? 0,
          targetRoles: [...roles],
        });
      }
    }

    cohortInterventions.sort((a, b) => (a.priority === "Critical" ? 0 : a.priority === "High" ? 1 : 2) - (b.priority === "Critical" ? 0 : b.priority === "High" ? 1 : 2));

    return cohortInterventions.slice(0, 5).map((ci, idx) => ({
      rank: idx + 1,
      title: `${ci.suggestedAction} for ${ci.skillName}`,
      reason: `${ci.skillName} gap is ${ci.priority.toLowerCase()}. ${ci.affectedStudents} student(s) currently below target. Relevant roles: ${ci.targetRoles.slice(0, 3).join(", ")}.`,
      suggestedAction: ci.suggestedAction,
      skillName: ci.skillName,
      priority: ci.priority,
    }));
  },

  // §48 Outcome Monitoring — before/after for a given intervention (using evidence as proxy)
  getOutcomeMonitoring: (interventionId: string) => {
    const interventions = useInstitutionStore.getState().interventions;
    const inv = interventions.find((i) => i.id === interventionId);
    if (!inv) return null;
    const candidates = DEMO_CANDIDATES;
    // Intervention targets a single skillId (per model)
    const targetSkillId = inv.skillId;
    const startDate = inv.startDate ?? inv.createdAt;
    const beforeEvidence = candidates.flatMap((c) => c.evidence.filter((e) => e.skillId === targetSkillId && e.createdAt < startDate));
    const afterEvidence = candidates.flatMap((c) => c.evidence.filter((e) => e.skillId === targetSkillId && e.createdAt >= startDate));
    return {
      intervention: inv,
      before: {
        evidenceCount: beforeEvidence.length,
        verifiedCount: beforeEvidence.filter((e) => e.status === "Verified").length,
      },
      after: {
        evidenceCount: afterEvidence.length,
        verifiedCount: afterEvidence.filter((e) => e.status === "Verified").length,
      },
      observedChange: afterEvidence.length - beforeEvidence.length,
      newEvidenceGenerated: afterEvidence.length,
    };
  },

  // §52 Hackathon Intelligence — derived from hackathon store
  getHackathonIntelligence: () => {
    const hs = useHackathonStore.getState();
    const hackathonIds = new Set(hs.registrations.map((r) => r.hackathonId));
    const skillsDemonstrated = new Set<string>();
    // Derive skills from team problemStatementId (best-effort — exact mapping varies)
    for (const team of hs.teams) {
      // teams have a `problemStatementId` field; we don't have skill list per team in store,
      // so we use the role competencies of team members (DEMO_CANDIDATES) as a proxy
      for (const m of team.members ?? []) {
        const cand = DEMO_CANDIDATES.find((c) => c.studentId === m.studentId);
        if (cand) for (const [, comp] of Object.entries(cand.competencies)) skillsDemonstrated.add(comp.skillId);
      }
    }
    return {
      participation: hs.registrations.length,
      hackathonCount: hackathonIds.size,
      teams: hs.teams.length,
      projects: hs.submissions.length,
      skillsDemonstrated: [...skillsDemonstrated].map((id) => SKILL_NAMES[id] ?? id),
      industryChallenges: 0, // not currently flagged in store — labelled DEMO DATA in UI
      evidenceGenerated: hs.evaluations.length,
    };
  },

  // §50 Internship Intelligence — derived from career applications
  getInternshipIntelligence: () => {
    const apps = useCareerStore.getState().applications;
    const opps = useCareerStore.getState().opportunities;
    const internshipApps = apps.filter((a) => {
      const opp = opps.find((o) => o.id === a.opportunityId);
      return opp?.type === "INTERNSHIP";
    });
    const feedbackCount = DEMO_CANDIDATES.flatMap((c) => c.evidence.filter((e) => e.sourceType === "Internship")).length;
    return {
      participation: internshipApps.length,
      selection: internshipApps.filter((a) => ["SHORTLISTED", "INTERVIEW", "SELECTED"].includes(a.status)).length,
      completion: internshipApps.filter((a) => a.status === "SELECTED").length,
      feedback: feedbackCount,
      evidenceGenerated: feedbackCount,
    };
  },

  // §49 Placement Intelligence — common skills among selected candidates
  getPlacementIntelligence: () => {
    const apps = useCareerStore.getState().applications;
    const opps = useCareerStore.getState().opportunities;
    const selectedCandidates = apps.filter((a) => a.status === "SELECTED").map((a) => a.studentId);
    const candidates = DEMO_CANDIDATES.filter((c) => selectedCandidates.includes(c.studentId));
    if (candidates.length === 0) {
      return {
        targetRoles: [] as string[],
        applicants: apps.length,
        shortlisted: apps.filter((a) => a.status === "SHORTLISTED").length,
        interviews: apps.filter((a) => a.status === "INTERVIEW").length,
        selected: selectedCandidates.length,
        commonSkillsAmongSelected: [] as { skill: string; avgScore: number }[],
      };
    }
    const skillScores = new Map<string, number[]>();
    for (const c of candidates) for (const [, comp] of Object.entries(c.competencies)) {
      const arr = skillScores.get(comp.skillId) ?? [];
      arr.push(comp.competencyScore);
      skillScores.set(comp.skillId, arr);
    }
    const commonSkills = [...skillScores.entries()]
      .map(([id, scores]) => ({ skill: SKILL_NAMES[id] ?? id, avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);
    const targetRoles = [...new Set(candidates.map((c) => c.targetRole))];
    return {
      targetRoles,
      applicants: apps.length,
      shortlisted: apps.filter((a) => a.status === "SHORTLISTED").length,
      interviews: apps.filter((a) => a.status === "INTERVIEW").length,
      selected: selectedCandidates.length,
      commonSkillsAmongSelected: commonSkills,
    };
  },
};

// Convenience hook that returns all aggregators reactively
export function useAggregators() {
  // Subscribe to all underlying stores so this hook recomputes when any changes
  const _opps = useCareerStore((s) => s.opportunities);
  const _apps = useCareerStore((s) => s.applications);
  const _demand = useIndustryStore((s) => s.demandConfigs);
  const _feedback = useIndustryStore((s) => s.feedback);
  const _challenges = useIndustryStore((s) => s.challenges);
  const _collabs = useAcademiaStore((s) => s.collaborations);
  const _interventions = useInstitutionStore((s) => s.interventions);

  return {
    Industry: IndustryAggregator,
    Academia: AcademiaAggregator,
    Institution: InstitutionAggregator,
  };
}
