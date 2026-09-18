/**
 * SKILL SETU — Phase 4 Career store (master spec §24, §25, §26, §29, §47, §48).
 *
 * Holds opportunities, applications, saved opportunities, and career notifications.
 * Persisted to localStorage (PROTOTYPE persistence). Reads the student + role from
 * the Phase 3 intelligence store (single source of truth — no duplicate student model).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_OPPORTUNITIES } from "./opportunity-demo-data";
import type { Opportunity, Application, ApplicationStatus, CareerNotification } from "./opportunity-model";
import { useIntelligence } from "@/lib/intelligence";

// S042 demo CGPA (the Phase 3 Student model doesn't carry CGPA; the career module owns it).
const DEMO_CGPA = 8.4;

interface CareerState {
  opportunities: Opportunity[];
  applications: Application[];
  savedIds: string[];
  notifications: CareerNotification[];
  cgpa: number;

  // actions
  apply: (opportunityId: string, coverLetter?: string) => { ok: boolean; error?: string; applicationId?: string };
  withdraw: (applicationId: string) => void;
  save: (opportunityId: string) => void;
  unsave: (opportunityId: string) => void;
  toggleSave: (opportunityId: string) => void;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => void;
  addOpportunity: (o: Opportunity) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetCareer: () => void;
}

function pushNotification(list: CareerNotification[], n: Omit<CareerNotification, "id" | "time" | "read">): CareerNotification[] {
  const note: CareerNotification = { ...n, id: "cn-" + Math.random().toString(36).slice(2, 9), time: new Date().toISOString(), read: false };
  return [note, ...list];
}

export const useCareerStore = create<CareerState>()(
  persist(
    (set, get) => ({
      opportunities: DEMO_OPPORTUNITIES,
      applications: [],
      savedIds: [],
      notifications: [],
      cgpa: DEMO_CGPA,

      apply: (opportunityId, coverLetter) => {
        const studentId = useIntelligence.getState().student.studentId;
        // prevent duplicates (master spec TEST 7)
        const existing = get().applications.find((a) => a.opportunityId === opportunityId && a.studentId === studentId && a.status !== "WITHDRAWN");
        if (existing) return { ok: false, error: "already_applied" };

        const now = new Date().toISOString();
        const app: Application = {
          id: "app-" + Math.random().toString(36).slice(2, 9),
          studentId, opportunityId,
          status: "APPLIED",
          appliedAt: now, updatedAt: now,
          coverLetter,
        };
        const opp = get().opportunities.find((o) => o.id === opportunityId);
        const notifications = pushNotification(get().notifications, {
          studentId, type: "Application Submitted",
          title: `Applied to ${opp?.title ?? "opportunity"}`,
          detail: `Your application to ${opp?.company ?? ""} was submitted.`,
          opportunityId,
        });
        set({ applications: [app, ...get().applications], notifications });
        return { ok: true, applicationId: app.id };
      },

      withdraw: (applicationId) => {
        const now = new Date().toISOString();
        const applications = get().applications.map((a) =>
          a.id === applicationId ? { ...a, status: "WITHDRAWN" as ApplicationStatus, updatedAt: now } : a,
        );
        const app = get().applications.find((a) => a.id === applicationId);
        const opp = app ? get().opportunities.find((o) => o.id === app.opportunityId) : undefined;
        const notifications = app ? pushNotification(get().notifications, {
          studentId: app.studentId, type: "Application Status Changed",
          title: `Withdrawn from ${opp?.title ?? "opportunity"}`,
          detail: "You withdrew your application.",
          opportunityId: app.opportunityId,
        }) : get().notifications;
        set({ applications, notifications });
      },

      save: (opportunityId) => {
        if (get().savedIds.includes(opportunityId)) return;
        set({ savedIds: [...get().savedIds, opportunityId] });
      },
      unsave: (opportunityId) => {
        set({ savedIds: get().savedIds.filter((id) => id !== opportunityId) });
      },
      toggleSave: (opportunityId) => {
        const saved = get().savedIds.includes(opportunityId);
        set({ savedIds: saved ? get().savedIds.filter((id) => id !== opportunityId) : [...get().savedIds, opportunityId] });
      },

      updateApplicationStatus: (applicationId, status) => {
        const now = new Date().toISOString();
        const applications = get().applications.map((a) =>
          a.id === applicationId ? { ...a, status, updatedAt: now } : a,
        );
        const app = get().applications.find((a) => a.id === applicationId);
        const opp = app ? get().opportunities.find((o) => o.id === app.opportunityId) : undefined;
        const notifications = app ? pushNotification(get().notifications, {
          studentId: app.studentId, type: "Application Status Changed",
          title: `${opp?.title ?? "Application"} → ${status.replace("_", " ")}`,
          detail: `Your application status changed to ${status.replace("_", " ")}.`,
          opportunityId: app.opportunityId,
        }) : get().notifications;
        set({ applications, notifications });
      },

      addOpportunity: (o) => set({ opportunities: [o, ...get().opportunities] }),

      markNotificationRead: (id) =>
        set({ notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }),
      markAllNotificationsRead: () =>
        set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),

      resetCareer: () =>
        set({ opportunities: DEMO_OPPORTUNITIES, applications: [], savedIds: [], notifications: [], cgpa: DEMO_CGPA }),
    }),
    {
      name: "skillsetu-career-v1",
      partialize: (s) => ({ applications: s.applications, savedIds: s.savedIds, notifications: s.notifications, cgpa: s.cgpa }),
    },
  ),
);
