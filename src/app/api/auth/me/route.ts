import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  // attach profile info depending on role
  let profile: unknown = null;
  if (session.role === "STUDENT") {
    const p = await db.studentProfile.findUnique({
      where: { userId: session.id },
      include: { institution: true },
    });
    profile = p
      ? {
          rollNo: p.rollNo,
          branch: p.branch,
          year: p.year,
          cgpa: p.cgpa,
          bio: p.bio,
          targetRole: p.targetRole,
          institutionId: p.institutionId,
          institutionName: p.institution?.name,
        }
      : null;
  } else if (session.role === "INDUSTRY") {
    const p = await db.industryProfile.findUnique({ where: { userId: session.id } });
    profile = p
      ? {
          companyName: p.companyName,
          industry: p.industry,
          website: p.website,
          location: p.location,
          size: p.size,
        }
      : null;
  } else if (session.role === "ACADEMIA") {
    const p = await db.academiaProfile.findUnique({
      where: { userId: session.id },
      include: { institution: true },
    });
    profile = p
      ? {
          department: p.department,
          designation: p.designation,
          institutionId: p.institutionId,
          institutionName: p.institution?.name,
          researchAreas: p.researchAreas,
        }
      : null;
  } else if (session.role === "INSTITUTION") {
    // institution admin: pick first institution as default for demo
    const inst = await db.institution.findFirst({ orderBy: { createdAt: "asc" } });
    profile = inst ? { institutionId: inst.id, institutionName: inst.name, location: inst.location } : null;
  }

  return NextResponse.json({ user: { ...session, profile } });
}
