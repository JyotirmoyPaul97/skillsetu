import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import type { CurriculumGapRow } from "@/lib/types";

export async function GET() {
  const auth = await requireRole("ACADEMIA");
  if (auth.response) return auth.response;

  const rows = await db.curriculumAlignment.findMany({
    where: { academiaId: auth.user.id },
    include: { skill: true },
    orderBy: { gap: "desc" },
  });

  const out: CurriculumGapRow[] = rows.map((c) => ({
    id: c.id,
    branch: c.branch,
    skill: { id: c.skill.id, name: c.skill.name, category: c.skill.category },
    currentLevel: c.currentLevel,
    targetLevel: c.targetLevel,
    gap: c.gap,
    recommendation: c.recommendation,
  }));

  return NextResponse.json(out);
}

export async function POST(request: NextRequest) {
  const auth = await requireRole("ACADEMIA");
  if (auth.response) return auth.response;

  let body: { branch?: string; skillId?: string; currentLevel?: number; targetLevel?: number; recommendation?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const { branch, skillId, currentLevel, targetLevel, recommendation } = body;
  if (!branch || !skillId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const cur = Math.max(0, Math.min(100, Number(currentLevel) || 0));
  const tgt = Math.max(0, Math.min(100, Number(targetLevel) || 80));
  const rec = await db.curriculumAlignment.create({
    data: {
      academiaId: auth.user.id,
      branch,
      skillId,
      currentLevel: cur,
      targetLevel: tgt,
      gap: Math.max(0, tgt - cur),
      recommendation: recommendation || "",
    },
  });
  return NextResponse.json({ id: rec.id });
}
