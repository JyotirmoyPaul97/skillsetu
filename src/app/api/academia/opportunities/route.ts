import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import type { OpportunityCard, RequiredSkill } from "@/lib/types";

export async function GET() {
  const auth = await requireRole("ACADEMIA");
  if (auth.response) return auth.response;

  // Faculty see all open opportunities to share with students
  const opps = await db.opportunity.findMany({
    where: { status: "OPEN" },
    include: { industry: { include: { industryProfile: true } } },
    orderBy: { createdAt: "desc" },
  });

  const cards: OpportunityCard[] = opps.map((o) => {
    const reqs: RequiredSkill[] = JSON.parse(o.requiredSkills || "[]");
    return {
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
  });

  return NextResponse.json(cards);
}
