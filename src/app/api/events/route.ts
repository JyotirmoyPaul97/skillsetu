/**
 * SKILL SETU — Phase 12 /api/events.
 *
 * GET: Returns recent EventLog entries from the persistent DB table.
 *      Master spec §18 (event timeline) — chronological state transitions
 *      for evaluator trust ("What changed? Why? When? By whom?").
 *
 * Query params:
 *   ?limit=50  (max 200)
 *   ?eventType=EVIDENCE_VERIFIED  (filter by type)
 *   ?stats=true  (return aggregate stats instead of entries)
 *
 * RBAC: any authenticated user can read the event timeline.
 */

import { NextRequest, NextResponse } from "next/server";
import { ok, err, requireAuth } from "@/lib/api-response";
import { getRecentEvents, getEventStats } from "@/lib/event-log-db";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const eventType = url.searchParams.get("eventType") ?? undefined;
  const stats = url.searchParams.get("stats") === "true";

  try {
    if (stats) {
      const eventStats = await getEventStats();
      return ok(eventStats);
    }
    const entries = await getRecentEvents(limit, { eventType });
    return ok(entries, { count: entries.length });
  } catch (e) {
    console.error("[api/events] error:", e);
    return err("INTERNAL", "Failed to read event log", 500);
  }
}
