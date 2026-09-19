/**
 * SKILL SETU — Phase 11
 * POST /api/auth/register
 * Body: { email, password, name, role, ...profileFields }
 * Hashes password with bcrypt, creates User + role-specific profile,
 * auto-logs in. 400 on missing fields, 409 on email exists.
 */
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api-response";
import { hashPassword, createSession } from "@/lib/auth";
import { Role } from "@prisma/client";
import { appendAudit } from "@/lib/audit";
import { recordEvent } from "@/lib/event-log";

const VALID_ROLES = new Set([
  "STUDENT",
  "INDUSTRY",
  "ACADEMIA",
  "INSTITUTION",
]);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return err("MISSING_FIELDS", "Request body required", 400);
    }
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();
    const roleRaw = String(body.role ?? "").toUpperCase();
    if (!email || !password || !name || !roleRaw) {
      return err(
        "MISSING_FIELDS",
        "email, password, name, role are required",
        400,
      );
    }
    if (!VALID_ROLES.has(roleRaw)) {
      return err(
        "INVALID_ROLE",
        "role must be STUDENT, INDUSTRY, ACADEMIA or INSTITUTION",
        400,
      );
    }
    if (password.length < 6) {
      return err("WEAK_PASSWORD", "password must be ≥6 chars", 400);
    }
    const role = roleRaw as Role;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return err("EMAIL_EXISTS", "Email already registered", 409);
    }

    const passwordHash = await hashPassword(password);
    const avatarColor =
      typeof body.avatarColor === "string" && body.avatarColor
        ? body.avatarColor
        : "#0D9488";

    // Create user + role profile in a transaction so partial failures
    // don't leave orphans.
    const user = await db.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { email, passwordHash, name, role, avatarColor },
      });
      if (role === Role.STUDENT) {
        await tx.studentProfile.create({
          data: {
            userId: u.id,
            rollNo: String(body.rollNo ?? "PENDING"),
            branch: String(body.branch ?? "Undeclared"),
            year: Number(body.year ?? 1),
            cgpa: Number(body.cgpa ?? 0),
            bio: String(body.bio ?? ""),
            targetRole: String(body.targetRole ?? ""),
            institutionId: body.institutionId
              ? String(body.institutionId)
              : null,
          },
        });
      } else if (role === Role.INDUSTRY) {
        await tx.industryProfile.create({
          data: {
            userId: u.id,
            companyName: String(body.companyName ?? name),
            industry: String(body.industry ?? "Technology"),
            website: String(body.website ?? ""),
            location: String(body.location ?? ""),
            size: String(body.size ?? "51-200"),
          },
        });
      } else if (role === Role.ACADEMIA) {
        await tx.academiaProfile.create({
          data: {
            userId: u.id,
            department: String(body.department ?? "General"),
            designation: String(body.designation ?? "Faculty"),
            institutionId: body.institutionId
              ? String(body.institutionId)
              : null,
            researchAreas: String(body.researchAreas ?? ""),
          },
        });
      }
      // INSTITUTION role has no profile row by design (see schema comment).
      return u;
    });

    const { token, expiresAt } = await createSession(user.id, user.role);

    appendAudit({
      actorUserId: user.id,
      action: "REGISTER",
      entityType: "User",
      entityId: user.id,
    });
    recordEvent({
      eventType: "AUTH",
      actorType: role,
      action: "register",
      affectedEntity: `User:${user.id}`,
      explanation: `${email} registered as ${role}.`,
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
    console.error("[api/auth/register] error:", e);
    return err("INTERNAL", "Registration failed", 500);
  }
}

export const dynamic = "force-dynamic";
