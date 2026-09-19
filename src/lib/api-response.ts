/**
 * SKILL SETU — Phase 11 API Response Standard (spec §10).
 *
 * Canonical envelope:
 *   success:  { data: T, meta?: {...} }
 *   error:    { error: { code, message, details? } }
 *
 * `requireAuth()` returns either the authenticated session (with user + role)
 * or a ready-to-send 401 NextResponse that the caller can return directly:
 *
 *   const auth = await requireAuth();
 *   if (auth instanceof NextResponse) return auth;
 *   // use auth.user / auth.role below
 *
 * For role-gated routes prefer `requireRole(...)` from `@/lib/auth` which
 * returns 401 (unauthenticated) or 403 (insufficient role).
 */
import { NextResponse } from "next/server";
import { getSession, type SessionInfo } from "@/lib/auth";

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) });
}

export function err(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status },
  );
}

export async function requireAuth(): Promise<SessionInfo | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 },
    );
  }
  return session;
}
