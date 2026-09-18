import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import type { BranchStatRow } from "@/lib/types";

export async function GET() {
  const auth = await requireRole("INSTITUTION");
  if (auth.response) return auth.response;

  // pick the first institution as the default for this admin (demo)
  const inst = await db.institution.findFirst({ orderBy: { createdAt: "asc" } });
  if (!inst) return NextResponse.json([]);

  const rows = await db.branchAnalytics.findMany({
    where: { institutionId: inst.id },
    orderBy: [{ branch: "asc" }, { academicYear: "desc" }],
  });

  const out: BranchStatRow[] = rows.map((r) => ({
    branch: r.branch,
    academicYear: r.academicYear,
    avgSkillScore: r.avgSkillScore,
    placementRate: r.placementRate,
    internshipRate: r.internshipRate,
    studentCount: r.studentCount,
  }));

  return NextResponse.json({ institution: { id: inst.id, name: inst.name, location: inst.location }, rows: out });
}
