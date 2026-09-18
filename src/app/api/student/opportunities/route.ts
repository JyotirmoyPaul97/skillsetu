import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { matchStudentToOpportunity, getStudentSkills } from "@/lib/skill-engine";
import type { OpportunityCard, RequiredSkill } from "@/lib/types";

export async function GET() {
  const auth = await requireRole("STUDENT");
  if (auth.response) return auth.response;

  const opps = await db.opportunity.findMany({
    where: { status: "OPEN" },
    include: { industry: { include: { industryProfile: true } } },
    orderBy: { createdAt: "desc" },
  });

  const myApps = await db.application.findMany({
    where: { studentId: auth.user.id },
    select: { opportunityId: true },
  });
  const appliedSet = new Set(myApps.map((a) => a.opportunityId));

  const studentSkills = await getStudentSkills(auth.user.id);

  const cards: OpportunityCard[] = await Promise.all(
    opps.map(async (o) => {
      const reqs: RequiredSkill[] = JSON.parse(o.requiredSkills || "[]");
      const matchScore = await matchStudentToOpportunity(auth.user.id, reqs, studentSkills);
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
        matchScore,
        applied: appliedSet.has(o.id),
      };
    }),
  );

  // sort by match score descending
  cards.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  return NextResponse.json(cards);
}
