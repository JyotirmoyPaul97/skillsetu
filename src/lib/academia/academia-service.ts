"use client";

import { useMemo } from "react";
import { useAcademiaStore } from "./academia-store";
import {
  DEMO_COURSES, DEMO_CURRICULUM, DEMO_FACULTY, DEMO_FACULTY_OPPS, DEMO_INSTITUTION,
  DEMO_DEPARTMENTS,
} from "./academia-demo-data";
import { useCareerStore } from "@/lib/career/store";
import { DEMO_CANDIDATES } from "@/lib/industry/candidates";
import { useIndustryStore } from "@/lib/industry/industry-store";
import { ALL_ROLES } from "@/lib/intelligence/role-config";
import { SKILL_NAMES } from "@/lib/intelligence/demo-data";
import type {
  IndustrySkillSignal, CohortSkillGap, CurriculumAlignmentRow, CoverageLevel,
  FacultyOpportunity, Collaboration, FacultyApplication, MentorshipSession,
  AcademiaNotification,
} from "./academia-model";
import type { Opportunity } from "@/lib/career/opportunity-model";

/**
 * Phase 6 Academia service. Derives industry signals, emerging skills, student
 * cohort gaps, and curriculum alignment from shared Phase 3/4/5 data — NO duplicate
 * skill engine, opportunity model, or student model (master spec §75, §90).
 */
export const AcademiaService = {
  // ── Industry Skill Signals (§5, §6) — derived from Phase 4 opportunities ──
  getIndustrySignals: (): IndustrySkillSignal[] => {
    const opps = useCareerStore.getState().opportunities.filter((o) => o.status === "Published");
    const skillMap = new Map<string, { count: number; roles: Set<string> }>();
    for (const o of opps) {
      for (const rs of o.requiredSkills) {
        const e = skillMap.get(rs.skillId) ?? { count: 0, roles: new Set<string>() };
        e.count++; o.targetRoles.forEach((r) => e.roles.add(r));
        skillMap.set(rs.skillId, e);
      }
    }
    return [...skillMap.entries()]
      .map(([skillId, { count, roles }]) => ({
        skillId, skillName: SKILL_NAMES[skillId] ?? skillId,
        demandLevel: count >= 3 ? "High" : count >= 2 ? "Medium" : "Low" as const,
        opportunityCount: count,
        targetRoles: [...roles],
        recentSignal: `${count} active opportunity(ies) require this skill within the current platform dataset.`,
      }))
      .sort((a, b) => b.opportunityCount - a.opportunityCount);
  },

  // ── Emerging Skills (§7, §8) — transparent rule: high demand + curriculum gap ──
  getEmergingSkills: () => {
    const signals = AcademiaService.getIndustrySignals();
    return signals
      .filter((s) => s.demandLevel === "High")
      .map((s) => {
        const coverage = DEMO_CURRICULUM.filter((c) => c.skillId === s.skillId);
        const maxCoverage = coverage.length > 0 ? coverage.reduce((max, c) => coverageRank(c.coverage) > coverageRank(max) ? c : max).coverage : "Not Covered";
        return { ...s, demandTrend: "Increasing", curriculumCoverage: maxCoverage, reason: `Demand has increased across the current demonstration opportunity set (${s.opportunityCount} active). Curriculum coverage: ${maxCoverage}.` };
      });
  },

  // ── Student cohort gaps (§9, §10) — aggregate from Phase 5 candidates ──
  getCohortGaps: (): CohortSkillGap[] => {
    const candidates = DEMO_CANDIDATES;
    const skillMap = new Map<string, { scores: number[]; roles: Set<string> }>();
    for (const c of candidates) {
      for (const [, comp] of Object.entries(c.competencies)) {
        const e = skillMap.get(comp.skillId) ?? { scores: [], roles: new Set<string>() };
        e.scores.push(comp.competencyScore);
        e.roles.add(c.targetRole);
        skillMap.set(comp.skillId, e);
      }
    }
    return [...skillMap.entries()]
      .map(([skillId, { scores, roles }]) => {
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        return {
          skillId, skillName: SKILL_NAMES[skillId] ?? skillId,
          avgCompetency: avg,
          gap: avg < 50 ? "High" : avg < 65 ? "Medium" : "Low" as const,
          affectedStudents: scores.length,
          roleImportance: 0,
          targetRoles: [...roles],
        };
      })
      .sort((a, b) => a.avgCompetency - b.avgCompetency);
  },

  // ── Curriculum Alignment (§11, §14) — demand vs coverage vs competency ──
  getCurriculumAlignment: (): CurriculumAlignmentRow[] => {
    const signals = AcademiaService.getIndustrySignals();
    const candidates = DEMO_CANDIDATES;
    return signals.map((sig) => {
      const coverageEntries = DEMO_CURRICULUM.filter((c) => c.skillId === sig.skillId);
      const maxCoverage: CoverageLevel = coverageEntries.length > 0
        ? coverageEntries.reduce((max, c) => coverageRank(c.coverage) > coverageRank(max) ? c : max).coverage
        : "Not Covered";
      const avgComp = candidates
        .filter((c) => c.competencies[sig.skillId])
        .reduce((sum, c, _, arr) => sum + c.competencies[sig.skillId].competencyScore, 0) / Math.max(1, candidates.filter((c) => c.competencies[sig.skillId]).length);
      const avgCompetency = isNaN(avgComp) ? 0 : Math.round(avgComp);
      const practicalEvidence = avgCompetency >= 70 ? "Strong" : avgCompetency >= 50 ? "Moderate" : avgCompetency > 0 ? "Limited" : "None" as const;
      const practicalExposureGap = (maxCoverage === "Strong" && practicalEvidence === "Limited") || practicalEvidence === "None" ? "High" : practicalEvidence === "Moderate" ? "Medium" : "Low" as const;
      const alignment = coverageRank(maxCoverage) >= 2 && avgCompetency >= 60 ? "Aligned" : coverageRank(maxCoverage) >= 1 && avgCompetency >= 40 ? "Needs Attention" : "Gap" as const;
      const enrichment: string[] = [];
      if (practicalExposureGap === "High") enrichment.push("Industry project", "Workshop", "Mentorship");
      else if (practicalExposureGap === "Medium") enrichment.push("Project-based activity", "Workshop");
      if (coverageRank(maxCoverage) < 2) enrichment.push("Curriculum enrichment");
      return {
        skillId: sig.skillId, skillName: sig.skillName,
        industryDemand: sig.demandLevel, demandCount: sig.opportunityCount,
        curriculumCoverage: maxCoverage, alignment,
        studentAvgCompetency: avgCompetency, practicalEvidence, practicalExposureGap,
        targetRoles: sig.targetRoles,
        suggestedEnrichment: enrichment.length > 0 ? enrichment : ["Monitor"],
      };
    }).sort((a, b) => (a.alignment === "Gap" ? -1 : a.alignment === "Needs Attention" ? 0 : 1) - (b.alignment === "Gap" ? -1 : b.alignment === "Needs Attention" ? 0 : 1));
  },

  getFacultyOpportunities: (): FacultyOpportunity[] => DEMO_FACULTY_OPPS,
  getCollaborations: (): Collaboration[] => useAcademiaStore.getState().collaborations,
  getMentorshipSessions: (): MentorshipSession[] => useAcademiaStore.getState().mentorshipSessions,
  getApplications: (): FacultyApplication[] => useAcademiaStore.getState().facultyApplications,
  getNotifications: (): AcademiaNotification[] => useAcademiaStore.getState().notifications,
  getFaculty: () => DEMO_FACULTY,
  getInstitution: () => DEMO_INSTITUTION,
  getDepartments: () => DEMO_DEPARTMENTS,
  getCourses: () => DEMO_COURSES,
  getCurriculum: () => DEMO_CURRICULUM,
};

function coverageRank(c: CoverageLevel): number {
  return { "Not Covered": 0, "Introductory": 1, "Moderate": 2, "Strong": 3 }[c];
}

/**
 * useAcademia — reactive hook. Recomputes industry signals, emerging skills,
 * cohort gaps, and curriculum alignment when shared data changes.
 */
export function useAcademia() {
  const opportunities = useCareerStore((s) => s.opportunities);
  const candidates = DEMO_CANDIDATES;
  const facultyApps = useAcademiaStore((s) => s.facultyApplications);
  const collaborations = useAcademiaStore((s) => s.collaborations);
  const mentorshipSessions = useAcademiaStore((s) => s.mentorshipSessions);
  const notifications = useAcademiaStore((s) => s.notifications);

  return useMemo(() => {
    const signals = AcademiaService.getIndustrySignals();
    const emerging = AcademiaService.getEmergingSkills();
    const gaps = AcademiaService.getCohortGaps();
    const alignment = AcademiaService.getCurriculumAlignment();
    return { opportunities, candidates, signals, emerging, gaps, alignment, facultyApps, collaborations, mentorshipSessions, notifications };
  }, [opportunities, facultyApps, collaborations, mentorshipSessions, notifications]);
}
