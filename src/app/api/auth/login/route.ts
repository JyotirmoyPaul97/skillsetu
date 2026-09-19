/**
 * SKILL SETU — Phase 11/12
 * POST /api/auth/login
 * Body: { email, password } → sets session cookie, returns user.
 * Phase 12: now writes to persistent DB-backed AuditLog + EventLog tables.
 */
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api-response";
import { verifyPassword, createSession } from "@/lib/auth";
import { appendAudit } from "@/lib/audit";
import { recordEvent } from "@/lib/event-log";
import { appendAudit as appendAuditDb } from "@/lib/audit-db";
import { appendEvent as appendEventDb } from "@/lib/event-log-db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email?.toString()?.toLowerCase().trim();
    const password = body?.password?.toString() ?? "";
    if (!email || !password) {
      return err("MISSING_FIELDS", "email and password are required", 400);
    }

    const user = await db.user.findUnique({
      where: { email },
    });
    if (!user) {
      // Phase 12: audit failed login attempts (best-effort)
      await appendAuditDb({
        actorUserId: null,
        actorRole: "SYSTEM",
        action: "LOGIN_FAILED",
        entityType: "User",
        entityId: null,
        ipAddress: req.headers.get("x-forwarded-for") ?? "",
        userAgent: req.headers.get("user-agent") ?? "",
        metadata: { email },
      });
      return err("BAD_CREDENTIALS", "Invalid email or password", 401);
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await appendAuditDb({
        actorUserId: user.id,
        actorRole: user.role,
        action: "LOGIN_FAILED",
        entityType: "User",
        entityId: user.id,
        ipAddress: req.headers.get("x-forwarded-for") ?? "",
        userAgent: req.headers.get("user-agent") ?? "",
        metadata: { email },
      });
      return err("BAD_CREDENTIALS", "Invalid email or password", 401);
    }

    const { token, expiresAt } = await createSession(user.id, user.role);

    // Phase 11 in-memory log (client-visible)
    appendAudit({
      actorUserId: user.id,
      action: "LOGIN",
      entityType: "User",
      entityId: user.id,
    });
    recordEvent({
      eventType: "AUTH",
      actorType: user.role,
      action: "login",
      affectedEntity: `User:${user.id}`,
      explanation: `${user.email} signed in as ${user.role}.`,
    });

    // Phase 12 persistent DB log (enterprise audit trail)
    await appendAuditDb({
      actorUserId: user.id,
      actorRole: user.role,
      action: "LOGIN",
      entityType: "User",
      entityId: user.id,
      ipAddress: req.headers.get("x-forwarded-for") ?? "",
      userAgent: req.headers.get("user-agent") ?? "",
      metadata: { email: user.email },
    });
    await appendEventDb({
      eventType: "DEMO_STARTED",
      actorType: user.role === "STUDENT" ? "STUDENT_PORTAL" : user.role === "INDUSTRY" ? "INDUSTRY_PORTAL" : user.role === "ACADEMIA" ? "ACADEMIA_PORTAL" : "INSTITUTION_PORTAL",
      action: `${user.email} signed in as ${user.role}`,
      affectedEntity: `User:${user.id} · ${user.role}`,
      affectedModules: ["Demo Control Panel", "Event Timeline"],
      explanation: `User authenticated via /api/auth/login. Session created with 7-day expiry. All subsequent actions will be audited to the persistent AuditLog table.`,
    });

    return ok(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarColor: user.avatarColor,
        },
      },
      { session: { expiresAt: expiresAt.toISOString(), token } },
    );
  } catch (e) {
    console.error("[api/auth/login] error:", e);
    return err("INTERNAL", "Login failed", 500);
  }
}

export const dynamic = "force-dynamic";
