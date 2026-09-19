/**
 * SKILL SETU — Phase 11 Auth foundation.
 *
 * Password strategy:
 *   - New registrations → bcrypt (bcryptjs).
 *   - Legacy seeded users → sha256 hex digest (see prisma/seed.ts: `createHash("sha256")`).
 *   `verifyPassword` auto-detects the format and uses the matching algorithm.
 *
 * Sessions are stored in the Prisma `Session` table; the 32-byte token is
 * issued as an HTTP-only cookie named `skillsetu_session`.
 *
 * Decision (documented in worklog): support BOTH sha256 (legacy seed) AND
 * bcrypt (new registrations). Re-seeding would have invalidated existing
 * demo logins used by Phase 1-10 frontend.
 */
import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { Role, type User } from "@prisma/client";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "skillsetu_session";
const SESSION_TTL_DAYS = 7;
const BCRYPT_ROUNDS = 10;

export type SessionUser = Pick<
  User,
  "id" | "name" | "email" | "role" | "avatarColor"
>;

export interface SessionInfo {
  user: SessionUser;
  role: Role;
}

// ─── Password helpers ───────────────────────────────────────────

export async function hashPassword(pw: string): Promise<string> {
  return hash(pw, BCRYPT_ROUNDS);
}

function sha256(pw: string): string {
  return createHash("sha256").update(pw).digest("hex");
}

function isBcryptHash(h: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(h);
}

export async function verifyPassword(
  pw: string,
  storedHash: string,
): Promise<boolean> {
  try {
    if (isBcryptHash(storedHash)) {
      return await compare(pw, storedHash);
    }
    // Legacy seeded sha256 digest
    return sha256(pw) === storedHash;
  } catch (e) {
    console.error("[auth] verifyPassword error:", e);
    return false;
  }
}

// ─── Session helpers ────────────────────────────────────────────

function randomToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(
  userId: string,
  role: Role,
): Promise<{ token: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400000);
  const token = randomToken();
  await db.session.create({
    data: { token, userId, expiresAt },
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return { token, expiresAt };
}

export async function getSession(): Promise<SessionInfo | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session) return null;
    if (session.expiresAt.getTime() < Date.now()) {
      await db.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    const { id, name, email, role, avatarColor } = session.user;
    return {
      user: { id, name, email, role, avatarColor },
      role,
    };
  } catch (e) {
    console.error("[auth] getSession error:", e);
    return null;
  }
}

export async function clearSession(token: string): Promise<void> {
  try {
    await db.session.deleteMany({ where: { token } });
  } catch (e) {
    console.error("[auth] clearSession error:", e);
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * requireRole — higher-order helper for API routes that need RBAC.
 * Returns either the session (with user + role) or a ready-to-send
 * 401/403 NextResponse that the caller can return directly.
 *
 *   const auth = await requireRole([Role.INDUSTRY]);
 *   if (auth instanceof NextResponse) return auth;
 *   // use auth.user / auth.role
 */
export async function requireRole(
  roles: Role[],
): Promise<SessionInfo | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 },
    );
  }
  if (!roles.includes(session.role)) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Insufficient role for this action",
          details: { required: roles, current: session.role },
        },
      },
      { status: 403 },
    );
  }
  return session;
}
