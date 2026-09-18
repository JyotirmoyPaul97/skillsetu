"use client";

import { useMemo } from "react";
import { useIndustryStore } from "./industry-store";
import { DEMO_CANDIDATES, findCandidate, DEMO_COMPANY, DEMO_INDUSTRY_USER } from "./candidates";
import { calculateOpportunityMatch } from "@/lib/career/matching";
import { useCareerStore } from "@/lib/career/store";
import type { Candidate } from "./industry-model";
import type { MatchResult } from "@/lib/career/opportunity-model";
import type { Opportunity } from "@/lib/career/opportunity-model";

/**
 * Phase 5 Industry service. REUSES Phase 4 calculateOpportunityMatch for candidate
 * matching — no second matching engine (master spec §21, §22, §62).
 */
export const IndustryService = {
  getCandidates: (): Candidate[] => DEMO_CANDIDATES,
  findCandidate,
  getCompany: () => DEMO_COMPANY,
  getUser: () => DEMO_INDUSTRY_USER,

  calculateCandidateMatch: (candidate: Candidate, opportunity: Opportunity): MatchResult => {
    // SAME Phase 4 matching engine — candidate.competencies + evidence vs opportunity
    const student = { studentId: candidate.studentId, name: candidate.name, branch: candidate.branch, year: candidate.year, college: candidate.college, location: candidate.location, avatarColor: candidate.avatarColor };
    return calculateOpportunityMatch(candidate.studentId, opportunity, candidate.competencies as any, candidate.evidence, candidate.roleId, student as any, candidate.cgpa);
  },

  getDemandConfigs: () => useIndustryStore.getState().demandConfigs,
  getFeedback: () => useIndustryStore.getState().feedback,
  getChallenges: () => useIndustryStore.getState().challenges,
  getInvitations: () => useIndustryStore.getState().invitations,
  getShortlisted: () => useIndustryStore.getState().shortlistedIds,
  getAuditLog: () => useIndustryStore.getState().auditLog,
  getNotifications: () => useIndustryStore.getState().notifications,
};

/**
 * useIndustry — reactive hook. Recomputes candidate matches against all published
 * opportunities when either store changes.
 */
export function useIndustry() {
  const candidates = DEMO_CANDIDATES;
  const opportunities = useCareerStore((s) => s.opportunities);
  const applications = useCareerStore((s) => s.applications);
  const demandConfigs = useIndustryStore((s) => s.demandConfigs);
  const feedback = useIndustryStore((s) => s.feedback);
  const challenges = useIndustryStore((s) => s.challenges);
  const invitations = useIndustryStore((s) => s.invitations);
  const shortlistedIds = useIndustryStore((s) => s.shortlistedIds);
  const notifications = useIndustryStore((s) => s.notifications);
  const auditLog = useIndustryStore((s) => s.auditLog);

  return useMemo(() => {
    // compute candidate matches for all candidates × published opportunities
    const candidateMatches: Record<string, Record<string, MatchResult>> = {};
    const publishedOpps = opportunities.filter((o) => o.status === "Published");
    for (const c of candidates) {
      candidateMatches[c.studentId] = {};
      for (const o of publishedOpps) {
        candidateMatches[c.studentId][o.id] = IndustryService.calculateCandidateMatch(c, o);
      }
    }
    return { candidates, opportunities, applications, demandConfigs, feedback, challenges, invitations, shortlistedIds, notifications, auditLog, candidateMatches, publishedOpps };
  }, [opportunities, applications, demandConfigs, feedback, challenges, invitations, shortlistedIds, notifications, auditLog]);
}
