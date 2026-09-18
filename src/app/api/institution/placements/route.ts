import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import type { PlacementRow } from "@/lib/types";

export async function GET() {
  const auth = await requireRole("INSTITUTION");
  if (auth.response) return auth.response;

  const inst = await db.institution.findFirst({ orderBy: { createdAt: "asc" } });
  if (!inst) return NextResponse.json([]);

  const rows = await db.placementRecord.findMany({
    where: { institutionId: inst.id },
    orderBy: [{ branch: "asc" }, { academicYear: "desc" }],
  });

  const out: PlacementRow[] = rows.map((r) => ({
    branch: r.branch,
    academicYear: r.academicYear,
    totalStudents: r.totalStudents,
    placed: r.placed,
    avgPackage: r.avgPackage,
    topRecruiters: JSON.parse(r.topRecruiters || "[]"),
  }));

  return NextResponse.json(out);
}
