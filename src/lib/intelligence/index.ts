/**
 * SKILL SETU — Phase 3 Intelligence Engine public API.
 * Re-exports the role config, engine, store, and service so consumers import from one place.
 */

export * from "./role-config";
export * from "./types";
export { DEMO_STUDENT, DEMO_ROLE_PROFILES, INITIAL_EVIDENCE, INITIAL_ASSESSMENT_RESULTS, INITIAL_READINESS_HISTORY, skillName, SKILL_NAMES } from "./demo-data";
export {
  calculateRoleReadiness, calculateSkillGaps, getNextBestAction,
  calculateEvidenceConfidence, projectWhatIf,
  validateScore, validateWeight, getReadinessExplanation, getStudentCompetency,
} from "./engine";
export { useIntelligence } from "./store";
export { IntelligenceService, useIntelligenceDerived } from "./service";
