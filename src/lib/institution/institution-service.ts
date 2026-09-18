/**
 * SKILL SETU — Phase 7 Institution aggregation service (master spec §5, §7, §10, §11, §12, §17, §19, §20).
 *
 * DERIVES all institution intelligence from shared Phase 3+4+5+6 stores.
 * NO duplicate skill/student/evidence/opportunity/readiness models (§78).
 * Rules calculate (§59). AI explains (future — §58).
 */

import { useInstitutionStore, DEMO_USER } from "./institution-store";
import { useCareerStore } from "@/lib/career/store";
import { DEMO_CANDIDATES } from "@/lib/industry/candidates";
import { useAcademiaStore } from "@/lib/academia/academia-store";
import { AcademiaService } from "@/lib/academia/academia-service";
import { ALL_ROLES } from "@/lib/intelligence/role-config";
import { SKILL_NAMES } from "@/lib/intelligence/demo-data";
import { calculateRoleReadiness, calculateSkillGaps, COMPETENCY_TARGET_THRESHOLD } from "@/lib/intelligence/engine";
import { useIntelligence } from "@/lib/intelligence";
import type {
  DemandSupplyRow, BranchSkillCell, RoleReadinessAgg, CohortIntervention,
  ExecutiveSummary, InterventionType, Priority, Intervention,
} from "./institution-model";
import type { Candidate } from "@/lib/industry";
import type { Competency, EvidenceRecord } from "@/lib/intelligence/types";
import type { Student } from "@/lib/intelligence";

const DEMO_DEPARTMENTS = ["AI & Data Science", "Computer Science", "Electronics & Communication", "Mechanical", "Civil"];
const DEMO_INSTITUTION_NAME = "Indian Institute of Technology, Madras";

export const InstitutionService = {
  getCandidates: (): Candidate[] => DEMO_CANDIDATES,

  // ── Demand-Supply (§10, §11, §12, §13) — derived from Phase 4 opportunities + Phase 5 candidates ──
  getDemandSupply: (): DemandSupplyRow[] => {
    const opps = useCareerStore.getState().opportunities.filter((o) => o.status === "Published");
    const candidates = DEMO_CANDIDATES;

    // demand: count opportunities requiring each skill, weight by importance
    const demandMap = new Map<string, { count: number; roles: Set<string> }>();
    for (const o of opps) {
      for (const rs of o.requiredSkills) {
        const e = demandMap.get(rs.skillId) ?? { count: 0, roles: new Set<string>() };
        e.count++; o.targetRoles.forEach((r) => e.roles.add(r));
        demandMap.set(rs.skillId, e);
      }
    }

    // supply: average competency from candidates
    const supplyMap = new Map<string, { scores: number[]; roles: Set<string> }>();
    for (const c of candidates) {
      for (const [, comp] of Object.entries(c.competencies)) {
        const e = supplyMap.get(comp.skillId) ?? { scores: [], roles: new Set<string>() };
        e.scores.push(comp.competencyScore);
        e.roles.add(c.targetRole);
        supplyMap.set(comp.skillId, e);
      }
    }

    const rows: DemandSupplyRow[] = [];
    for (const [skillId, { count, roles }] of demandMap) {
      const supply = supplyMap.get(skillId);
      const demandScore = Math.min(100, count * 20); // 1 opp=20, 5+=100
      const supplyScore = supply ? Math.round(supply.scores.reduce((a, b) => a + b, 0) / supply.scores.length) : 0;
      rows.push({
        skillId, skillName: SKILL_NAMES[skillId] ?? skillId,
        demand: demandScore, supply: supplyScore, gap: demandScore - supplyScore,
        demandSources: count, supplySources: supply?.scores.length ?? 0,
        targetRoles: [...roles],
      });
    }
    return rows.sort((a, b) => b.gap - a.gap);
  },

  // ── Branch × Skill matrix (§7, §8) — aggregated from candidates ──
  getBranchSkillMatrix: (): BranchSkillCell[] => {
    const opps = useCareerStore.getState().opportunities.filter((o) => o.status === "Published");
    const candidates = DEMO_CANDIDATES;
    const cells: BranchSkillCell[] = [];

    for (const dept of DEMO_DEPARTMENTS) {
      const deptCandidates = candidates.filter((c) => c.branch.includes(dept.split(" ")[0]) || dept.includes(c.branch.split(" ")[0]));
      if (deptCandidates.length === 0) continue;

      // collect all skills from these candidates
      const skillMap = new Map<string, { scores: number[]; roles: Set<string> }>();
      for (const c of deptCandidates) {
        for (const [, comp] of Object.entries(c.competencies)) {
          const e = skillMap.get(comp.skillId) ?? { scores: [], roles: new Set<string>() };
          e.scores.push(comp.competencyScore); e.roles.add(c.targetRole);
          skillMap.set(comp.skillId, e);
        }
      }

      for (const [skillId, { scores, roles }] of skillMap) {
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const demandCount = opps.filter((o) => o.requiredSkills.some((rs) => rs.skillId === skillId)).length;
        cells.push({
          department: dept, skillId, skillName: SKILL_NAMES[skillId] ?? skillId,
          avgCompetency: avg, affectedStudents: scores.length,
          roleRelevance: [...roles],
          industryDemand: demandCount >= 3 ? "High" : demandCount >= 1 ? "Medium" : "Low" as const,
          gap: avg < 50 ? "Critical" : avg < 65 ? "High" : avg < 80 ? "Medium" : "Low" as const,
        });
      }
    }
    return cells;
  },

  // ── Role readiness aggregation (§17) ──
  getRoleReadinessAgg: (): RoleReadinessAgg[] => {
    const candidates = DEMO_CANDIDATES;
    const roleMap = new Map<string, { readiness: number[]; students: number; gaps: Map<string, number[]> }>();

    for (const c of candidates) {
      const role = ALL_ROLES.find((r) => r.roleId === c.roleId);
      if (!role) continue;
      const e = roleMap.get(c.roleId) ?? { readiness: [], students: 0, gaps: new Map() };
      e.readiness.push(c.roleReadiness); e.students++;
      for (const [, comp] of Object.entries(c.competencies)) {
        const g = e.gaps.get(comp.skillName) ?? [];
        g.push(comp.competencyScore);
        e.gaps.set(comp.skillName, g);
      }
      roleMap.set(c.roleId, e);
    }

    return [...roleMap.entries()].map(([roleId, { readiness, students, gaps }]) => {
      const avgReadiness = Math.round(readiness.reduce((a, b) => a + b, 0) / readiness.length);
      const topGaps = [...gaps.entries()]
        .map(([skillName, scores]) => ({ skillName, avgCompetency: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) }))
        .sort((a, b) => a.avgCompetency - b.avgCompetency)
        .slice(0, 3);
      return {
        roleId, roleName: ALL_ROLES.find((r) => r.roleId === roleId)?.roleName ?? roleId,
        avgReadiness, studentCount: students, topGaps,
        evidenceConfidence: avgReadiness >= 70 ? "High" : avgReadiness >= 50 ? "Moderate" : "Limited",
      };
    });
  },

  // ── Cohort intervention needs (§19, §20, §21) ──
  getCohortInterventions: (): CohortIntervention[] => {
    const ds = InstitutionService.getDemandSupply();
    const matrix = InstitutionService.getBranchSkillMatrix();
    const interventions: CohortIntervention[] = [];

    for (const row of ds) {
      if (row.gap <= 0) continue;
      const affected = matrix.filter((c) => c.skillId === row.skillId).reduce((sum, c) => sum + c.affectedStudents, 0);
      const priority: Priority = row.gap >= 40 ? "Critical" : row.gap >= 25 ? "High" : row.gap >= 10 ? "Medium" : "Low";
      const suggestedAction: InterventionType =
        priority === "Critical" ? "Industry Workshop" :
        priority === "High" ? "Project-Based Learning" :
        priority === "Medium" ? "Bootcamp" : "Certification";
      interventions.push({
        skillId: row.skillId, skillName: row.skillName,
        gap: priority, affectedStudents: affected || row.supplySources,
        avgCompetency: row.supply, targetRoles: row.targetRoles,
        suggestedAction,
        reason: `${row.skillName} demand (${row.demand}) exceeds supply (${row.supply}) by ${row.gap} points. ${row.demandSources} active opportunities require this skill. ${affected || row.supplySources} student(s) with average competency ${row.supply}.`,
      });
    }
    return interventions.sort((a, b) => (a.gap === "Critical" ? 0 : a.gap === "High" ? 1 : 2) - (b.gap === "Critical" ? 0 : b.gap === "High" ? 1 : 2));
  },

  // ── Executive summary (§4) ──
  getExecutiveSummary: (): ExecutiveSummary => {
    const ds = InstitutionService.getDemandSupply();
    const agg = InstitutionService.getRoleReadinessAgg();
    const interventions = InstitutionService.getCohortInterventions();

    const strong: string[] = [];
    const needsAttention: string[] = [];
    const emerging: string[] = [];
    const suggestedActions: string[] = [];

    for (const row of ds) {
      if (row.supply >= 70 && row.gap <= 20) strong.push(`${row.skillName} competency (${row.supply})`);
      if (row.gap >= 25) needsAttention.push(`${row.skillName} gap ${row.gap} (supply ${row.supply})`);
      if (row.demand >= 60 && row.gap >= 25) emerging.push(`${row.skillName} — high demand, low supply`);
    }
    for (const inv of interventions.slice(0, 3)) {
      suggestedActions.push(`${inv.suggestedAction} for ${inv.skillName} (${inv.gap} priority)`);
    }

    return {
      strong: strong.length ? strong : ["No strong areas identified in current data"],
      needsAttention: needsAttention.length ? needsAttention : ["No critical attention areas"],
      emerging: emerging.length ? emerging : ["No emerging signals detected"],
      suggestedActions: suggestedActions.length ? suggestedActions : ["No recommendations at this time"],
    };
  },

  // ── Evidence pipeline (§36, §37, §38) ──
  getEvidencePipeline: () => {
    const candidates = DEMO_CANDIDATES;
    const allEvidence = candidates.flatMap((c) => c.evidence);
    const byStatus = { Submitted: 0, "Pending Evaluation": 0, Evaluated: 0, Verified: 0 } as Record<string, number>;
    const bySource = new Map<string, number>();
    for (const ev of allEvidence) {
      byStatus[ev.status] = (byStatus[ev.status] ?? 0) + 1;
      bySource.set(ev.sourceType, (bySource.get(ev.sourceType) ?? 0) + 1);
    }
    const latestEvidence = [...allEvidence].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return {
      total: allEvidence.length,
      byStatus,
      bySource: Object.fromEntries(bySource),
      latestDate: latestEvidence?.createdAt ?? "—",
      latestSkill: latestEvidence?.skillName ?? "—",
    };
  },

  // ── Placement/internship insights (§29, §30) ──
  getApplicationFunnel: () => {
    const apps = useCareerStore.getState().applications;
    return {
      applied: apps.filter((a) => a.status === "APPLIED").length,
      underReview: apps.filter((a) => a.status === "UNDER_REVIEW").length,
      shortlisted: apps.filter((a) => a.status === "SHORTLISTED").length,
      interview: apps.filter((a) => a.status === "INTERVIEW").length,
      selected: apps.filter((a) => a.status === "SELECTED").length,
      total: apps.length,
    };
  },

  // ── Collaboration insights (§28) ──
  getCollaborationInsights: () => {
    const collabs = useAcademiaStore.getState().collaborations;
    return {
      active: collabs.filter((c) => c.status === "Active").length,
      scheduled: collabs.filter((c) => c.status === "Scheduled").length,
      proposed: collabs.filter((c) => c.status === "Proposed").length,
      completed: collabs.filter((c) => c.status === "Completed").length,
      total: collabs.length,
      byType: collabs.reduce((acc, c) => { acc[c.type] = (acc[c.type] ?? 0) + 1; return acc; }, {} as Record<string, number>),
    };
  },

  getUser: () => DEMO_USER,
  getInstitutionName: () => DEMO_INSTITUTION_NAME,
  getDepartments: () => DEMO_DEPARTMENTS,
};

// ── Reactive hook ──
export function useInstitution() {
  const opportunities = useCareerStore((s) => s.opportunities);
  const applications = useCareerStore((s) => s.applications);
  const interventions = useInstitutionStore((s) => s.interventions);
  const alerts = useInstitutionStore((s) => s.alerts);
  const notifications = useInstitutionStore((s) => s.notifications);
  const collaborations = useAcademiaStore((s) => s.collaborations);
  const filters = useInstitutionStore((s) => s.filters);

  // derive synchronously
  const demandSupply = InstitutionService.getDemandSupply();
  const branchMatrix = InstitutionService.getBranchSkillMatrix();
  const roleReadiness = InstitutionService.getRoleReadinessAgg();
  const cohortInterventions = InstitutionService.getCohortInterventions();
  const execSummary = InstitutionService.getExecutiveSummary();
  const evidencePipeline = InstitutionService.getEvidencePipeline();
  const appFunnel = InstitutionService.getApplicationFunnel();
  const collabInsights = InstitutionService.getCollaborationInsights();

  return {
    opportunities, applications, interventions, alerts, notifications, collaborations, filters,
    demandSupply, branchMatrix, roleReadiness, cohortInterventions, execSummary, evidencePipeline, appFunnel, collabInsights,
  };
}
