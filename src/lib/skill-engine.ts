import { db } from "@/lib/db";
import type {
  SkillAgg,
  GapItem,
  EvidenceItem,
  SkillPassport,
  FeedbackItem,
  TalentRow,
  RequiredSkill,
} from "@/lib/types";
import type { SkillEvidence, Feedback, User, StudentProfile } from "@prisma/client";

const SUGGESTIONS: Record<string, string[]> = {
  default: [
    "Take a structured online course and add a certification as evidence.",
    "Ship a small open-source or personal project demonstrating this skill.",
    "Attempt an industry assessment and request verification.",
  ],
};

function suggestionsFor(skillName: string): string[] {
  const map: Record<string, string[]> = {
    "React.js": ["Build 2 component-libraries as portfolio evidence.", "Contribute a PR to an open-source React repo."],
    "Node.js": ["Ship a REST/GraphQL API with auth & tests.", "Deploy a small service to production."],
    "Machine Learning": ["Reproduce 1 paper + 1 Kaggle medal.", "Publish a model card on HuggingFace."],
    "Deep Learning": ["Fine-tune a transformer on a real dataset.", "Write up results as a verified project."],
    "System Design": ["Complete 3 case-study writeups.", "Run a mock system-design interview."],
    "AWS": ["Earn the Cloud Practitioner certification.", "Deploy a 3-tier app via Terraform."],
    "Docker": ["Containerise an existing project + CI build.", "Earn Docker fundamentals certification."],
    "Kubernetes": ["Spin up a local cluster; deploy & scale a service.", "Pursue the CKA certification."],
    "SQL": ["Complete advanced SQL case studies.", "Build a dashboard over a real dataset."],
    "Python": ["Automate a real-world workflow end-to-end.", "Publish a small package on PyPI."],
  };
  return map[skillName] ?? SUGGESTIONS.default;
}

/** Aggregate a student's evidence into per-skill levels. */
export async function getStudentSkills(studentId: string): Promise<SkillAgg[]> {
  const rows = await db.skillEvidence.findMany({
    where: { studentId },
    include: { skill: true },
    orderBy: { score: "desc" },
  });
  const bySkill = new Map<string, SkillEvidence[]>();
  for (const r of rows) {
    const arr = bySkill.get(r.skillId) ?? [];
    arr.push(r);
    bySkill.set(r.skillId, arr);
  }
  const aggs: SkillAgg[] = [];
  for (const [skillId, evidence] of bySkill.entries()) {
    // level = weighted blend: 70% max score, 30% mean — rewards both peak and consistency
    const scores = evidence.map((e) => e.score);
    const level = Math.round(0.7 * Math.max(...scores) + 0.3 * (scores.reduce((a, b) => a + b, 0) / scores.length));
    const verifiedCount = evidence.filter((e) => e.verified).length;
    const top = evidence[0];
    const topEvidence: EvidenceItem = {
      id: top.id,
      type: top.type,
      title: top.title,
      description: top.description,
      score: top.score,
      verified: top.verified,
      provider: top.provider,
      skill: { id: top.skill.id, name: top.skill.name, category: top.skill.category },
      createdAt: top.createdAt.toISOString(),
    };
    aggs.push({
      skill: { id: top.skill.id, name: top.skill.name, category: top.skill.category },
      level,
      evidenceCount: evidence.length,
      verifiedCount,
      topEvidence,
    });
  }
  return aggs.sort((a, b) => b.level - a.level);
}

/** Compute gaps for a target role. */
export async function getGapsForRole(
  studentId: string,
  targetRole: string,
  studentSkills?: SkillAgg[],
): Promise<GapItem[]> {
  const reqs = await db.targetRoleSkill.findMany({
    where: { roleName: targetRole },
    include: { skill: true },
  });
  const skills = studentSkills ?? (await getStudentSkills(studentId));
  const byId = new Map(skills.map((s) => [s.skill.id, s]));
  const gaps: GapItem[] = [];
  for (const r of reqs) {
    const cur = byId.get(r.skillId);
    const currentLevel = cur?.level ?? 0;
    gaps.push({
      skill: { id: r.skill.id, name: r.skill.name, category: r.skill.category },
      currentLevel,
      targetLevel: r.targetLevel,
      gap: Math.max(0, r.targetLevel - currentLevel),
      weight: r.weight,
      suggestions: suggestionsFor(r.skill.name),
    });
  }
  return gaps.sort((a, b) => b.gap * b.weight - a.gap * a.weight);
}

/** Overall readiness for a target role, 0-100. */
export function computeReadiness(skills: SkillAgg[], gaps: GapItem[]): number {
  if (gaps.length === 0) return 0;
  let total = 0, weightSum = 0;
  for (const g of gaps) {
    const ratio = Math.min(1, g.currentLevel / g.targetLevel);
    total += ratio * g.weight;
    weightSum += g.weight;
  }
  return Math.round((total / weightSum) * 100);
}

/** Full passport for a student. */
export async function getPassport(studentId: string): Promise<SkillPassport | null> {
  const profile = await db.studentProfile.findUnique({ where: { userId: studentId } });
  if (!profile) return null;
  const skills = await getStudentSkills(studentId);
  const gaps = await getGapsForRole(studentId, profile.targetRole, skills);
  const readiness = computeReadiness(skills, gaps);
  const evidence = await db.skillEvidence.findMany({
    where: { studentId },
    include: { skill: true },
    orderBy: { createdAt: "desc" },
  });
  const evidenceItems: EvidenceItem[] = evidence.map((e) => ({
    id: e.id,
    type: e.type,
    title: e.title,
    description: e.description,
    score: e.score,
    verified: e.verified,
    provider: e.provider,
    skill: { id: e.skill.id, name: e.skill.name, category: e.skill.category },
    createdAt: e.createdAt.toISOString(),
  }));
  const feedback = await db.feedback.findMany({
    where: { toStudentId: studentId },
    include: { fromUser: true, opportunity: true },
    orderBy: { createdAt: "desc" },
  });
  const feedbackItems: FeedbackItem[] = feedback.map((f) => ({
    id: f.id,
    rating: f.rating,
    comment: f.comment,
    createdAt: f.createdAt.toISOString(),
    fromUser: {
      id: f.fromUser.id,
      name: f.fromUser.name,
      avatarColor: f.fromUser.avatarColor,
      role: f.fromUser.role,
    },
    opportunity: f.opportunity ? { id: f.opportunity.id, title: f.opportunity.title } : null,
  }));
  return {
    targetRole: profile.targetRole,
    overallReadiness: readiness,
    skills,
    gaps,
    evidence: evidenceItems,
    feedbackReceived: feedbackItems,
  };
}

/** Match score of a student against an opportunity's required skills (0-100). */
export async function matchStudentToOpportunity(
  studentId: string,
  requiredSkills: RequiredSkill[],
  studentSkills?: SkillAgg[],
): Promise<number> {
  const skills = studentSkills ?? (await getStudentSkills(studentId));
  const byName = new Map(skills.map((s) => [s.skill.name.toLowerCase(), s.level]));
  let weighted = 0, totalW = 0;
  for (const rs of requiredSkills) {
    const level = byName.get(rs.name.toLowerCase()) ?? 0;
    const ratio = level >= rs.minLevel ? 1 : level / (rs.minLevel || 1);
    weighted += ratio * rs.weight;
    totalW += rs.weight;
  }
  return Math.round((weighted / (totalW || 1)) * 100);
}

/** Search talent (industry view). */
export async function searchTalent(opts: {
  skillNames?: string[];
  branch?: string;
  targetRole?: string;
  minCgpa?: number;
  limit?: number;
  requiredSkills?: RequiredSkill[]; // for match scoring
}): Promise<TalentRow[]> {
  const profiles = await db.studentProfile.findMany({
    include: { user: true, institution: true },
  });
  let rows = profiles;
  if (opts.branch) rows = rows.filter((p) => p.branch === opts.branch);
  if (opts.targetRole) rows = rows.filter((p) => p.targetRole === opts.targetRole);
  if (opts.minCgpa) rows = rows.filter((p) => p.cgpa >= (opts.minCgpa as number));

  const out: TalentRow[] = [];
  for (const p of rows) {
    const skills = await getStudentSkills(p.userId);
    if (opts.skillNames && opts.skillNames.length > 0) {
      const have = new Set(skills.map((s) => s.skill.name.toLowerCase()));
      const want = opts.skillNames.map((s) => s.toLowerCase());
      if (!want.some((w) => have.has(w))) continue;
    }
    let matchScore = 0;
    if (opts.requiredSkills && opts.requiredSkills.length > 0) {
      matchScore = await matchStudentToOpportunity(p.userId, opts.requiredSkills, skills);
    }
    out.push({
      id: p.userId,
      name: p.user.name,
      email: p.user.email,
      avatarColor: p.user.avatarColor,
      branch: p.branch,
      year: p.year,
      cgpa: p.cgpa,
      targetRole: p.targetRole,
      matchScore,
      topSkills: skills.slice(0, 4).map((s) => ({ name: s.skill.name, level: s.level })),
      institutionName: p.institution?.name,
    });
  }
  if (opts.requiredSkills) out.sort((a, b) => b.matchScore - a.matchScore);
  return out.slice(0, opts.limit ?? 50);
}
