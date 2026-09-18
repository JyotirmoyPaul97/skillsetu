"use client";

import { useMemo } from "react";
import { useCareerStore } from "./store";
import { useIntelligence } from "@/lib/intelligence";
import { DEMO_OPPORTUNITIES, findOpportunity } from "./opportunity-demo-data";
import {
  calculateOpportunityMatch, checkOpportunityEligibility, getSkillMatchDetail,
  getRecommendations, getDeadlineStatus, daysUntilDeadline,
} from "./matching";
import type { Opportunity, MatchResult, EligibilityResult, Recommendation, SkillMatchDetail, DeadlineStatus } from "./opportunity-model";

/**
 * Phase 4 Career service API (master spec §66 — consumes Phase 3 intelligence).
 * Pure functions reading both stores; components call these, never reimplement matching.
 */
export const CareerService = {
  getOpportunities: (type?: string): Opportunity[] => {
    const all = useCareerStore.getState().opportunities;
    return type ? all.filter((o) => o.type === type) : all;
  },
  getOpportunity: (id: string): Opportunity | undefined => findOpportunity(id) ?? useCareerStore.getState().opportunities.find((o) => o.id === id),

  calculateOpportunityMatch: (opportunityId: string): MatchResult | null => {
    const opp = CareerService.getOpportunity(opportunityId);
    const intel = useIntelligence.getState();
    if (!opp) return null;
    return calculateOpportunityMatch(intel.student.studentId, opp, intel.competencies, intel.evidence, intel.roleId, intel.student, useCareerStore.getState().cgpa);
  },
  checkOpportunityEligibility: (opportunityId: string): EligibilityResult | null => {
    const opp = CareerService.getOpportunity(opportunityId);
    const intel = useIntelligence.getState();
    if (!opp) return null;
    return checkOpportunityEligibility(intel.student, opp, intel.roleId, intel.competencies, useCareerStore.getState().cgpa);
  },
  getSkillMatchDetail: (opportunityId: string, skillId: string): SkillMatchDetail | null => {
    const opp = CareerService.getOpportunity(opportunityId);
    const intel = useIntelligence.getState();
    if (!opp) return null;
    return getSkillMatchDetail(opp, skillId, intel.competencies);
  },
  getRecommendations: (): Recommendation[] => {
    const opps = useCareerStore.getState().opportunities;
    const intel = useIntelligence.getState();
    return getRecommendations(opps, intel.student.studentId, intel.competencies, intel.evidence, intel.roleId, intel.student, useCareerStore.getState().cgpa);
  },
  getBestMatch: (): { opportunity: Opportunity; match: MatchResult } | null => {
    const recs = CareerService.getRecommendations();
    if (recs.length === 0) return null;
    return { opportunity: recs[0].opportunity, match: recs[0].match };
  },
  getApplications: () => useCareerStore.getState().applications,
  getSavedOpportunities: (): Opportunity[] => {
    const { savedIds, opportunities } = useCareerStore.getState();
    return savedIds.map((id) => opportunities.find((o) => o.id === id)).filter(Boolean) as Opportunity[];
  },
  getDeadlineStatus: (opportunityId: string): DeadlineStatus => {
    const opp = CareerService.getOpportunity(opportunityId);
    return opp ? getDeadlineStatus(opp) : "Closed";
  },
  getNotifications: () => useCareerStore.getState().notifications,
};

/**
 * useCareer — reactive hook that recomputes opportunity matches whenever the
 * Phase 3 intelligence OR the career store changes (master spec §74: changing
 * student intelligence can affect opportunity matching).
 */
export function useCareer() {
  const opportunities = useCareerStore((s) => s.opportunities);
  const applications = useCareerStore((s) => s.applications);
  const savedIds = useCareerStore((s) => s.savedIds);
  const cgpa = useCareerStore((s) => s.cgpa);
  const student = useIntelligence((s) => s.student);
  const roleId = useIntelligence((s) => s.roleId);
  const competencies = useIntelligence((s) => s.competencies);
  const evidence = useIntelligence((s) => s.evidence);

  return useMemo(() => {
    // compute matches for all published opportunities
    const matches: Record<string, MatchResult> = {};
    for (const o of opportunities) {
      if (o.status !== "Published") continue;
      matches[o.id] = calculateOpportunityMatch(student.studentId, o, competencies, evidence, roleId, student, cgpa);
    }
    const recommendations = getRecommendations(opportunities, student.studentId, competencies, evidence, roleId, student, cgpa);
    const bestMatch = recommendations.length > 0 ? { opportunity: recommendations[0].opportunity, match: recommendations[0].match } : null;
    return { opportunities, applications, savedIds, matches, recommendations, bestMatch, student, roleId, competencies, evidence, cgpa };
  }, [opportunities, applications, savedIds, cgpa, student, roleId, competencies, evidence]);
}
