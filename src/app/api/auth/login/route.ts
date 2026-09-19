/**
 * SKILL SETU — Phase 11
 * POST /api/auth/login
 * Body: { email, password } → sets session cookie, returns user.
 */
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api-response";
import { verifyPassword, createSession } from "@/lib/auth";
import { appendAudit } from "@/lib/audit";
import { recordEvent } from "@/lib/event-log";

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
      return err("BAD_CREDENTIALS", "Invalid email or password", 401);
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return err("BAD_CREDENTIALS", "Invalid email or password", 401);
    }

    const { token, expiresAt } = await createSession(user.id, user.role);

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
