import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/session";
import { searchTalent } from "@/lib/skill-engine";
import type { RequiredSkill } from "@/lib/types";

export async function GET(request: NextRequest) {
  const auth = await requireRole("INDUSTRY");
  if (auth.response) return auth.response;

  const sp = request.nextUrl.searchParams;
  const skillNames = sp.get("skills") ? sp.get("skills")!.split(",") : undefined;
  const branch = sp.get("branch") || undefined;
  const targetRole = sp.get("targetRole") || undefined;
  const minCgpa = sp.get("minCgpa") ? Number(sp.get("minCgpa")) : undefined;
  const reqsRaw = sp.get("requiredSkills");
  const requiredSkills: RequiredSkill[] | undefined = reqsRaw
    ? (() => {
        try {
          return JSON.parse(reqsRaw);
        } catch {
          return undefined;
        }
      })()
    : undefined;

  const rows = await searchTalent({
    skillNames,
    branch,
    targetRole,
    minCgpa,
    requiredSkills,
    limit: 50,
  });
  return NextResponse.json(rows);
}
