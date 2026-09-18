"use client";

import { create } from "zustand";
import { NOTIFICATIONS } from "@/lib/student-data";

/**
 * Mutable interaction state layered on top of the static S042 demo data.
 * (master spec §39 — every interaction visibly changes state.)
 * Frontend-only prototype store; no backend calls.
 */

interface StudentState {
  // current target role (role selector updates this; frontend config only)
  currentRole: string;
  setRole: (r: string) => void;

  // applied opportunity/job/internship IDs
  applied: Set<string>;
  apply: (id: string) => void;

  // saved jobs
  saved: Set<string>;
  toggleSave: (id: string) => void;

  // assessment progress
  assessmentProgress: Record<string, "Not started" | "In Progress" | "Completed">;
  startAssessment: (id: string) => void;
  completeAssessment: (id: string) => void;

  // joined hackathon teams
  joinedTeams: Set<string>;
  joinTeam: (id: string) => void;

  // github links per project (passport)
  githubLinks: Record<string, { github: string; liveDemo: string }>;
  saveGithub: (projectId: string, github: string, liveDemo: string) => void;

  // completed milestones (next-best-action)
  completedActions: Set<string>;
  completeAction: (id: string) => void;

  // read notifications
  readNotifications: Set<string>;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useStudentState = create<StudentState>((set) => ({
  currentRole: "Data Scientist",
  setRole: (r) => set({ currentRole: r }),

  applied: new Set<string>(),
  apply: (id) =>
    set((s) => {
      const next = new Set(s.applied);
      next.add(id);
      return { applied: next };
    }),

  saved: new Set<string>(),
  toggleSave: (id) =>
    set((s) => {
      const next = new Set(s.saved);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { saved: next };
    }),

  assessmentProgress: {
    "as-1": "Completed",
    "as-2": "In Progress",
    "as-3": "Not started",
  },
  startAssessment: (id) =>
    set((s) => ({
      assessmentProgress: { ...s.assessmentProgress, [id]: "In Progress" },
    })),
  completeAssessment: (id) =>
    set((s) => ({
      assessmentProgress: { ...s.assessmentProgress, [id]: "Completed" },
    })),

  joinedTeams: new Set<string>(),
  joinTeam: (id) =>
    set((s) => {
      const next = new Set(s.joinedTeams);
      next.add(id);
      return { joinedTeams: next };
    }),

  githubLinks: {},
  saveGithub: (projectId, github, liveDemo) =>
    set((s) => ({
      githubLinks: { ...s.githubLinks, [projectId]: { github, liveDemo } },
    })),

  completedActions: new Set<string>(),
  completeAction: (id) =>
    set((s) => {
      const next = new Set(s.completedActions);
      next.add(id);
      return { completedActions: next };
    }),

  readNotifications: new Set<string>(),
  markRead: (id) =>
    set((s) => {
      const next = new Set(s.readNotifications);
      next.add(id);
      return { readNotifications: next };
    }),
  markAllRead: () =>
    set({ readNotifications: new Set(NOTIFICATIONS.map((n) => n.id)) }),
}));
