/**
 * SKILL SETU — Phase 4 Career & Opportunity Intelligence public API.
 */
export * from "./opportunity-model";
export { DEMO_OPPORTUNITIES, findOpportunity } from "./opportunity-demo-data";
export {
  calculateOpportunityMatch, checkOpportunityEligibility, getSkillMatchDetail,
  getRecommendations, getDeadlineStatus, daysUntilDeadline,
  getApplicationTimeline, getTimelineIndex,
} from "./matching";
export { useCareerStore } from "./store";
export { CareerService, useCareer } from "./service";
