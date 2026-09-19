/**
 * SKILL SETU — Phase 11
 * POST /api/admin/seed
 *
 * Re-runs prisma/seed.ts. Always pre-clears all tables via raw SQL
 * (the seed script's `deleteMany` calls use pluralized accessor names
 * like `prisma.institutions` that don't exist — the default Prisma
 * accessors are singular camelCase — so the catch-all `try/catch`
 * silently skips them and re-seeding on a populated DB would fail
 * with unique-constraint violations on `institutions.code`).
 *
 * With `?reset=1` the same pre-clear happens (kept for parity with
 * the spec).
 *
 * RBAC: ADMIN or INSTITUTION (admin@iitm.ac.in is role=INSTITUTION,
 * no Role.ADMIN user is seeded — see prisma/seed.ts).
 *
 * Implementation: pre-clear via raw SQL → spawn `bun run prisma/seed.ts`.
 */
import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { resolve } from "path";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, err, requireAuth } from "@/lib/api-response";
import { appendAudit } from "@/lib/audit";
import { recordEvent } from "@/lib/event-log";

interface RouteContext {
  params: Promise<Record<string, never>>;
}

const TABLES_IN_DEPENDENCY_ORDER = [
  "feedback",
  "applications",
  "team_build_requests",
  "opportunities",
  "curriculum_alignment",
  "placement_records",
  "branch_analytics",
  "skill_evidence",
  "target_role_skills",
  "skills",
  "student_profiles",
  "industry_profiles",
  "academia_profiles",
  "institutions",
  "sessions",
  "users",
];

function canReseed(role: Role): boolean {
  return role === Role.ADMIN || role === Role.INSTITUTION;
}

async function clearAllTables(): Promise<void> {
  // Disable FK checks so we can DELETE in any order; SQLite enforces
  // FKs at the row level so we still need the dependency-aware order
  // above for safety.
  await db.$executeRawUnsafe("PRAGMA foreign_keys = OFF;");
  for (const t of TABLES_IN_DEPENDENCY_ORDER) {
    try {
      // Table names are static literals (not user input) — safe to
      // interpolate into raw SQL.
      await db.$executeRawUnsafe(`DELETE FROM "${t}";`);
    } catch (e) {
      console.warn(`[admin/seed] clear "${t}" skipped:`, e);
    }
  }
  await db.$executeRawUnsafe("PRAGMA foreign_keys = ON;");
}

function runSeed(): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((res) => {
    const seedPath = resolve(process.cwd(), "prisma/seed.ts");
    const proc = spawn("bun", ["run", seedPath], {
      cwd: process.cwd(),
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => res({ stdout, stderr, code }));
  });
}

export async function POST(req: Request, _ctx: RouteContext) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    if (!canReseed(auth.role)) {
      return err("FORBIDDEN", "Admin role required", 403);
    }

    const url = new URL(req.url);
    const reset = url.searchParams.get("reset") === "1";

    appendAudit({
      actorUserId: auth.user.id,
      action: reset ? "RESEED" : "SEED",
      entityType: "System",
      entityId: null,
    });
    recordEvent({
      eventType: "ADMIN",
      actorType: "ADMIN",
      action: reset ? "reseed" : "seed",
      affectedEntity: "System",
      explanation: `${auth.user.name} cleared all tables and re-ran the seed script${reset ? " with reset=1" : ""}.`,
    });

    await clearAllTables();
    const result = await runSeed();

    return ok(
      {
        ok: result.code === 0,
        exitCode: result.code,
        stdout: result.stdout.split("\n").slice(-50).join("\n"),
        stderr: result.stderr.split("\n").slice(-50).join("\n"),
      },
      { reset },
    );
  } catch (e) {
    console.error("[api/admin/seed POST] error:", e);
    return err("INTERNAL", "Seed failed", 500);
  }
}

export const dynamic = "force-dynamic";
