import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import type { ApplicationRow, OpportunityCard, RequiredSkill } from "@/lib/types";
import type { ApplicationStatus } from "@prisma/client";

export async function GET() {
  const auth = await requireRole("INDUSTRY");
  if (auth.response) return auth.response;

  // all applications across this industry's opportunities
  const apps = await db.application.findMany({
    where: { opportunity: { industryId: auth.user.id } },
    include: {
      opportunity: true,
      student: {
        include: { studentProfile: { include: { institution: true } } },
      },
    },
    orderBy: { matchScore: "desc" },
  });

  const rows: (ApplicationRow & {
    student: {
      id: string;
      name: string;
      email: string;
      avatarColor: string;
      branch: string;
      year: number;
      cgpa: number;
      targetRole: string;
      institutionName?: string;
    };
  })[] = apps.map((a) => {
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
      industry: { id: auth.user.id, name: auth.user.name, avatarColor: auth.user.avatarColor },
    };
    const sp = a.student.studentProfile;
    return {
      id: a.id,
      status: a.status,
      matchScore: a.matchScore,
      coverNote: a.coverNote,
      createdAt: a.createdAt.toISOString(),
      opportunity: card,
      student: {
        id: a.student.id,
        name: a.student.name,
        email: a.student.email,
        avatarColor: a.student.avatarColor,
        branch: sp?.branch ?? "",
        year: sp?.year ?? 0,
        cgpa: sp?.cgpa ?? 0,
        targetRole: sp?.targetRole ?? "",
        institutionName: sp?.institution?.name,
      },
    };
  });

  return NextResponse.json(rows);
}

export async function PATCH(request: Request) {
  const auth = await requireRole("INDUSTRY");
  if (auth.response) return auth.response;

  let body: { id?: string; status?: ApplicationStatus };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  const valid: ApplicationStatus[] = ["PENDING", "SHORTLISTED", "SELECTED", "REJECTED", "WITHDRAWN"];
  if (!valid.includes(status)) return NextResponse.json({ error: "invalid_status" }, { status: 400 });

  // verify ownership
  const app = await db.application.findUnique({
    where: { id },
    include: { opportunity: true },
  });
  if (!app || app.opportunity.industryId !== auth.user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const updated = await db.application.update({ where: { id }, data: { status } });
  return NextResponse.json({ id: updated.id, status: updated.status });
}
