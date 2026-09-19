/**
 * SKILL SETU — Phase 11
 * POST /api/feedback
 *
 * Body: { toStudentId, opportunityId?, rating, comment?, skillScores? }
 *
 * RBAC: INDUSTRY / ACADEMIA / ADMIN only.
 *
 * Cross-portal feedback→evidence loop (§32):
 *   If `skillScores` ({ skillId: score } map) is provided, also create
 *   SkillEvidence rows (type=FEEDBACK, verified=true) for each skill —
 *   this is the canonical Industry Feedback → Student Evidence bridge.
 *
 * Returns { data: { feedback, evidenceCreated } }.
 */
import { NextResponse } from "next/server";
import { EvidenceType, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, err, requireAuth } from "@/lib/api-response";
import { canGiveFeedback } from "@/lib/rbac";
import { appendAudit } from "@/lib/audit";
import { recordEvent } from "@/lib/event-log";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    if (!canGiveFeedback(auth.user)) {
      return err(
        "FORBIDDEN",
        "Only industry / academia / admin can give feedback",
        403,
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) return err("MISSING_FIELDS", "Body required", 400);

    const toStudentId = String(body.toStudentId ?? "");
    const opportunityId = body.opportunityId
      ? String(body.opportunityId)
      : null;
    const ratingNum = Number(body.rating ?? 0);
    const comment = String(body.comment ?? "");
    const skillScores =
      body.skillScores && typeof body.skillScores === "object"
        ? (body.skillScores as Record<string, number>)
        : null;

    if (!toStudentId) {
      return err("MISSING_FIELDS", "toStudentId is required", 400);
    }
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return err("INVALID_RATING", "rating must be 1-5", 400);
    }

    const [student, opportunity] = await Promise.all([
      db.user.findUnique({ where: { id: toStudentId } }),
      opportunityId
        ? db.opportunity.findUnique({ where: { id: opportunityId } })
        : Promise.resolve(null),
    ]);
    if (!student || student.role !== "STUDENT") {
      return err("NOT_FOUND", "Student not found", 404);
    }
    if (opportunityId && !opportunity) {
      return err("NOT_FOUND", "Opportunity not found", 404);
    }

    // Create feedback + (optional) evidence rows in a transaction so
    // we never have orphan feedback or partial-evidence states.
    const { feedback, evidenceRows } = await db.$transaction(async (tx) => {
      const fb = await tx.feedback.create({
        data: {
          fromUserId: auth.user.id,
          toStudentId,
          opportunityId: opportunity?.id ?? null,
          rating: Math.round(ratingNum),
          comment,
        },
      });

      const created: { id: string; skillId: string; score: number; title: string }[] = [];
      if (skillScores) {
        for (const [skillId, scoreRaw] of Object.entries(skillScores)) {
          const score = Number(scoreRaw);
          if (!Number.isFinite(score) || score < 0 || score > 100) continue;
          const skill = await tx.skill.findUnique({ where: { id: skillId } });
          if (!skill) continue;
          const ev = await tx.skillEvidence.create({
            data: {
              studentId: toStudentId,
              skillId,
              type: EvidenceType.FEEDBACK,
              title: `Feedback from ${auth.user.name} (${fb.rating}/5)`,
              description: comment,
              score: Math.round(score),
              verified: true,
              provider: auth.user.name,
            },
          });
          created.push({
            id: ev.id,
            skillId,
            score: ev.score,
            title: ev.title,
          });
        }
      }
      return { feedback: fb, evidenceRows: created };
    });

    appendAudit({
      actorUserId: auth.user.id,
      action: "CREATE_FEEDBACK",
      entityType: "Feedback",
      entityId: feedback.id,
    });
    recordEvent({
      eventType: "FEEDBACK",
      actorType: auth.role as Exclude<Role, "STUDENT">,
      action: "create",
      affectedEntity: `Feedback:${feedback.id}`,
      explanation:
        evidenceRows.length > 0
          ? `${auth.user.name} gave ${feedback.rating}/5 to ${student.name} and added ${evidenceRows.length} evidence row(s).`
          : `${auth.user.name} gave ${feedback.rating}/5 to ${student.name}.`,
    });

    return ok({ feedback, evidenceCreated: evidenceRows });
  } catch (e) {
    console.error("[api/feedback POST] error:", e);
    return err("INTERNAL", "Failed to record feedback", 500);
  }
}

export const dynamic = "force-dynamic";
