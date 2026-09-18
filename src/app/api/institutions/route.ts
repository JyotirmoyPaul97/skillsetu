import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const institutions = await db.institution.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(institutions);
}
