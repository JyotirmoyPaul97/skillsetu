/**
 * SKILL SETU — Phase 3 Centralized Intelligence Store (master spec §2, §40, §41).
 *
 * SINGLE SOURCE OF TRUTH for the student intelligence layer. Every component
 * reads from here — no duplicated S042 data. Mutations (role switch, competency
 * edit, add evidence, update evidence status) flow through here and trigger
 * recalculation across the whole UI (master spec §34).
 *
 * Prototype persistence: localStorage (clearly labelled — not production DB).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEMO_STUDENT, DEMO_ROLE_PROFILES, INITIAL_EVIDENCE, INITIAL_ASSESSMENT_RESULTS,
  INITIAL_READINESS_HISTORY, skillName,
} from "./demo-data";
import { getRoleConfig } from "./role-config";
import { calculateEvidenceConfidence } from "./engine";
import type { Competency, EvidenceRecord, EvidenceStatus, AssessmentResult } from "./types";

const DEFAULT_ROLE = "data-scientist";

function buildCompetenciesFromProfile(
  profile: Record<string, number>,
  evidence: EvidenceRecord[],
): Record<string, Competency> {
  const out: Record<string, Competency> = {};
  for (const [skillId, score] of Object.entries(profile)) {
    const ev = evidence.filter((e) => e.skillId === skillId);
    const conf = calculateEvidenceConfidence(skillId, evidence);
    const lastUpdated = ev.length ? ev.map((e) => e.createdAt).sort().reverse()[0] : new Date().toISOString();
    out[skillId] = {
      skillId,
      skillName: skillName(skillId),
      competencyScore: score,
      evidenceConfidence: conf.level,
      evidenceConfidencePercent: conf.percent,
      lastUpdated,
      evidenceCount: ev.length,
      evidenceIds: ev.map((e) => e.evidenceId),
    };
  }
  return out;
}

interface IntelligenceState {
  student: typeof DEMO_STUDENT;
  roleId: string;
  competencies: Record<string, Competency>;
  evidence: EvidenceRecord[];
  assessmentResults: AssessmentResult[];
  readinessHistory: typeof INITIAL_READINESS_HISTORY;

  // actions
  setRole: (roleId: string) => void;
  setCompetency: (skillId: string, score: number) => void; // override (what-if / assessment update)
  resetCompetenciesForRole: () => void;
  addEvidence: (ev: Omit<EvidenceRecord, "evidenceId" | "createdAt" | "updatedAt" | "studentId">) => string;
  updateEvidenceStatus: (evidenceId: string, status: EvidenceStatus) => void;
  resetAll: () => void;
}

export const useIntelligence = create<IntelligenceState>()(
  persist(
    (set, get) => ({
      student: DEMO_STUDENT,
      roleId: DEFAULT_ROLE,
      competencies: buildCompetenciesFromProfile(DEMO_ROLE_PROFILES[DEFAULT_ROLE], INITIAL_EVIDENCE),
      evidence: INITIAL_EVIDENCE,
      assessmentResults: INITIAL_ASSESSMENT_RESULTS,
      readinessHistory: INITIAL_READINESS_HISTORY,

      setRole: (roleId) => {
        const role = getRoleConfig(roleId);
        if (!role) return; // §45 graceful — ignore unknown role
        const profile = DEMO_ROLE_PROFILES[roleId] ?? {};
        const competencies = buildCompetenciesFromProfile(profile, get().evidence);
        set({ roleId, competencies });
      },

      setCompetency: (skillId, score) => {
        // §47 validate score 0–100
        if (typeof score !== "number" || score < 0 || score > 100) return;
        const cur = get().competencies[skillId];
        const conf = calculateEvidenceConfidence(skillId, get().evidence);
        const competencies: Record<string, Competency> = {
          ...get().competencies,
          [skillId]: {
            skillId,
            skillName: cur?.skillName ?? skillName(skillId),
            competencyScore: score,
            evidenceConfidence: cur?.evidenceConfidence ?? conf.level,
            evidenceConfidencePercent: cur?.evidenceConfidencePercent ?? conf.percent,
            lastUpdated: new Date().toISOString(),
            evidenceCount: cur?.evidenceCount ?? 0,
            evidenceIds: cur?.evidenceIds ?? [],
          },
        };
        set({ competencies });
      },

      resetCompetenciesForRole: () => {
        const profile = DEMO_ROLE_PROFILES[get().roleId] ?? {};
        set({ competencies: buildCompetenciesFromProfile(profile, get().evidence) });
      },

      addEvidence: (ev) => {
        const evidenceId = "ev-" + Math.random().toString(36).slice(2, 9);
        const now = new Date().toISOString();
        const record: EvidenceRecord = {
          ...ev,
          evidenceId,
          studentId: get().student.studentId,
          createdAt: now,
          updatedAt: now,
        };
        const evidence = [record, ...get().evidence];
        // recompute confidence for affected skill
        const competencies = { ...get().competencies };
        if (competencies[ev.skillId]) {
          const conf = calculateEvidenceConfidence(ev.skillId, evidence);
          competencies[ev.skillId] = {
            ...competencies[ev.skillId],
            evidenceConfidence: conf.level,
            evidenceConfidencePercent: conf.percent,
            evidenceCount: evidence.filter((e) => e.skillId === ev.skillId).length,
            evidenceIds: evidence.filter((e) => e.skillId === ev.skillId).map((e) => e.evidenceId),
            lastUpdated: now,
          };
        }
        set({ evidence, competencies });
        return evidenceId;
      },

      updateEvidenceStatus: (evidenceId, status) => {
        const evidence = get().evidence.map((e) =>
          e.evidenceId === evidenceId ? { ...e, status, updatedAt: new Date().toISOString() } : e,
        );
        // recompute confidence for the affected skill
        const affected = get().evidence.find((e) => e.evidenceId === evidenceId);
        const competencies = { ...get().competencies };
        if (affected && competencies[affected.skillId]) {
          const conf = calculateEvidenceConfidence(affected.skillId, evidence);
          competencies[affected.skillId] = {
            ...competencies[affected.skillId],
            evidenceConfidence: conf.level,
            evidenceConfidencePercent: conf.percent,
            evidenceCount: evidence.filter((e) => e.skillId === affected.skillId).length,
            evidenceIds: evidence.filter((e) => e.skillId === affected.skillId).map((e) => e.evidenceId),
          };
        }
        set({ evidence, competencies });
      },

      resetAll: () =>
        set({
          student: DEMO_STUDENT,
          roleId: DEFAULT_ROLE,
          competencies: buildCompetenciesFromProfile(DEMO_ROLE_PROFILES[DEFAULT_ROLE], INITIAL_EVIDENCE),
          evidence: INITIAL_EVIDENCE,
          assessmentResults: INITIAL_ASSESSMENT_RESULTS,
          readinessHistory: INITIAL_READINESS_HISTORY,
        }),
    }),
    {
      name: "skillsetu-intelligence-v1", // localStorage key — PROTOTYPE persistence
      partialize: (s) => ({
        roleId: s.roleId,
        competencies: s.competencies,
        evidence: s.evidence,
        assessmentResults: s.assessmentResults,
        readinessHistory: s.readinessHistory,
      }),
    },
  ),
);
