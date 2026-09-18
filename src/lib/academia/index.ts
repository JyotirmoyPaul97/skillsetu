/**
 * SKILL SETU — Phase 6 Academia Portal public API.
 */
export * from "./academia-model";
export {
  DEMO_INSTITUTION, DEMO_DEPARTMENTS, DEMO_COURSES, DEMO_CURRICULUM,
  DEMO_FACULTY, DEMO_FACULTY_OPPS, DEMO_COLLABORATIONS, DEMO_MENTORSHIP_SESSIONS,
  DEMO_ACADEMIA_NOTIFICATIONS,
} from "./academia-demo-data";
export { useAcademiaStore } from "./academia-store";
export { AcademiaService, useAcademia } from "./academia-service";
