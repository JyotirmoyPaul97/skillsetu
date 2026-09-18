import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { getStudentSkills } from "@/lib/skill-engine";

export async function GET(request: NextRequest) {
  const auth = await requireRole("INSTITUTION");
  if (auth.response) return auth.response;

  const sp = request.nextUrl.searchParams;
  const branchFilter = sp.get("branch") || undefined;

  const inst = await db.institution.findFirst({ orderBy: { createdAt: "asc" } });
  if (!inst) return NextResponse.json([]);

  const profiles = await db.studentProfile.findMany({
    where: { institutionId: inst.id, ...(branchFilter ? { branch: branchFilter } : {}) },
    include: { user: true },
  });

  const out = [];
  for (const p of profiles) {
    const skills = await getStudentSkills(p.userId);
    const avg = skills.length ? Math.round(skills.reduce((a, s) => a + s.level, 0) / skills.length) : 0;
    out.push({
      id: p.userId,
      name: p.user.name,
      email: p.user.email,
      avatarColor: p.user.avatarColor,
      rollNo: p.rollNo,
      branch: p.branch,
      year: p.year,
      cgpa: p.cgpa,
      targetRole: p.targetRole,
      avgSkillScore: avg,
      skillCount: skills.length,
      topSkills: skills.slice(0, 3).map((s) => ({ name: s.skill.name, level: s.level })),
    });
  }
  // sort by avg skill score desc
  out.sort((a, b) => b.avgSkillScore - a.avgSkillScore);
  return NextResponse.json(out);
}
