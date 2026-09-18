import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/session";
import type { RegisterPayload } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: RegisterPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { email, password, name, role } = body;
  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!["STUDENT", "INDUSTRY", "ACADEMIA", "INSTITUTION"].includes(role)) {
    return NextResponse.json({ error: "invalid_role" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  const passwordHash = hashPassword(password);
  const colors: Record<string, string> = {
    STUDENT: "#0D9488",
    INDUSTRY: "#B45309",
    ACADEMIA: "#BE123C",
    INSTITUTION: "#6D28D9",
  };
  const user = await db.user.create({
    data: {
      email,
      name,
      role,
      passwordHash,
      avatarColor: colors[role],
    },
  });

  if (role === "STUDENT") {
    await db.studentProfile.create({
      data: {
        userId: user.id,
        rollNo: body.rollNo || "STU-" + user.id.slice(0, 6).toUpperCase(),
        branch: body.branch || "Computer Science",
        year: Number(body.year) || 1,
        cgpa: Number(body.cgpa) || 7.5,
        targetRole: body.targetRole || "Full-Stack Engineer",
        institutionId: body.institutionId || null,
        bio: `${name} — ${body.branch || "Computer Science"} student.`,
      },
    });
  } else if (role === "INDUSTRY") {
    await db.industryProfile.create({
      data: {
        userId: user.id,
        companyName: body.companyName || name,
        industry: body.industry || "Technology",
        website: body.website || "",
        location: body.location || "",
        size: body.size || "11-50",
      },
    });
  } else if (role === "ACADEMIA") {
    await db.academiaProfile.create({
      data: {
        userId: user.id,
        department: body.department || "Computer Science",
        designation: body.designation || "Assistant Professor",
        institutionId: body.institutionId || null,
        researchAreas: body.researchAreas || "",
      },
    });
  }

  await createSession(user.id);
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarColor: user.avatarColor,
  });
}
