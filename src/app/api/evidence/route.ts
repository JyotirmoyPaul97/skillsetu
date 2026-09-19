/**
 * SKILL SETU — Phase 11
 * POST /api/evidence
 *
 * Canonical demo action — Industry Feedback creates evidence here.
 *
 * Body: { studentId, skillId, type, title, description?, score, provider? }
 *
 * RBAC:
 *   - STUDENT can create own evidence (verified=false by default).
 *   - INDUSTRY/ACADEMIA/ADMIN can create on behalf (industry-issued
 *     evidence is auto-verified=true).
 *
 * Returns { data: { evidence } }.
 */
import { NextResponse } from "next/server";
import { EvidenceType } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, err, requireAuth } from "@/lib/api-response";
import { canCreateEvidenceFor } from "@/lib/rbac";
import { appendAudit } from "@/lib/audit";
import { recordEvent } from "@/lib/event-log";
import { appendAudit as appendAuditDb } from "@/lib/audit-db";
import { appendEvent as appendEventDb } from "@/lib/event-log-db";

const VALID_TYPES = new Set<EvidenceType>([
  EvidenceType.ASSESSMENT,
  EvidenceType.PROJECT,
  EvidenceType.CERTIFICATION,
  EvidenceType.INTERNSHIP,
  EvidenceType.FEEDBACK,
  EvidenceType.COURSEWORK,
]);

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json().catch(() => null);
    if (!body) return err("MISSING_FIELDS", "Request body required", 400);

    const studentId = String(body.studentId ?? "");
    const skillId = String(body.skillId ?? "");
    const typeRaw = String(body.type ?? "").toUpperCase();
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "");
    const scoreNum = Number(body.score ?? 0);
    const provider = String(body.provider ?? "");

    if (!studentId || !skillId || !typeRaw || !title) {
      return err(
        "MISSING_FIELDS",
        "studentId, skillId, type, title are required",
        400,
      );
    }
    if (!VALID_TYPES.has(typeRaw as EvidenceType)) {
      return err("INVALID_TYPE", "type must be a valid EvidenceType", 400);
    }
    if (!canCreateEvidenceFor(auth.user, studentId)) {
      return err(
        "FORBIDDEN",
        "Students can only create evidence for themselves",
        403,
      );
    }
    if (!Number.isFinite(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      return err("INVALID_SCORE", "score must be 0-100", 400);
    }

    // Confirm student + skill exist
    const [student, skill] = await Promise.all([
      db.user.findUnique({ where: { id: studentId } }),
      db.skill.findUnique({ where: { id: skillId } }),
    ]);
    if (!student || student.role !== "STUDENT") {
      return err("NOT_FOUND", "Student not found", 404);
    }
    if (!skill) {
      return err("NOT_FOUND", "Skill not found", 404);
    }

    // Industry-issued evidence is auto-verified.
    const verified =
      auth.role === "INDUSTRY" ||
      auth.role === "ACADEMIA" ||
      auth.role === "ADMIN";

    const evidence = await db.skillEvidence.create({
      data: {
        studentId,
        skillId,
        type: typeRaw as EvidenceType,
        title,
        description,
        score: Math.round(scoreNum),
        verified,
        provider: provider || auth.user.name,
      },
      include: { skill: true, student: { select: { name: true, email: true } } },
    });

    appendAudit({
      actorUserId: auth.user.id,
      action: "CREATE_EVIDENCE",
      entityType: "SkillEvidence",
      entityId: evidence.id,
    });
    recordEvent({
      eventType: "EVIDENCE",
      actorType: auth.role,
      action: "create",
      affectedEntity: `SkillEvidence:${evidence.id}`,
      explanation: `${auth.user.name} added ${evidence.type} evidence "${evidence.title}" (${evidence.score}/100) for ${evidence.student.name} on ${evidence.skill.name}.`,
    });

    // Phase 12: persistent DB-backed audit + event log (enterprise traceability)
    await appendAuditDb({
      actorUserId: auth.user.id,
      actorRole: auth.role,
      action: "CREATE_EVIDENCE",
      entityType: "SkillEvidence",
      entityId: evidence.id,
      ipAddress: req.headers.get("x-forwarded-for") ?? "",
      userAgent: req.headers.get("user-agent") ?? "",
      metadata: { skillId: evidence.skillId, type: evidence.type, score: evidence.score, verified },
    });
    await appendEventDb({
      eventType: "EVIDENCE_GENERATED",
      actorType: auth.role === "STUDENT" ? "STUDENT_PORTAL" : auth.role === "INDUSTRY" ? "INDUSTRY_PORTAL" : "ACADEMIA_PORTAL",
      action: `${auth.user.name} created ${evidence.type} evidence "${evidence.title}" for ${evidence.skill.name}`,
      affectedEntity: `Student:${evidence.studentId} · Skill:${evidence.skill.name}`,
      affectedModules: ["Skill Profile", "Evidence Pipeline", "Skill Passport"],
      explanation: `Evidence record created (status: ${evidence.verified ? "Verified" : "Submitted"}). Score: ${evidence.score}/100. The Skill Intelligence Engine will recompute competency + readiness + skill gaps + opportunity match automatically via the shared Zustand stores.`,
    });

    return ok({ evidence });
  } catch (e) {
    console.error("[api/evidence POST] error:", e);
    return err("INTERNAL", "Failed to create evidence", 500);
  }
}

export const dynamic = "force-dynamic";
