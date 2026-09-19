/**
 * SKILL SETU — Phase 11
 * POST /api/auth/logout — clears session cookie + deletes Session row.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, err, requireAuth } from "@/lib/api-response";
import { SESSION_COOKIE } from "@/lib/auth";
import { appendAudit } from "@/lib/audit";
import { recordEvent } from "@/lib/event-log";

export async function POST() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
      await db.session.deleteMany({ where: { token } }).catch(() => {});
    }
    cookieStore.delete(SESSION_COOKIE);

    appendAudit({
      actorUserId: auth.user.id,
      action: "LOGOUT",
      entityType: "User",
      entityId: auth.user.id,
    });
    recordEvent({
      eventType: "AUTH",
      actorType: auth.role,
      action: "logout",
      affectedEntity: `User:${auth.user.id}`,
      explanation: `${auth.user.email} signed out.`,
    });

    return ok({ ok: true });
  } catch (e) {
    console.error("[api/auth/logout] error:", e);
    return err("INTERNAL", "Logout failed", 500);
  }
}

export const dynamic = "force-dynamic";
