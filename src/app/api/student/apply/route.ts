import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { matchStudentToOpportunity, getStudentSkills } from "@/lib/skill-engine";
import type { RequiredSkill } from "@/lib/types";

export async function POST(request: NextRequest) {
  const auth = await requireRole("STUDENT");
  if (auth.response) return auth.response;

  let body: { opportunityId?: string; coverNote?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const opportunityId = body.opportunityId;
  if (!opportunityId) return NextResponse.json({ error: "missing_opportunityId" }, { status: 400 });

  const opp = await db.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opp || opp.status !== "OPEN")
    return NextResponse.json({ error: "opportunity_unavailable" }, { status: 400 });

  const existing = await db.application.findUnique({
    where: { opportunityId_studentId: { opportunityId, studentId: auth.user.id } },
  });
  if (existing) return NextResponse.json({ error: "already_applied" }, { status: 409 });

  const reqs: RequiredSkill[] = JSON.parse(opp.requiredSkills || "[]");
  const studentSkills = await getStudentSkills(auth.user.id);
  const matchScore = await matchStudentToOpportunity(auth.user.id, reqs, studentSkills);

  const app = await db.application.create({
    data: {
      opportunityId,
      studentId: auth.user.id,
      matchScore,
      coverNote: body.coverNote || "",
      status: "PENDING",
    },
  });
  return NextResponse.json({ id: app.id, matchScore });
}
