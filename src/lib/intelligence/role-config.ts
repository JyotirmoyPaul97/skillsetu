/**
 * SKILL SETU — Phase 3 Role Configuration Engine (master spec §3, §4)
 *
 * Centralized ROLE_READINESS_CONFIG. Each role defines its skills and
 * importance weights (0–1) that sum to 1.0 (100%). All readiness calculations
 * derive from this — no role skills defined inside components.
 */

export interface RoleSkillConfig {
  skillId: string;
  skillName: string;
  weight: number; // 0–1, importance
}

export interface RoleConfig {
  roleId: string;
  roleName: string;
  skills: RoleSkillConfig[];
}

// Normalised skill IDs (kebab-case) so they're stable across roles.
// Note: "Problem Solving" appears in multiple roles; "Statistics" (DS) and
// "Mathematics & Statistics" (ML Engineer) are intentionally distinct skills.
export const SKILL_IDS = {
  python: "python",
  sql: "sql",
  statistics: "statistics",
  machineLearning: "machine-learning",
  problemSolving: "problem-solving",
  deepLearning: "deep-learning",
  mathStatistics: "mathematics-statistics",
  programming: "programming",
  dsa: "data-structures-algorithms",
  databaseMgmt: "database-management",
  softwareEngineering: "software-engineering",
  frontend: "frontend-development",
  backend: "backend-development",
  apiIntegration: "api-integration",
  networkSecurity: "network-security",
  cybersecurityFundamentals: "cybersecurity-fundamentals",
  threatAnalysis: "threat-analysis",
  linux: "linux",
  cicd: "ci-cd",
  cloudPlatforms: "cloud-platforms",
  dockerK8s: "docker-kubernetes",
  scripting: "scripting",
  cloudArchitecture: "cloud-architecture",
  networking: "networking",
  security: "security",
  systemDesign: "system-design",
  cpp: "c-cpp-programming",
  microcontrollers: "microcontrollers",
  embeddedSystems: "embedded-systems",
  electronicsFundamentals: "electronics-fundamentals",
  cad3d: "cad-3d-modelling",
  engineeringDrawing: "engineering-drawing",
  materialManufacturing: "material-manufacturing",
  mechanicalAnalysis: "mechanical-analysis",
  powerSystems: "power-systems",
  electricalMachines: "electrical-machines",
  powerElectronics: "power-electronics",
  electricalProtection: "electrical-protection",
  circuitAnalysis: "circuit-analysis",
  structuralAnalysis: "structural-analysis",
  structuralDesign: "structural-design",
  engineeringMechanics: "engineering-mechanics",
  autocad: "autocad-structural-software",
  digitalElectronics: "digital-electronics",
  verilogHdl: "verilog-hdl",
  vlsiDesign: "vlsi-design",
  cmosSemiconductor: "cmos-semiconductor-fundamentals",
} as const;

const s = SKILL_IDS;

export const ROLE_READINESS_CONFIG: Record<string, RoleConfig> = {
  "data-scientist": {
    roleId: "data-scientist",
    roleName: "Data Scientist",
    skills: [
      { skillId: s.python, skillName: "Python", weight: 0.25 },
      { skillId: s.sql, skillName: "SQL", weight: 0.15 },
      { skillId: s.statistics, skillName: "Statistics", weight: 0.20 },
      { skillId: s.machineLearning, skillName: "Machine Learning", weight: 0.30 },
      { skillId: s.problemSolving, skillName: "Problem Solving", weight: 0.10 },
    ],
  },
  "ml-engineer": {
    roleId: "ml-engineer",
    roleName: "ML Engineer",
    skills: [
      { skillId: s.python, skillName: "Python", weight: 0.20 },
      { skillId: s.machineLearning, skillName: "Machine Learning", weight: 0.30 },
      { skillId: s.deepLearning, skillName: "Deep Learning", weight: 0.25 },
      { skillId: s.mathStatistics, skillName: "Mathematics & Statistics", weight: 0.15 },
      { skillId: s.problemSolving, skillName: "Problem Solving", weight: 0.10 },
    ],
  },
  "software-engineer": {
    roleId: "software-engineer",
    roleName: "Software Engineer",
    skills: [
      { skillId: s.programming, skillName: "Programming", weight: 0.30 },
      { skillId: s.dsa, skillName: "Data Structures & Algorithms", weight: 0.25 },
      { skillId: s.databaseMgmt, skillName: "Database Management", weight: 0.15 },
      { skillId: s.softwareEngineering, skillName: "Software Engineering", weight: 0.20 },
      { skillId: s.problemSolving, skillName: "Problem Solving", weight: 0.10 },
    ],
  },
  "full-stack-developer": {
    roleId: "full-stack-developer",
    roleName: "Full Stack Developer",
    skills: [
      { skillId: s.frontend, skillName: "Frontend Development", weight: 0.20 },
      { skillId: s.backend, skillName: "Backend Development", weight: 0.20 },
      { skillId: s.databaseMgmt, skillName: "Database Management", weight: 0.15 },
      { skillId: s.apiIntegration, skillName: "API Integration", weight: 0.15 },
      { skillId: s.problemSolving, skillName: "Problem Solving", weight: 0.30 },
    ],
  },
  "cybersecurity-analyst": {
    roleId: "cybersecurity-analyst",
    roleName: "Cybersecurity Analyst",
    skills: [
      { skillId: s.networkSecurity, skillName: "Network Security", weight: 0.25 },
      { skillId: s.cybersecurityFundamentals, skillName: "Cybersecurity Fundamentals", weight: 0.25 },
      { skillId: s.threatAnalysis, skillName: "Threat Analysis", weight: 0.20 },
      { skillId: s.linux, skillName: "Linux", weight: 0.15 },
      { skillId: s.problemSolving, skillName: "Problem Solving", weight: 0.15 },
    ],
  },
  "devops-engineer": {
    roleId: "devops-engineer",
    roleName: "DevOps Engineer",
    skills: [
      { skillId: s.linux, skillName: "Linux", weight: 0.20 },
      { skillId: s.cicd, skillName: "CI/CD", weight: 0.25 },
      { skillId: s.cloudPlatforms, skillName: "Cloud Platforms", weight: 0.20 },
      { skillId: s.dockerK8s, skillName: "Docker & Kubernetes", weight: 0.25 },
      { skillId: s.scripting, skillName: "Scripting", weight: 0.10 },
    ],
  },
  "cloud-architect": {
    roleId: "cloud-architect",
    roleName: "Cloud Architect",
    skills: [
      { skillId: s.cloudPlatforms, skillName: "Cloud Platforms", weight: 0.30 },
      { skillId: s.cloudArchitecture, skillName: "Cloud Architecture", weight: 0.30 },
      { skillId: s.networking, skillName: "Networking", weight: 0.15 },
      { skillId: s.security, skillName: "Security", weight: 0.15 },
      { skillId: s.systemDesign, skillName: "System Design", weight: 0.10 },
    ],
  },
  "embedded-systems-engineer": {
    roleId: "embedded-systems-engineer",
    roleName: "Embedded Systems Engineer",
    skills: [
      { skillId: s.cpp, skillName: "C/C++ Programming", weight: 0.25 },
      { skillId: s.microcontrollers, skillName: "Microcontrollers", weight: 0.25 },
      { skillId: s.embeddedSystems, skillName: "Embedded Systems", weight: 0.25 },
      { skillId: s.electronicsFundamentals, skillName: "Electronics Fundamentals", weight: 0.15 },
      { skillId: s.problemSolving, skillName: "Problem Solving", weight: 0.10 },
    ],
  },
  "mechanical-design-engineer": {
    roleId: "mechanical-design-engineer",
    roleName: "Mechanical Design Engineer",
    skills: [
      { skillId: s.cad3d, skillName: "CAD / 3D Modelling", weight: 0.30 },
      { skillId: s.engineeringDrawing, skillName: "Engineering Drawing", weight: 0.20 },
      { skillId: s.materialManufacturing, skillName: "Material & Manufacturing", weight: 0.20 },
      { skillId: s.mechanicalAnalysis, skillName: "Mechanical Analysis", weight: 0.20 },
      { skillId: s.problemSolving, skillName: "Problem Solving", weight: 0.10 },
    ],
  },
  "power-systems-engineer": {
    roleId: "power-systems-engineer",
    roleName: "Power Systems Engineer",
    skills: [
      { skillId: s.powerSystems, skillName: "Power Systems", weight: 0.30 },
      { skillId: s.electricalMachines, skillName: "Electrical Machines", weight: 0.20 },
      { skillId: s.powerElectronics, skillName: "Power Electronics", weight: 0.20 },
      { skillId: s.electricalProtection, skillName: "Electrical Protection", weight: 0.15 },
      { skillId: s.circuitAnalysis, skillName: "Circuit Analysis", weight: 0.15 },
    ],
  },
  "structural-engineer": {
    roleId: "structural-engineer",
    roleName: "Structural Engineer",
    skills: [
      { skillId: s.structuralAnalysis, skillName: "Structural Analysis", weight: 0.30 },
      { skillId: s.structuralDesign, skillName: "Structural Design", weight: 0.25 },
      { skillId: s.engineeringMechanics, skillName: "Engineering Mechanics", weight: 0.20 },
      { skillId: s.autocad, skillName: "AutoCAD / Structural Software", weight: 0.15 },
      { skillId: s.problemSolving, skillName: "Problem Solving", weight: 0.10 },
    ],
  },
  "vlsi-design-engineer": {
    roleId: "vlsi-design-engineer",
    roleName: "VLSI Design Engineer",
    skills: [
      { skillId: s.digitalElectronics, skillName: "Digital Electronics", weight: 0.20 },
      { skillId: s.verilogHdl, skillName: "Verilog / HDL", weight: 0.25 },
      { skillId: s.vlsiDesign, skillName: "VLSI Design", weight: 0.30 },
      { skillId: s.cmosSemiconductor, skillName: "CMOS / Semiconductor Fundamentals", weight: 0.15 },
      { skillId: s.problemSolving, skillName: "Problem Solving", weight: 0.10 },
    ],
  },
};

export const ALL_ROLES: RoleConfig[] = Object.values(ROLE_READINESS_CONFIG);

export function getRoleConfig(roleId: string): RoleConfig | undefined {
  return ROLE_READINESS_CONFIG[roleId];
}

export function findRoleByName(name: string): RoleConfig | undefined {
  return ALL_ROLES.find((r) => r.roleName.toLowerCase() === name.toLowerCase());
}

/**
 * Validate that a role's weights sum to 1.0 (within tolerance).
 * (master spec §47 — Role weights: sum to 1)
 */
export function validateRoleWeights(roleId: string): { ok: boolean; sum: number; error?: string } {
  const role = getRoleConfig(roleId);
  if (!role) return { ok: false, sum: 0, error: `Unknown role: ${roleId}` };
  const sum = role.skills.reduce((acc, sk) => acc + sk.weight, 0);
  const ok = Math.abs(sum - 1) < 0.001;
  return { ok, sum, error: ok ? undefined : `Role "${role.roleName}" weights sum to ${(sum * 100).toFixed(2)}%, not 100%` };
}

/** Configured prototype competency target threshold (master spec §20 — NOT an industry standard). */
export const COMPETENCY_TARGET_THRESHOLD = 70;
