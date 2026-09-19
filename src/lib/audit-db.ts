/**
 * SKILL SETU — Phase 12 DB-backed Audit Logger.
 *
 * Writes AuditLog rows to the real Prisma `audit_logs` table.
 * This is the PERSISTENT audit trail — survives restarts, hot reloads,
 * and is visible across sessions. Replaces the Phase 11 in-memory prototype.
 *
 * Master spec §22 (audit logging), §94 (security audit), §97 (definition of done).
 */

import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

export interface AuditLogInput {
  actorUserId: string | null;
  actorRole: Role | "SYSTEM" | string;
  action: string;          // LOGIN | LOGOUT | REGISTER | CREATE_EVIDENCE | VERIFY_EVIDENCE | SUBMIT_FEEDBACK | SEED_RESET | etc.
  entityType?: string;     // User | Evidence | Opportunity | Feedback | Session
  entityId?: string | null;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Appends an audit log entry to the database. Non-blocking — failures
 * are logged to console but do NOT fail the parent request (best-effort).
 */
export async function appendAudit(input: AuditLogInput): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        actorRole: String(input.actorRole ?? "SYSTEM"),
        action: input.action,
        entityType: input.entityType ?? "",
        entityId: input.entityId ?? null,
        ipAddress: input.ipAddress ?? "",
        userAgent: input.userAgent ?? "",
        metadata: input.metadata ? JSON.stringify(input.metadata) : "{}",
      },
    });
  } catch (err) {
    // Best-effort — don't fail the parent request
    console.error("[audit] failed to append audit log:", err);
  }
}

/**
 * Reads recent audit log entries (newest first).
 * Master spec §22 — visible audit trail for enterprise traceability.
 */
export async function getRecentAudit(limit = 50, filters?: { actorUserId?: string; action?: string }) {
  try {
    return await db.auditLog.findMany({
      where: {
        ...(filters?.actorUserId ? { actorUserId: filters.actorUserId } : {}),
        ...(filters?.action ? { action: filters.action } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
    });
  } catch (err) {
    console.error("[audit] failed to read audit log:", err);
    return [];
  }
}

/**
 * Returns audit log stats for the system status panel.
 */
export async function getAuditStats() {
  try {
    const total = await db.auditLog.count();
    const last24h = await db.auditLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
    });
    const byAction = await db.auditLog.groupBy({
      by: ["action"],
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
      take: 10,
    });
    return { total, last24h, byAction: byAction.map((b) => ({ action: b.action, count: b._count.action })) };
  } catch (err) {
    console.error("[audit] failed to get audit stats:", err);
    return { total: 0, last24h: 0, byAction: [] };
  }
}
