import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function POST(request: NextRequest) {
  const auth = await requireRole("INDUSTRY");
  if (auth.response) return auth.response;

  let body: { toStudentId?: string; opportunityId?: string | null; rating?: number; comment?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const { toStudentId, rating, comment } = body;
  if (!toStudentId || !rating) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const r = Math.max(1, Math.min(5, Number(rating)));
  const fb = await db.feedback.create({
    data: {
      fromUserId: auth.user.id,
      toStudentId,
      opportunityId: body.opportunityId || null,
      rating: r,
      comment: comment || "",
    },
  });
  return NextResponse.json({ id: fb.id });
}
