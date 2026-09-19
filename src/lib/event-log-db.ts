/**
 * SKILL SETU — Phase 12 DB-backed Event Logger.
 *
 * Writes EventLog rows to the real Prisma `event_logs` table.
 * This is the PERSISTENT event timeline — survives restarts, hot reloads,
 * and is visible across sessions. Replaces the Phase 10 in-memory prototype.
 *
 * Master spec §21 (event system), §18 (event timeline), §19 (why did this change?).
 */

import { db } from "@/lib/db";

export interface EventLogInput {
  eventType: string;  // DEMAND_CHANGE | EVIDENCE_GENERATED | EVIDENCE_VERIFIED | READINESS_RECALCULATED | SKILL_GAP_RECALCULATED | MATCH_RECALCULATED | FEEDBACK_SUBMITTED | PASSPORT_UPDATED | INSTITUTION_INSIGHT_UPDATED | ACADEMIA_SIGNAL_UPDATED | DEMO_RESET | DEMO_STARTED
  actorType: string;  // STUDENT_PORTAL | INDUSTRY_PORTAL | ACADEMIA_PORTAL | INSTITUTION_PORTAL | SKILL_INTELLIGENCE_ENGINE | OPPORTUNITY_MATCH_ENGINE | EVALUATOR
  action: string;     // human-readable action description
  affectedEntity?: string;
  affectedModules?: string[];  // ["Skill Profile", "Role Readiness", ...]
  explanation?: string;  // for "Why did this change?" (§19)
}

/**
 * Appends an event log entry to the database. Non-blocking — failures
 * are logged to console but do NOT fail the parent request (best-effort).
 */
export async function appendEvent(input: EventLogInput): Promise<void> {
  try {
    await db.eventLog.create({
      data: {
        eventType: input.eventType,
        actorType: input.actorType,
        action: input.action,
        affectedEntity: input.affectedEntity ?? "",
        affectedModules: JSON.stringify(input.affectedModules ?? []),
        explanation: input.explanation ?? "",
      },
    });
  } catch (err) {
    console.error("[event-log] failed to append event:", err);
  }
}

/**
 * Reads recent event log entries (newest first).
 * Master spec §18 — chronological event timeline for evaluator trust.
 */
export async function getRecentEvents(limit = 50, filters?: { eventType?: string }) {
  try {
    return await db.eventLog.findMany({
      where: filters?.eventType ? { eventType: filters.eventType } : {},
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
    });
  } catch (err) {
    console.error("[event-log] failed to read events:", err);
    return [];
  }
}

/**
 * Returns event log stats for the system status panel.
 */
export async function getEventStats() {
  try {
    const total = await db.eventLog.count();
    const last24h = await db.eventLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
    });
    const byType = await db.eventLog.groupBy({
      by: ["eventType"],
      _count: { eventType: true },
      orderBy: { _count: { eventType: "desc" } },
      take: 10,
    });
    return { total, last24h, byType: byType.map((b) => ({ eventType: b.eventType, count: b._count.eventType })) };
  } catch (err) {
    console.error("[event-log] failed to get event stats:", err);
    return { total: 0, last24h: 0, byType: [] };
  }
}
