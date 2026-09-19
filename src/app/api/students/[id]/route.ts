/**
 * SKILL SETU — Phase 11
 * GET /api/students/[id]
 *
 * RBAC:
 *   - STUDENT can only fetch self.
 *   - INDUSTRY / ACADEMIA / INSTITUTION / ADMIN can fetch any student.
 *
 * Returns:
 *   { data: { student, competencies, evidence, readiness } }
 *
 * Readiness formula (spec §21):
 *   readiness = Σ(studentSkillScore × roleWeight) / Σ(roleWeight)
 *   where studentSkillScore = max SkillEvidence.score per skill for this student
 *   and roleWeight = TargetRoleSkill.weight for student's targetRole.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, err, requireAuth } from "@/lib/api-response";
import { canStudentAccess } from "@/lib/rbac";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { id: studentId } = await ctx.params;
    if (!studentId) {
      return err("MISSING_ID", "Student id required", 400);
    }

    if (!canStudentAccess(auth.user, studentId)) {
      return err("FORBIDDEN", "Students can only access their own profile", 403);
    }

    const student = await db.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true },
    });
    if (!student || student.role !== "STUDENT" || !student.studentProfile) {
      return err("NOT_FOUND", "Student not found", 404);
    }

    // All evidence for this student, with skill info joined
    const evidenceRows = await db.skillEvidence.findMany({
      where: { studentId },
      include: { skill: true },
      orderBy: { createdAt: "desc" },
    });

    // Group by skillId → max score (the student's current "best" evidence per skill)
    const skillBest = new Map<string, { name: string; category: string; score: number; verified: boolean }>();
    for (const e of evidenceRows) {
      const prev = skillBest.get(e.skillId);
      if (!prev || e.score > prev.score) {
        skillBest.set(e.skillId, {
          name: e.skill.name,
          category: e.skill.category,
          score: e.score,
          verified: e.verified,
        });
      }
    }

    // Competency summary grouped by skill category
    const byCategory = new Map<string, { count: number; avg: number; total: number; verifiedCount: number }>();
    for (const e of evidenceRows) {
      const cat = e.skill.category;
      const entry = byCategory.get(cat) ?? { count: 0, avg: 0, total: 0, verifiedCount: 0 };
      entry.count += 1;
      entry.total += e.score;
      if (e.verified) entry.verifiedCount += 1;
      entry.avg = Math.round(entry.total / entry.count);
      byCategory.set(cat, entry);
    }
    const competencies = Array.from(byCategory.entries()).map(([category, v]) => ({
      category,
      evidenceCount: v.count,
      avgScore: v.avg,
      verifiedCount: v.verifiedCount,
    }));

    // Target role readiness
    const targetRole = student.studentProfile.targetRole || "";
    let readiness: {
      role: string;
      score: number;
      weightedSum: number;
      weightSum: number;
      matchedSkills: { name: string; score: number; weight: number; targetLevel: number }[];
      missingSkills: { name: string; weight: number; targetLevel: number }[];
    } | null = null;

    if (targetRole) {
      const targets = await db.targetRoleSkill.findMany({
        where: { roleName: targetRole },
        include: { skill: true },
      });
      let weightedSum = 0;
      let weightSum = 0;
      const matchedSkills: { name: string; score: number; weight: number; targetLevel: number }[] = [];
      const missingSkills: { name: string; weight: number; targetLevel: number }[] = [];
      for (const t of targets) {
        const best = skillBest.get(t.skillId);
        const score = best?.score ?? 0;
        weightedSum += score * t.weight;
        weightSum += t.weight;
        const entry = {
          name: t.skill.name,
          score,
          weight: t.weight,
          targetLevel: t.targetLevel,
        };
        if (best) matchedSkills.push(entry);
        else missingSkills.push({ name: t.skill.name, weight: t.weight, targetLevel: t.targetLevel });
      }
      const score = weightSum > 0 ? Math.round((weightedSum / weightSum) * 10) / 10 : 0;
      readiness = { role: targetRole, score, weightedSum, weightSum, matchedSkills, missingSkills };
    }

    // Never expose passwordHash
    const { passwordHash: _omit, ...safeUser } = student;
    void _omit;

    return ok({
      student: { ...safeUser, profile: student.studentProfile },
      competencies,
      evidence: evidenceRows.map((e) => ({
        id: e.id,
        skillId: e.skillId,
        skillName: e.skill.name,
        type: e.type,
        title: e.title,
        description: e.description,
        score: e.score,
        verified: e.verified,
        provider: e.provider,
        createdAt: e.createdAt,
      })),
      evidenceCount: evidenceRows.length,
      readiness,
    });
  } catch (e) {
    console.error("[api/students/[id]] error:", e);
    return err("INTERNAL", "Failed to load student", 500);
  }
}

export const dynamic = "force-dynamic";
