/**
 * SKILL SETU — Phase 8 Hackathon public API.
 */
export * from "./hackathon-model";
export { DEMO_HACKATHONS, DEMO_PROBLEM_STATEMENTS, DEMO_MENTORS, DEMO_TEAM, DEMO_TEAM_MEMBERS, findHackathon, findProblem, getProblemsForHackathon } from "./hackathon-demo-data";
export { useHackathonStore } from "./hackathon-store";
export { HackathonService, calculateStudentFit, calculateOverallFit, getRecommendedHackathons, calculateTeamCoverage, calculateEvaluationTotal, getEvaluationBreakdown, checkHackathonEligibility, getHackathonStatus, getDeadlineStatus } from "./hackathon-service";
