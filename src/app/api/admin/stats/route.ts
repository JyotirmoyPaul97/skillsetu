/**
 * SKILL SETU — Phase 11
 * GET /api/admin/stats
 *
 * System status dashboard: counts for users, evidence, opportunities
 * (broken down by role / status), plus recent audit + event timeline
 * entries from the in-memory prototype stores.
 *
 * RBAC: any authenticated user (system status is non-sensitive).
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, err, requireAuth } from "@/lib/api-response";
import { getAuditLog } from "@/lib/audit";
import { getEventLog } from "@/lib/event-log";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const [
      userCount,
      studentCount,
      industryCount,
      academiaCount,
      institutionCount,
      evidenceCount,
      verifiedEvidenceCount,
      opportunityCount,
      openOpportunityCount,
      applicationCount,
      feedbackCount,
      curriculumCount,
      skillCount,
      targetRoleCount,
      sessionCount,
    ] = await Promise.all([
      db.user.count(),
      db.studentProfile.count(),
      db.industryProfile.count(),
      db.academiaProfile.count(),
      db.user.count({ where: { role: "INSTITUTION" } }),
      db.skillEvidence.count(),
      db.skillEvidence.count({ where: { verified: true } }),
      db.opportunity.count(),
      db.opportunity.count({ where: { status: "OPEN" } }),
      db.application.count(),
      db.feedback.count(),
      db.curriculumAlignment.count(),
      db.skill.count(),
      db.targetRoleSkill.count(),
      db.session.count(),
    ]);

    const audit = getAuditLog().slice(-20).reverse();
    const events = getEventLog().slice(-20).reverse();

    return ok({
      users: {
        total: userCount,
        students: studentCount,
        industry: industryCount,
        academia: academiaCount,
        institution: institutionCount,
      },
      evidence: { total: evidenceCount, verified: verifiedEvidenceCount },
      opportunities: {
        total: opportunityCount,
        open: openOpportunityCount,
      },
      applications: applicationCount,
      feedback: feedbackCount,
      curriculum: curriculumCount,
      skills: skillCount,
      targetRoles: targetRoleCount,
      activeSessions: sessionCount,
      recentAudit: audit,
      recentEvents: events,
    });
  } catch (e) {
    console.error("[api/admin/stats GET] error:", e);
    return err("INTERNAL", "Failed to load stats", 500);
  }
}

export const dynamic = "force-dynamic";
