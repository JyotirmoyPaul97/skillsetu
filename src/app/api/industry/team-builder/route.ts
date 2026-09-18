import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/session";
import { searchTalent } from "@/lib/skill-engine";
import { db } from "@/lib/db";
import type { RequiredSkill, TalentRow } from "@/lib/types";
import type { TeamBuildResult } from "@/lib/types";

interface RoleSpec {
  role: string;
  count: number;
  requiredSkills: RequiredSkill[];
}

interface ReqBody {
  projectName: string;
  description: string;
  roles: RoleSpec[];
}

export async function POST(request: NextRequest) {
  const auth = await requireRole("INDUSTRY");
  if (auth.response) return auth.response;

  let body: ReqBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.projectName || !body.roles || !Array.isArray(body.roles) || body.roles.length === 0) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // Gather candidate students for each role spec by searching talent.
  const selected: TalentRow[] = [];
  const reasoningPerRole: string[] = [];

  for (const rs of body.roles) {
    // Combine all required skills across this role's slots
    const candidates = await searchTalent({
      requiredSkills: rs.requiredSkills,
      limit: 20,
    });
    const need = rs.count || 1;
    const picked = candidates.slice(0, need);
    selected.push(...picked);
    reasoningPerRole.push(
      `${rs.role} ×${need}: ${picked.length ? picked.map((p) => `${p.name} (${p.matchScore}%)`).join(", ") : "no matches found"}`,
    );
  }

  // Persist the team-build request
  const record = await db.teamBuildRequest.create({
    data: {
      industryId: auth.user.id,
      projectName: body.projectName,
      description: body.description || "",
      requiredRoles: JSON.stringify(body.roles),
      result: JSON.stringify(selected.map((s) => s.id)),
    },
  });

  const reasoning = `Recommended ${selected.length} member(s) across ${body.roles.length} role(s).\n` +
    reasoningPerRole.join("\n") +
    "\n\nSelection is evidence-based: each member's match score is computed from verified skill evidence against role requirements. Members with higher verified evidence and aligned target roles are ranked first.";

  const result: TeamBuildResult = {
    projectName: body.projectName,
    members: selected,
    reasoning,
  };
  return NextResponse.json({ id: record.id, result });
}
