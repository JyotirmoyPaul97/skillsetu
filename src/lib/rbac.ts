/**
 * SKILL SETU — Phase 11 RBAC helpers.
 *
 * These helpers compose with `requireAuth()` / `requireRole()` from
 * `@/lib/auth`. They answer ONE specific question each ("can THIS user
 * access THIS thing?"), keeping route handlers free of inline policy.
 *
 * Note on async:
 *   canIndustryAccess(currentUser, opportunityId?) is async because
 *   ownership of an opportunity requires a DB lookup. All other helpers
 *   are pure boolean predicates.
 */
import { Role, type User } from "@prisma/client";
import { db } from "@/lib/db";

export { Role } from "@prisma/client";

type AnyUser = Pick<User, "id" | "role">;

/**
 * Students can only access THEIR OWN data. Non-students (industry,
 * academia, institution, admin) have broader access governed by other
 * checks at the route layer.
 */
export function canStudentAccess(
  currentUser: AnyUser,
  targetStudentId: string,
): boolean {
  if (currentUser.role === Role.STUDENT) {
    return currentUser.id === targetStudentId;
  }
  // Non-student roles can view student records; finer filters happen
  // at the route layer (e.g. industry sees only candidates that applied
  // to their opportunities).
  return true;
}

/**
 * Industry users can access industry features. When `opportunityId` is
 * provided, they must OWN that opportunity. ADMIN bypasses ownership.
 */
export async function canIndustryAccess(
  currentUser: AnyUser,
  opportunityId?: string,
): Promise<boolean> {
  if (currentUser.role === Role.ADMIN) return true;
  if (currentUser.role !== Role.INDUSTRY) return false;
  if (!opportunityId) return true;
  const opp = await db.opportunity.findUnique({
    where: { id: opportunityId },
    select: { industryId: true },
  });
  return opp?.industryId === currentUser.id;
}

/** Academia users (faculty) can access academia-facing endpoints. */
export function canAcademiaAccess(currentUser: AnyUser): boolean {
  return (
    currentUser.role === Role.ACADEMIA || currentUser.role === Role.ADMIN
  );
}

/** Institution admins can access institution-facing endpoints. */
export function canInstitutionAccess(currentUser: AnyUser): boolean {
  return (
    currentUser.role === Role.INSTITUTION || currentUser.role === Role.ADMIN
  );
}

/** System admins can access admin-only endpoints. */
export function canAdminAccess(currentUser: AnyUser): boolean {
  return currentUser.role === Role.ADMIN;
}

/**
 * canMutateEvidence — who can create or verify evidence.
 *   - Students create their own evidence (verified=false by default).
 *   - Industry / Academia create evidence on behalf of any student
 *     (industry-issued evidence is auto-verified=true).
 *   - Industry / Academia / Admin can verify any evidence.
 */
export function canCreateEvidenceFor(
  currentUser: AnyUser,
  targetStudentId: string,
): boolean {
  switch (currentUser.role) {
    case Role.STUDENT:
      return currentUser.id === targetStudentId;
    case Role.INDUSTRY:
    case Role.ACADEMIA:
    case Role.ADMIN:
      return true;
    default:
      return false;
  }
}

export function canVerifyEvidence(currentUser: AnyUser): boolean {
  return (
    currentUser.role === Role.INDUSTRY ||
    currentUser.role === Role.ACADEMIA ||
    currentUser.role === Role.ADMIN
  );
}

export function canGiveFeedback(currentUser: AnyUser): boolean {
  return (
    currentUser.role === Role.INDUSTRY ||
    currentUser.role === Role.ACADEMIA ||
    currentUser.role === Role.ADMIN
  );
}
