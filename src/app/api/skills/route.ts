import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const skills = await db.skill.findMany({ orderBy: { category: "asc" } });
  return NextResponse.json(skills);
}
