/**
 * SKILL SETU — Phase 11 PROTOTYPE event log (demo event timeline).
 *
 * Production would persist EventLog rows to a real DB table:
 *   EventLog(id, eventType, actorType, action, affectedEntity, explanation, createdAt)
 *
 * Phase 11 PROTOTYPE: in-memory Zustand store with localStorage
 * persistence on the client (no-op on server). API routes call
 * `recordEvent(...)` to log cross-portal actions; the frontend can
 * read `useEventLog` to surface the demo event timeline (§19
 * explainability affordance).
 *
 * Known limitation (prototype only):
 *   Same as audit.ts — server-side appends live in Node process memory;
 *   client-side appends persist to localStorage. Production will move
 *   this to a real Prisma `EventLog` table (see worklog P11-BACKEND).
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type EventType =
  | "AUTH"
  | "EVIDENCE"
  | "FEEDBACK"
  | "OPPORTUNITY"
  | "VERIFICATION"
  | "ADMIN";

export type ActorType =
  | "STUDENT"
  | "INDUSTRY"
  | "ACADEMIA"
  | "INSTITUTION"
  | "ADMIN"
  | "SYSTEM";

export interface EventEntry {
  id: string;
  eventType: EventType;
  actorType: ActorType;
  action: string;
  affectedEntity: string;
  explanation: string;
  createdAt: string;
}

interface EventState {
  events: EventEntry[];
  record: (e: Omit<EventEntry, "id" | "createdAt">) => void;
  clear: () => void;
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useEventLog = create<EventState>()(
  persist(
    (set) => ({
      events: [],
      record: (e) =>
        set((s) => ({
          events: [
            ...s.events,
            { ...e, id: makeId(), createdAt: new Date().toISOString() },
          ].slice(-500), // cap to last 500 events
        })),
      clear: () => set({ events: [] }),
    }),
    {
      name: "skillsetu-event-log",
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

/** Server-safe record. Call from API routes for cross-portal events. */
export function recordEvent(event: Omit<EventEntry, "id" | "createdAt">) {
  try {
    useEventLog.getState().record(event);
  } catch (e) {
    console.error("[event-log] recordEvent error:", e);
  }
}

export function getEventLog(): EventEntry[] {
  return useEventLog.getState().events;
}
