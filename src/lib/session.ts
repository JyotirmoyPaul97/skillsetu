import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "skillsetu_token";
const SESSION_TTL_DAYS = 7;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarColor: string;
}

/** Create a session for a user and set the httpOnly cookie. */
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400000);
  await db.session.create({ data: { token, userId, expiresAt } });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

/** Read the current session (if any) and return the hydrated user. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  const u = session.user;
  return { id: u.id, email: u.email, name: u.name, role: u.role, avatarColor: u.avatarColor };
}

/** Delete the current session + clear the cookie. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {});
  }
  store.delete(SESSION_COOKIE, { path: "/" });
}

/** Helper for API routes: return the current user or a 401 response. */
export async function requireUser(): Promise<
  { user: SessionUser; response: null } | { user: null; response: Response }
> {
  const user = await getSession();
  if (!user) {
    return {
      user: null,
      response: new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    };
  }
  return { user, response: null };
}

/** Require a specific role. */
export async function requireRole(...roles: Role[]) {
  const auth = await requireUser();
  if (auth.response) return { user: null as any, response: auth.response };
  if (!roles.includes(auth.user.role)) {
    return {
      user: null as any,
      response: new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
    };
  }
  return { user: auth.user, response: null };
}

/** Hash a password (sha256 — sufficient for a demo; not for production). */
export function hashPassword(pw: string): string {
  return createHash("sha256").update(pw).digest("hex");
}
