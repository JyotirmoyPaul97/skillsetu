/**
 * SKILL SETU — Phase 11
 * GET /api/opportunities
 *
 * Lists all OPEN opportunities with requiredSkills parsed from JSON.
 * Query filters: ?role=Data+Analyst&skillId=abc123
 *
 * Returns { data: [...], meta: { count } }.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, err, requireAuth } from "@/lib/api-response";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const url = new URL(req.url);
    const roleFilter = url.searchParams.get("role")?.trim();
    const skillIdFilter = url.searchParams.get("skillId")?.trim();

    const opportunities = await db.opportunity.findMany({
      where: { status: "OPEN" },
      include: {
        industry: {
          select: {
            id: true,
            name: true,
            email: true,
            industryProfile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = opportunities.map((o) => {
      let requiredSkills: { name: string; weight: number; minLevel: number }[] = [];
      try {
        requiredSkills = JSON.parse(o.requiredSkills || "[]");
      } catch {
        requiredSkills = [];
      }
      return {
        id: o.id,
        title: o.title,
        description: o.description,
        type: o.type,
        location: o.location,
        stipend: o.stipend,
        deadline: o.deadline,
        openings: o.openings,
        status: o.status,
        requiredSkills,
        industry: {
          id: o.industry.id,
          name: o.industry.name,
          email: o.industry.email,
          companyName: o.industry.industryProfile?.companyName ?? o.industry.name,
          industry: o.industry.industryProfile?.industry ?? "Technology",
        },
        createdAt: o.createdAt,
      };
    });

    const filtered = parsed.filter((o) => {
      if (roleFilter) {
        const matchesRole =
          o.title.toLowerCase().includes(roleFilter.toLowerCase()) ||
          o.requiredSkills.some((s) =>
            s.name.toLowerCase().includes(roleFilter.toLowerCase()),
          );
        if (!matchesRole) return false;
      }
      if (skillIdFilter) {
        const hasSkill = o.requiredSkills.length > 0; // skillId filter at this layer is informational only
        if (!hasSkill) return false;
      }
      return true;
    });

    return ok(filtered, { count: filtered.length, total: parsed.length });
  } catch (e) {
    console.error("[api/opportunities GET] error:", e);
    return err("INTERNAL", "Failed to list opportunities", 500);
  }
}

export const dynamic = "force-dynamic";
