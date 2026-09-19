/**
 * SKILL SETU — Phase 11
 * PATCH /api/evidence/[id]/verify
 *
 * RBAC: INDUSTRY / ACADEMIA / ADMIN only.
 * Body: { verified: boolean, provider? }
 *
 * Returns updated evidence (with skill + student joined for downstream UI).
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, err, requireAuth } from "@/lib/api-response";
import { canVerifyEvidence } from "@/lib/rbac";
import { Role } from "@prisma/client";
import { appendAudit } from "@/lib/audit";
import { recordEvent } from "@/lib/event-log";
import { appendAudit as appendAuditDb } from "@/lib/audit-db";
import { appendEvent as appendEventDb } from "@/lib/event-log-db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, ctx: RouteContext) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await ctx.params;
    if (!id) return err("MISSING_ID", "Evidence id required", 400);

    if (!canVerifyEvidence(auth.user)) {
      return err(
        "FORBIDDEN",
        "Only industry / academia / admin can verify evidence",
        403,
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) return err("MISSING_FIELDS", "Body required", 400);
    const verified = Boolean(body.verified);
    const provider =
      typeof body.provider === "string" && body.provider
        ? body.provider
        : auth.user.name;

    const existing = await db.skillEvidence.findUnique({ where: { id } });
    if (!existing) return err("NOT_FOUND", "Evidence not found", 404);

    const updated = await db.skillEvidence.update({
      where: { id },
      data: { verified, provider },
      include: {
        skill: true,
        student: { select: { name: true, email: true } },
      },
    });

    appendAudit({
      actorUserId: auth.user.id,
      action: verified ? "VERIFY_EVIDENCE" : "UNVERIFY_EVIDENCE",
      entityType: "SkillEvidence",
      entityId: id,
    });
    recordEvent({
      eventType: "VERIFICATION",
      actorType: auth.role as Exclude<Role, "STUDENT">,
      action: verified ? "verify" : "unverify",
      affectedEntity: `SkillEvidence:${id}`,
      explanation: `${auth.user.name} ${verified ? "verified" : "un-verified"} "${existing.title}" (provider: ${provider}).`,
    });

    // Phase 12: persistent DB-backed audit + event log
    await appendAuditDb({
      actorUserId: auth.user.id,
      actorRole: auth.role,
      action: verified ? "VERIFY_EVIDENCE" : "UNVERIFY_EVIDENCE",
      entityType: "SkillEvidence",
      entityId: id,
      ipAddress: req.headers.get("x-forwarded-for") ?? "",
      userAgent: req.headers.get("user-agent") ?? "",
      metadata: { studentId: existing.studentId, skillId: existing.skillId, provider, verified },
    });
    await appendEventDb({
      eventType: "EVIDENCE_VERIFIED",
      actorType: auth.role === "INDUSTRY" ? "INDUSTRY_PORTAL" : auth.role === "ACADEMIA" ? "ACADEMIA_PORTAL" : "INSTITUTION_PORTAL",
      action: `${auth.user.name} ${verified ? "verified" : "un-verified"} evidence "${existing.title}"`,
      affectedEntity: `Student:${existing.studentId} · Skill:${existing.skillId}`,
      affectedModules: ["Evidence Pipeline", "Skill Profile", "Role Readiness", "Skill Gap", "Opportunity Match"],
      explanation: `Evidence ${verified ? "transitioned to Verified" : "transitioned to un-verified"}. Provider: ${provider || "unspecified"}. The Skill Intelligence Engine will recompute competency (verified evidence is a strong signal) + readiness + skill gaps + opportunity match automatically. The change is visible across all 4 portals via shared Zustand stores.`,
    });

    return ok({ evidence: updated });
  } catch (e) {
    console.error("[api/evidence/[id]/verify] error:", e);
    return err("INTERNAL", "Failed to verify evidence", 500);
  }
}

export const dynamic = "force-dynamic";
