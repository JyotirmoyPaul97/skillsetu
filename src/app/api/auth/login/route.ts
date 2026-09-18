import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/session";
import type { LoginPayload } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: LoginPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || user.passwordHash !== hashPassword(password)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarColor: user.avatarColor,
  });
}
