import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import type { OpportunityCard, RequiredSkill } from "@/lib/types";
import { OpportunityStatus, OpportunityType } from "@prisma/client";

export async function GET() {
  const auth = await requireRole("INDUSTRY");
  if (auth.response) return auth.response;

  const opps = await db.opportunity.findMany({
    where: { industryId: auth.user.id },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const cards: (OpportunityCard & { applicantCount: number })[] = opps.map((o) => {
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
      industry: { id: auth.user.id, name: auth.user.name, avatarColor: auth.user.avatarColor },
      applicantCount: o._count.applications,
    };
  });
  return NextResponse.json(cards);
}

export async function POST(request: NextRequest) {
  const auth = await requireRole("INDUSTRY");
  if (auth.response) return auth.response;

  let body: {
    title?: string;
    description?: string;
    type?: OpportunityType;
    requiredSkills?: RequiredSkill[];
    location?: string;
    stipend?: string;
    deadline?: string;
    openings?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const { title, description, type, requiredSkills, location, stipend, deadline, openings } = body;
  if (!title || !description || !type) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const opp = await db.opportunity.create({
    data: {
      industryId: auth.user.id,
      title,
      description,
      type,
      requiredSkills: JSON.stringify(requiredSkills || []),
      location: location || "Remote",
      stipend: stipend || "",
      deadline: deadline || "",
      openings: Number(openings) || 1,
      status: OpportunityStatus.OPEN,
    },
  });
  return NextResponse.json({ id: opp.id });
}
