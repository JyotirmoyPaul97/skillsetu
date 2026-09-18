import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import type { ApplicationRow, OpportunityCard, RequiredSkill } from "@/lib/types";

export async function GET() {
  const auth = await requireRole("STUDENT");
  if (auth.response) return auth.response;

  const apps = await db.application.findMany({
    where: { studentId: auth.user.id },
    include: {
      opportunity: {
        include: { industry: { include: { industryProfile: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: ApplicationRow[] = apps.map((a) => {
    const o = a.opportunity;
    const reqs: RequiredSkill[] = JSON.parse(o.requiredSkills || "[]");
    const card: OpportunityCard = {
      id: o.id,
      title: o.title,
      description: o.description,
      type: o.type,
      requiredSkills: reqs,
      location: o.location,
      stipend: o.stipend,
      deadline: o.deadline,
      openings: o.openings,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      industry: {
        id: o.industry.id,
        name: o.industry.industryProfile?.companyName ?? o.industry.name,
        avatarColor: o.industry.avatarColor,
        industry: o.industry.industryProfile?.industry,
        location: o.industry.industryProfile?.location,
      },
    };
    return {
      id: a.id,
      status: a.status,
      matchScore: a.matchScore,
      coverNote: a.coverNote,
      createdAt: a.createdAt.toISOString(),
      opportunity: card,
    };
  });

  return NextResponse.json(rows);
}
