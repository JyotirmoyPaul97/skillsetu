/**
 * SKILL SETU — Phase 11 PROTOTYPE audit log.
 *
 * Production would persist AuditLog rows to a real DB table:
 *   AuditLog(id, actorUserId, action, entityType, entityId, createdAt)
 *
 * Phase 11 PROTOTYPE: in-memory Zustand store with localStorage
 * persistence on the client (no-op on server). API routes call
 * `appendAudit(...)` to record mutating actions; the frontend can
 * read `useAuditStore` to surface the audit trail.
 *
 * Known limitation (prototype only):
 *   Server-side appends live in the Node process memory (lost on hot
 *   reload in dev). Client-side appends persist to localStorage and
 *   are visible across reloads. Production will move this to a real
 *   Prisma `AuditLog` table (see worklog P11-BACKEND).
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuditEntry {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
}

interface AuditState {
  entries: AuditEntry[];
  append: (e: Omit<AuditEntry, "id" | "createdAt">) => void;
  clear: () => void;
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      entries: [],
      append: (e) =>
        set((s) => ({
          entries: [
            ...s.entries,
            { ...e, id: makeId(), createdAt: new Date().toISOString() },
          ].slice(-500), // cap to last 500 entries
        })),
      clear: () => set({ entries: [] }),
    }),
    {
      name: "skillsetu-audit",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return window.localStorage;
      }),
    },
  ),
);

/**
 * Server-safe append. Call from API routes after every mutating action.
 * On the server this updates the in-memory store only (no localStorage).
 */
export function appendAudit(entry: Omit<AuditEntry, "id" | "createdAt">) {
  try {
    useAuditStore.getState().append(entry);
  } catch (e) {
    console.error("[audit] appendAudit error:", e);
  }
}

export function getAuditLog(): AuditEntry[] {
  return useAuditStore.getState().entries;
}
