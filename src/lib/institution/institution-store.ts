/**
 * SKILL SETU — Phase 7 Institution store (master spec §23, §49, §66).
 *
 * Holds institution-specific state: interventions, alerts, notifications, filters.
 * Persisted to localStorage (PROTOTYPE). Aggregates from Phase 3+4+5+6 shared stores.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Intervention, InterventionStatus, InstitutionAlert, InstitutionNotification, InstitutionUser, Priority, InterventionType } from "./institution-model";

const DEMO_USER: InstitutionUser = {
  userId: "IU-INST-001",
  name: "Dr. Rajesh Kumar",
  role: "Institution Admin",
  institution: "Indian Institute of Technology, Madras",
  email: "admin@iitm.ac.in",
  avatarColor: "#6D28D9",
};

const DEMO_ALERTS: InstitutionAlert[] = [
  { id: "ia-1", type: "Critical Skill Gap", title: "Machine Learning gap in AI & DS", detail: "Average competency 43/100. Industry demand High. 4 active opportunities require ML.", priority: "Critical", skillId: "machine-learning", department: "AI & Data Science", time: "2026-09-17T10:00:00", read: false },
  { id: "ia-2", type: "Low Practical Exposure", title: "Cloud Platforms practical evidence limited", detail: "Curriculum coverage Introductory. Student practical evidence None.", priority: "High", skillId: "cloud-platforms", department: "Computer Science", time: "2026-09-16T14:00:00", read: false },
  { id: "ia-3", type: "Emerging Industry Skill", title: "Deep Learning demand increasing", detail: "2 active opportunities require Deep Learning skills.", priority: "Medium", skillId: "deep-learning", department: "AI & Data Science", time: "2026-09-15T09:00:00", read: true },
];

const DEMO_NOTIFICATIONS: InstitutionNotification[] = [
  { id: "in-1", type: "Critical Skill Gap", title: "ML gap detected in AI & DS cohort", detail: "Average competency 43. 4 students affected.", time: "2026-09-17T10:00:00", read: false },
  { id: "in-2", type: "New Industry Demand", title: "Nova Analytics posted Data Science Intern", detail: "Requires Python, SQL, ML, Statistics.", time: "2026-09-16T12:00:00", read: false },
  { id: "in-3", type: "Intervention Recommendation", title: "Recommended: Industry ML Workshop", detail: "Addresses critical ML gap in AI & DS.", time: "2026-09-15T14:00:00", read: true },
];

interface InstitutionState {
  user: typeof DEMO_USER;
  interventions: Intervention[];
  alerts: InstitutionAlert[];
  notifications: InstitutionNotification[];
  filters: { department: string; year: string; role: string; dateRange: string };

  createIntervention: (i: Omit<Intervention, "id" | "createdAt" | "status">) => string;
  updateInterventionStatus: (id: string, status: InterventionStatus) => void;
  setFilter: (key: string, value: string) => void;
  markAlertRead: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetInstitution: () => void;
}

function uid(p: string) { return p + "-" + Math.random().toString(36).slice(2, 9); }
function now() { return new Date().toISOString(); }

export const useInstitutionStore = create<InstitutionState>()(
  persist(
    (set, get) => ({
      user: DEMO_USER,
      interventions: [],
      alerts: DEMO_ALERTS,
      notifications: DEMO_NOTIFICATIONS,
      filters: { department: "", year: "", role: "", dateRange: "all" },

      createIntervention: (i) => {
        const id = uid("int");
        const intervention: Intervention = { ...i, id, createdAt: now(), status: "Recommended" };
        const notifications = [{ id: uid("in"), type: "Intervention Recommendation" as const, title: `Intervention created: ${i.type}`, detail: `${i.skillName} — ${i.department} cohort. Priority: ${i.priority}.`, time: now(), read: false }, ...get().notifications];
        set({ interventions: [intervention, ...get().interventions], notifications });
        return id;
      },

      updateInterventionStatus: (id, status) => {
        const notifications = [{ id: uid("in"), type: "Intervention Recommendation" as const, title: `Intervention ${status}`, detail: `An intervention moved to ${status}.`, time: now(), read: false }, ...get().notifications];
        set({ interventions: get().interventions.map((i) => i.id === id ? { ...i, status } : i), notifications });
      },

      setFilter: (key, value) => set({ filters: { ...get().filters, [key]: value } }),

      markAlertRead: (id) => set({ alerts: get().alerts.map((a) => a.id === id ? { ...a, read: true } : a) }),
      markNotificationRead: (id) => set({ notifications: get().notifications.map((n) => n.id === id ? { ...n, read: true } : n) }),
      markAllNotificationsRead: () => set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),

      resetInstitution: () => set({ interventions: [], alerts: DEMO_ALERTS, notifications: DEMO_NOTIFICATIONS, filters: { department: "", year: "", role: "", dateRange: "all" } }),
    }),
    {
      name: "skillsetu-institution-v1",
      partialize: (s) => ({ interventions: s.interventions, filters: s.filters }),
    },
  ),
);

export { DEMO_USER };
