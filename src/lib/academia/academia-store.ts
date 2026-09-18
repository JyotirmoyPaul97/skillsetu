/**
 * SKILL SETU — Phase 6 Academia store (master spec §22, §30, §46, §53).
 *
 * Holds academic-specific state: faculty applications, collaborations,
 * mentorship sessions, notifications. Persisted to localStorage (PROTOTYPE).
 * Reads student/opportunity/industry data from Phase 3/4/5 shared stores.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FacultyApplication, Collaboration, MentorshipSession, AcademiaNotification, SessionStatus } from "./academia-model";
import { DEMO_COLLABORATIONS, DEMO_MENTORSHIP_SESSIONS, DEMO_ACADEMIA_NOTIFICATIONS } from "./academia-demo-data";
import { useIntelligence } from "@/lib/intelligence";

interface AcademiaState {
  facultyApplications: FacultyApplication[];
  collaborations: Collaboration[];
  mentorshipSessions: MentorshipSession[];
  notifications: AcademiaNotification[];

  applyToFacultyOpp: (opportunityId: string, facultyId: string) => { ok: boolean; error?: string };
  withdrawFacultyApp: (applicationId: string) => void;
  createCollaboration: (c: Omit<Collaboration, "id" | "createdAt" | "status">) => string;
  updateCollaborationStatus: (id: string, status: Collaboration["status"]) => void;
  acceptMentorship: (id: string) => void;
  completeMentorship: (id: string) => void;
  cancelMentorship: (id: string) => void;
  submitFacultyFeedback: (studentId: string, studentName: string, skillId: string, skillName: string, score: number, topic: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetAcademia: () => void;
}

function uid(p: string) { return p + "-" + Math.random().toString(36).slice(2, 9); }
function now() { return new Date().toISOString(); }

function pushNotif(list: AcademiaNotification[], n: Omit<AcademiaNotification, "id" | "time" | "read">): AcademiaNotification[] {
  return [{ ...n, id: uid("an"), time: now(), read: false }, ...list];
}

export const useAcademiaStore = create<AcademiaState>()(
  persist(
    (set, get) => ({
      facultyApplications: [],
      collaborations: DEMO_COLLABORATIONS,
      mentorshipSessions: DEMO_MENTORSHIP_SESSIONS as MentorshipSession[],
      notifications: DEMO_ACADEMIA_NOTIFICATIONS as AcademiaNotification[],

      applyToFacultyOpp: (opportunityId, facultyId) => {
        const existing = get().facultyApplications.find((a) => a.opportunityId === opportunityId && a.facultyId === facultyId);
        if (existing) return { ok: false, error: "already_applied" };
        const app: FacultyApplication = { id: uid("fa"), facultyId, opportunityId, status: "Applied", appliedAt: now() };
        const notifications = pushNotif(get().notifications, { type: "Faculty Opportunity", title: "Faculty application submitted", detail: "Your application has been submitted." });
        set({ facultyApplications: [app, ...get().facultyApplications], notifications });
        return { ok: true };
      },

      withdrawFacultyApp: (applicationId) => set({ facultyApplications: get().facultyApplications.map((a) => a.id === applicationId ? { ...a, status: "Rejected" as any } : a) }),

      createCollaboration: (c) => {
        const id = uid("col");
        const collab: Collaboration = { ...c, id, createdAt: now(), status: "Proposed" };
        const notifications = pushNotif(get().notifications, { type: "Collaboration Update", title: `Collaboration request: ${c.title}`, detail: `${c.type} request to ${c.organization} submitted.` });
        set({ collaborations: [collab, ...get().collaborations], notifications });
        return id;
      },

      updateCollaborationStatus: (id, status) => {
        const notifications = pushNotif(get().notifications, { type: "Collaboration Update", title: `Collaboration ${status}`, detail: `A collaboration moved to ${status}.` });
        set({ collaborations: get().collaborations.map((c) => c.id === id ? { ...c, status } : c), notifications });
      },

      acceptMentorship: (id) => {
        const sessions = get().mentorshipSessions.map((m) => m.id === id ? { ...m, status: "Accepted" as SessionStatus } : m);
        const notifications = pushNotif(get().notifications, { type: "Mentor Request", title: "Mentorship accepted", detail: "A mentorship session has been accepted." });
        set({ mentorshipSessions: sessions, notifications });
      },

      completeMentorship: (id) => {
        const sessions = get().mentorshipSessions.map((m) => m.id === id ? { ...m, status: "Completed" as SessionStatus } : m);
        set({ mentorshipSessions: sessions });
      },

      cancelMentorship: (id) => set({ mentorshipSessions: get().mentorshipSessions.map((m) => m.id === id ? { ...m, status: "Cancelled" as SessionStatus } : m) }),

      submitFacultyFeedback: (studentId, studentName, skillId, skillName, score, topic) => {
        // FACULTY FEEDBACK → EVIDENCE (§31, §58, §70): creates evidence for S042
        if (studentId === "S042") {
          const intel = useIntelligence.getState();
          intel.addEvidence({
            skillId, skillName,
            sourceType: "FacultyFeedback" as any,
            sourceTitle: `Faculty Feedback — ${topic}`,
            score,
            status: "Evaluated",
            verificationStatus: "Pending",
            description: `Faculty feedback from ${DEMO_FACULTY_NAME}: score ${score} for ${skillName}. Topic: ${topic}.`,
          });
        }
        const notifications = pushNotif(get().notifications, { type: "Feedback Request", title: `Faculty feedback submitted for ${studentName}`, detail: `${skillName}: ${score}. Evidence record created.` });
        set({ notifications });
      },

      markNotificationRead: (id) => set({ notifications: get().notifications.map((n) => n.id === id ? { ...n, read: true } : n) }),
      markAllNotificationsRead: () => set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),

      resetAcademia: () => set({ facultyApplications: [], collaborations: DEMO_COLLABORATIONS, mentorshipSessions: DEMO_MENTORSHIP_SESSIONS as MentorshipSession[], notifications: DEMO_ACADEMIA_NOTIFICATIONS as AcademiaNotification[] }),
    }),
    {
      name: "skillsetu-academia-v1",
      partialize: (s) => ({ facultyApplications: s.facultyApplications, collaborations: s.collaborations, mentorshipSessions: s.mentorshipSessions, notifications: s.notifications }),
    },
  ),
);

const DEMO_FACULTY_NAME = "Dr. Meena Krishnan";
