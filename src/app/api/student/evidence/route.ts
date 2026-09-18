import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import type { EvidenceType } from "@prisma/client";

export async function POST(request: NextRequest) {
  const auth = await requireRole("STUDENT");
  if (auth.response) return auth.response;

  let body: { skillId?: string; type?: EvidenceType; title?: string; description?: string; score?: number; provider?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const { skillId, type, title, score } = body;
  if (!skillId || !type || !title) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const skill = await db.skill.findUnique({ where: { id: skillId } });
  if (!skill) return NextResponse.json({ error: "unknown_skill" }, { status: 400 });

  const ev = await db.skillEvidence.create({
    data: {
      studentId: auth.user.id,
      skillId,
      type,
      title,
      description: body.description || "",
      score: Math.max(0, Math.min(100, Number(score) || 60)),
      verified: false, // student-added evidence starts unverified
      provider: body.provider || "Self",
    },
  });
  return NextResponse.json({ id: ev.id });
}
