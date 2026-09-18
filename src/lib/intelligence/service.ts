"use client";

import { useMemo } from "react";
import { useIntelligence } from "./store";
import {
  calculateRoleReadiness, calculateSkillGaps, getNextBestAction,
  calculateEvidenceConfidence, getReadinessExplanation, getStudentCompetency,
  projectWhatIf,
} from "./engine";
import { getRoleConfig } from "./role-config";
import type { ReadinessResult, SkillGap, NextAction, EvidenceRecord } from "./types";

/**
 * Service API (master spec §39). Pure functions that read the central store
 * and run the engine. Components should call these — NOT re-implement calcs.
 */
export const IntelligenceService = {
  getStudentSkills: () => {
    const s = useIntelligence.getState();
    return Object.values(s.competencies);
  },
  getStudentEvidence: (): EvidenceRecord[] => useIntelligence.getState().evidence,
  getStudentCompetency: (skillId: string) => getStudentCompetency(useIntelligence.getState().student.studentId, useIntelligence.getState().competencies, skillId),
  calculateRoleReadiness: (roleId?: string): ReadinessResult => {
    const s = useIntelligence.getState();
    return calculateRoleReadiness(s.student.studentId, roleId ?? s.roleId, s.competencies, s.evidence);
  },
  calculateSkillGaps: (roleId?: string): SkillGap[] => {
    const s = useIntelligence.getState();
    return calculateSkillGaps(s.student.studentId, roleId ?? s.roleId, s.competencies, s.evidence);
  },
  getNextBestAction: (roleId?: string): NextAction | null => {
    const s = useIntelligence.getState();
    return getNextBestAction(s.student.studentId, roleId ?? s.roleId, s.competencies, s.evidence);
  },
  getReadinessExplanation: (roleId?: string): string => {
    const r = IntelligenceService.calculateRoleReadiness(roleId);
    return getReadinessExplanation(r);
  },
  getSkillExplanation: (skillId: string): string => {
    const s = useIntelligence.getState();
    const comp = s.competencies[skillId];
    const role = getRoleConfig(s.roleId);
    const rs = role?.skills.find((x) => x.skillId === skillId);
    const conf = calculateEvidenceConfidence(skillId, s.evidence);
    const ev = s.evidence.filter((e) => e.skillId === skillId);
    return [
      `Skill: ${comp?.skillName ?? skillId}`,
      `Competency: ${comp?.competencyScore ?? 0} / 100`,
      `Evidence Confidence: ${comp?.evidenceConfidence ?? conf.level} (${comp?.evidenceConfidencePercent ?? conf.percent}%)`,
      `Role Importance: ${rs ? Math.round(rs.weight * 100) + "%" : "not in current role"}`,
      `Contribution: ${comp && rs ? (comp.competencyScore * rs.weight).toFixed(2) : "n/a"}`,
      `Evidence Count: ${ev.length}`,
      `Last Updated: ${comp?.lastUpdated ?? "—"}`,
      `Evidence sources: ${ev.map((e) => e.sourceTitle).join(", ") || "none"}`,
    ].join("\n");
  },
  projectWhatIf: (skillId: string, projectedScore: number) => {
    const s = useIntelligence.getState();
    return projectWhatIf(s.student.studentId, s.roleId, s.competencies, s.evidence, skillId, projectedScore);
  },
};

/**
 * useIntelligenceDerived — React hook that reactively recomputes the full
 * intelligence picture from the central store. Any competency/evidence/role
 * change triggers recalculation across the UI (master spec §34).
 */
export function useIntelligenceDerived() {
  const student = useIntelligence((s) => s.student);
  const roleId = useIntelligence((s) => s.roleId);
  const competencies = useIntelligence((s) => s.competencies);
  const evidence = useIntelligence((s) => s.evidence);

  return useMemo(() => {
    const readiness = calculateRoleReadiness(student.studentId, roleId, competencies, evidence);
    const gaps = calculateSkillGaps(student.studentId, roleId, competencies, evidence);
    const nextAction = getNextBestAction(student.studentId, roleId, competencies, evidence);
    const role = getRoleConfig(roleId);
    return { student, roleId, role, competencies, evidence, readiness, gaps, nextAction };
  }, [student, roleId, competencies, evidence]);
}
