/**
 * SKILL SETU — Phase 12 /api/audit.
 *
 * GET: Returns recent AuditLog entries from the persistent DB table.
 *      Master spec §22 (audit logging) — visible audit trail for
 *      enterprise traceability.
 *
 * Query params:
 *   ?limit=50  (max 200)
 *   ?action=LOGIN  (filter by action)
 *   ?actorUserId=...  (filter by actor)
 *   ?stats=true  (return aggregate stats instead of entries)
 *
 * RBAC: any authenticated user can read the audit trail (read-only,
 * actions are role-scoped on write).
 */

import { NextRequest, NextResponse } from "next/server";
import { ok, err, requireAuth } from "@/lib/api-response";
import { getRecentAudit, getAuditStats } from "@/lib/audit-db";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const action = url.searchParams.get("action") ?? undefined;
  const actorUserId = url.searchParams.get("actorUserId") ?? undefined;
  const stats = url.searchParams.get("stats") === "true";

  try {
    if (stats) {
      const auditStats = await getAuditStats();
      return ok(auditStats);
    }
    const entries = await getRecentAudit(limit, { action, actorUserId });
    return ok(entries, { count: entries.length });
  } catch (e) {
    console.error("[api/audit] error:", e);
    return err("INTERNAL", "Failed to read audit log", 500);
  }
}
