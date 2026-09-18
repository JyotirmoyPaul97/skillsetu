/**
 * SKILL SETU — Phase 5 Industry store (master spec §26, §30, §32, §36, §55, §70).
 *
 * Holds industry-specific state: demand configs, feedback, challenges, invitations,
 * audit log, notifications, shortlist. Persisted to localStorage (PROTOTYPE).
 *
 * FEEDBACK → EVIDENCE: when feedback is submitted for S042 (the active student in the
 * Phase 3 intelligence store), a real EvidenceRecord is created via addEvidence(),
 * demonstrating the Industry Demand → Feedback → Evidence → Intelligence loop (§70).
 *
 * Opportunities + Applications are read from the Phase 4 career store (shared, no duplicate).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DemandConfig, IndustryFeedback, Challenge, Invitation, AuditLogEntry,
  IndustryNotification, IndustryRole,
} from "./industry-model";
import { DEMO_INDUSTRY_USER } from "./candidates";
import { useIntelligence } from "@/lib/intelligence";

interface IndustryState {
  user: typeof DEMO_INDUSTRY_USER;
  role: IndustryRole;
  demandConfigs: DemandConfig[];
  feedback: IndustryFeedback[];
  challenges: Challenge[];
  invitations: Invitation[];
  shortlistedIds: string[];
  auditLog: AuditLogEntry[];
  notifications: IndustryNotification[];

  setRole: (role: IndustryRole) => void;
  createDemand: (d: Omit<DemandConfig, "id" | "createdAt" | "updatedAt">) => string;
  updateDemand: (id: string, updates: Partial<DemandConfig>) => void;
  shortlist: (studentId: string, studentName: string, opportunityId?: string) => void;
  invite: (i: Omit<Invitation, "id" | "createdAt" | "status">) => void;
  submitFeedback: (f: Omit<IndustryFeedback, "id" | "createdAt" | "updatedAt" | "status">) => string;
  createChallenge: (c: Omit<Challenge, "id" | "createdAt" | "status">) => string;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetIndustry: () => void;
}

function uid(prefix: string) { return prefix + "-" + Math.random().toString(36).slice(2, 9); }
function now() { return new Date().toISOString(); }

function pushNotif(list: IndustryNotification[], n: Omit<IndustryNotification, "id" | "time" | "read">): IndustryNotification[] {
  return [{ ...n, id: uid("in"), time: now(), read: false }, ...list];
}

export const useIndustryStore = create<IndustryState>()(
  persist(
    (set, get) => ({
      user: DEMO_INDUSTRY_USER,
      role: "Recruiter",
      demandConfigs: [
        {
          id: "dc-1", roleId: "data-scientist", roleName: "Data Scientist",
          skills: [
            { skillId: "python", skillName: "Python", importance: "High", requiredLevel: 70 },
            { skillId: "sql", skillName: "SQL", importance: "High", requiredLevel: 60 },
            { skillId: "machine-learning", skillName: "Machine Learning", importance: "High", requiredLevel: 70 },
            { skillId: "statistics", skillName: "Statistics", importance: "Medium", requiredLevel: 60 },
            { skillId: "problem-solving", skillName: "Problem Solving", importance: "Medium", requiredLevel: 65 },
          ],
          opportunityType: "INTERNSHIP",
          eligibility: { yearMin: 2, cgpaMin: 7.0, requiredRoleIds: ["data-scientist"] },
          createdAt: "2026-09-10T10:00:00", updatedAt: "2026-09-10T10:00:00",
        },
      ],
      feedback: [],
      challenges: [
        {
          id: "ch-1", title: "Nova Analytics Data Challenge", description: "Build a predictive model from real anonymised business data.",
          domain: "AI/ML", objective: "Predict customer churn", expectedOutcome: "A working model + presentation",
          requiredSkills: [{ skillId: "python", skillName: "Python", requiredLevel: 60 }, { skillId: "machine-learning", skillName: "Machine Learning", requiredLevel: 50 }],
          eligibility: { yearMin: 2 }, mode: "Online",
          startDate: "2026-10-01", endDate: "2026-10-15", teamSize: "3-4",
          evaluationCriteria: ["Model accuracy", "Presentation clarity", "Code quality"],
          status: "Published", createdAt: "2026-09-05T10:00:00",
        },
      ],
      invitations: [],
      shortlistedIds: [],
      auditLog: [
        { id: "al-1", actor: "Meera Krishnan", action: "Created demand config", entity: "Data Scientist", timestamp: "2026-09-10T10:00:00" },
      ],
      notifications: [
        { id: "in-1", type: "New Applicant", title: "S042 applied to Data Science Intern", detail: "Aarav Sharma applied — 84% match.", studentId: "S042", opportunityId: "opp-ds-intern", time: "2026-09-17T10:00:00", read: false },
        { id: "in-2", type: "Candidate Match", title: "New candidate match: S051", detail: "Priya Nair matches your ML Engineer requirement — 87%.", studentId: "S051", time: "2026-09-16T14:00:00", read: false },
        { id: "in-3", type: "Opportunity Deadline", title: "ML Engineering Intern closing soon", detail: "5 days remaining.", opportunityId: "opp-ml-intern", time: "2026-09-17T09:00:00", read: false },
      ],

      setRole: (role) => set({ role }),

      createDemand: (d) => {
        const id = uid("dc");
        const config: DemandConfig = { ...d, id, createdAt: now(), updatedAt: now() };
        const auditLog = [{ id: uid("al"), actor: get().user.name, action: "Created demand config", entity: d.roleName, timestamp: now() }, ...get().auditLog];
        set({ demandConfigs: [config, ...get().demandConfigs], auditLog });
        return id;
      },
      updateDemand: (id, updates) => {
        set({
          demandConfigs: get().demandConfigs.map((d) => d.id === id ? { ...d, ...updates, updatedAt: now() } : d),
          auditLog: [{ id: uid("al"), actor: get().user.name, action: "Updated demand config", entity: id, timestamp: now() }, ...get().auditLog],
        });
      },

      shortlist: (studentId, studentName, opportunityId) => {
        if (get().shortlistedIds.includes(studentId)) return;
        const auditLog = [{ id: uid("al"), actor: get().user.name, action: "Shortlisted candidate", entity: studentName, timestamp: now() }, ...get().auditLog];
        const notifications = pushNotif(get().notifications, { type: "Candidate Match", title: `${studentName} shortlisted`, detail: "Candidate added to shortlist.", studentId });
        set({ shortlistedIds: [...get().shortlistedIds, studentId], auditLog, notifications });
      },

      invite: (i) => {
        const inv: Invitation = { ...i, id: uid("inv"), createdAt: now(), status: "Pending" };
        const auditLog = [{ id: uid("al"), actor: get().user.name, action: `Invited to ${i.type}`, entity: i.studentName, timestamp: now() }, ...get().auditLog];
        const notifications = pushNotif(get().notifications, { type: "Interview Response", title: `Invitation sent to ${i.studentName}`, detail: `${i.type} invitation pending.`, studentId: i.studentId });
        set({ invitations: [inv, ...get().invitations], auditLog, notifications });
      },

      submitFeedback: (f) => {
        const id = uid("fb");
        const feedback: IndustryFeedback = { ...f, id, createdAt: now(), updatedAt: now(), status: "Submitted" };
        const auditLog = [{ id: uid("al"), actor: get().user.name, action: "Submitted feedback", entity: f.studentName, timestamp: now() }, ...get().auditLog];
        const notifications = pushNotif(get().notifications, { type: "Feedback Reminder", title: `Feedback submitted for ${f.studentName}`, detail: "Industry feedback recorded — evidence event created." });

        // FEEDBACK → EVIDENCE (§32, §70): create an evidence record for each scored skill
        // in the Phase 3 intelligence store (for S042 — the active student).
        if (f.studentId === "S042") {
          const intel = useIntelligence.getState();
          for (const ss of f.skillScores) {
            intel.addEvidence({
              skillId: ss.skillId,
              skillName: ss.skillName,
              sourceType: "IndustryFeedback" as any,
              sourceTitle: `Industry Feedback — ${f.experience}`,
              score: ss.score,
              status: "Evaluated",
              verificationStatus: "Pending",
              description: `Industry feedback from ${get().user.organization}: ${f.technicalFeedback}. Score: ${ss.score}.`,
            });
          }
        }

        set({ feedback: [feedback, ...get().feedback], auditLog, notifications });
        return id;
      },

      createChallenge: (c) => {
        const id = uid("ch");
        const challenge: Challenge = { ...c, id, createdAt: now(), status: "Published" };
        const auditLog = [{ id: uid("al"), actor: get().user.name, action: "Created challenge", entity: c.title, timestamp: now() }, ...get().auditLog];
        set({ challenges: [challenge, ...get().challenges], auditLog });
        return id;
      },

      markNotificationRead: (id) => set({ notifications: get().notifications.map((n) => n.id === id ? { ...n, read: true } : n) }),
      markAllNotificationsRead: () => set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),

      resetIndustry: () => set({ demandConfigs: [], feedback: [], challenges: [], invitations: [], shortlistedIds: [], auditLog: [], notifications: [] }),
    }),
    {
      name: "skillsetu-industry-v1",
      partialize: (s) => ({ demandConfigs: s.demandConfigs, feedback: s.feedback, challenges: s.challenges, invitations: s.invitations, shortlistedIds: s.shortlistedIds, auditLog: s.auditLog, notifications: s.notifications, role: s.role }),
    },
  ),
);
