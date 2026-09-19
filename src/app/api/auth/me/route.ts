/**
 * SKILL SETU — Phase 11
 * GET /api/auth/me — returns current user + role profile.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, err, requireAuth } from "@/lib/api-response";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const userId = auth.user.id;

    // Fetch the role-specific profile in parallel with feedback counts.
    const [studentProfile, industryProfile, academiaProfile] = await Promise.all([
      db.studentProfile.findUnique({ where: { userId } }),
      db.industryProfile.findUnique({ where: { userId } }),
      db.academiaProfile.findUnique({ where: { userId } }),
    ]);

    return ok({
      user: auth.user,
      profile:
        auth.role === "STUDENT"
          ? studentProfile
          : auth.role === "INDUSTRY"
            ? industryProfile
            : auth.role === "ACADEMIA"
              ? academiaProfile
              : null,
    });
  } catch (e) {
    console.error("[api/auth/me] error:", e);
    return err("INTERNAL", "Failed to load session", 500);
  }
}

export const dynamic = "force-dynamic";
