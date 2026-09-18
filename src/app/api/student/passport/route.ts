import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { getPassport } from "@/lib/skill-engine";

export async function GET() {
  const auth = await requireRole("STUDENT");
  if (auth.response) return auth.response;
  const passport = await getPassport(auth.user.id);
  if (!passport) return NextResponse.json({ error: "no_profile" }, { status: 404 });
  return NextResponse.json(passport);
}
