/**
 * SKILL SETU — Phase 8 Hackathon store (master spec §17, §20, §30, §39, §44, §50, §71).
 * Zustand + localStorage. Reuses Phase 3 intelligence store for evidence generation.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  HackathonRegistration, Team, TeamMember, Submission, Evaluation,
  HackathonMentorSession, HackathonActivity, Milestone, Task,
} from "./hackathon-model";
import { DEMO_TEAM } from "./hackathon-demo-data";
import { useIntelligence } from "@/lib/intelligence";

function uid(p: string) { return p + "-" + Math.random().toString(36).slice(2, 9); }
function now() { return new Date().toISOString(); }

interface HackathonState {
  registrations: HackathonRegistration[];
  teams: Team[];
  submissions: Submission[];
  evaluations: Evaluation[];
  mentorSessions: HackathonMentorSession[];
  milestones: Milestone[];
  tasks: Task[];
  activities: HackathonActivity[];
  savedHackathonIds: string[];

  register: (hackathonId: string, studentId: string, studentName: string) => { ok: boolean; error?: string };
  unregister: (hackathonId: string, studentId: string) => void;
  createTeam: (hackathonId: string, name: string, leaderId: string, leaderName: string, problemStatementId?: string) => string;
  joinTeam: (teamId: string, studentId: string, studentName: string, role: string) => { ok: boolean; error?: string };
  leaveTeam: (teamId: string, studentId: string) => void;
  inviteMember: (teamId: string, studentId: string, studentName: string, role: string) => void;
  createSubmission: (submission: Omit<Submission, "id" | "createdAt" | "updatedAt" | "status" | "version">) => string;
  submitFinal: (submissionId: string) => void;
  createEvaluation: (evalData: Omit<Evaluation, "id" | "createdAt" | "updatedAt" | "totalScore" | "status">) => string;
  submitEvaluation: (evaluationId: string) => void;
  generateEvidence: (evaluationId: string) => void;
  toggleSave: (hackathonId: string) => void;
  addActivity: (a: Omit<HackathonActivity, "id" | "timestamp">) => void;
  resetHackathon: () => void;
}

export const useHackathonStore = create<HackathonState>()(
  persist(
    (set, get) => ({
      registrations: [],
      teams: [DEMO_TEAM as Team],
      submissions: [],
      evaluations: [],
      mentorSessions: [],
      milestones: [
        { id: "ml-1", teamId: "tm-1", title: "Problem Understanding", description: "Understand the problem, data, and constraints.", status: "Completed", assignedMembers: ["S042", "S038", "S051"], deliverable: "Problem statement doc" },
        { id: "ml-2", teamId: "tm-1", title: "Data Exploration", description: "EDA + feature engineering.", status: "In Progress", assignedMembers: ["S042", "S051"], deliverable: "EDA notebook" },
        { id: "ml-3", teamId: "tm-1", title: "Model Building", description: "Train + evaluate models.", status: "Not Started", assignedMembers: ["S042", "S051"] },
        { id: "ml-4", teamId: "tm-1", title: "Dashboard + Final Submission", description: "Build dashboard + submit.", status: "Not Started", assignedMembers: ["S038"] },
      ],
      tasks: [
        { id: "tk-1", teamId: "tm-1", title: "Load and clean dataset", description: "Load the anonymized healthcare dataset and clean it.", assignedTo: "S042", priority: "High", status: "Done" },
        { id: "tk-2", teamId: "tm-1", title: "Feature engineering", description: "Create relevant features from patient data.", assignedTo: "S051", priority: "High", status: "In Progress" },
        { id: "tk-3", teamId: "tm-1", title: "Build risk-score dashboard", description: "Streamlit dashboard for risk scores.", assignedTo: "S038", priority: "Medium", status: "Todo" },
      ],
      activities: [
        { id: "ha-1", hackathonId: "hk-1", teamId: "tm-1", timestamp: "2026-09-18T10:00:00", actor: "S042", event: "Team Created", entity: "AI Innovators" },
        { id: "ha-2", hackathonId: "hk-1", teamId: "tm-1", timestamp: "2026-09-18T11:00:00", actor: "S038", event: "Member Joined", entity: "AI Innovators" },
        { id: "ha-3", hackathonId: "hk-1", teamId: "tm-1", timestamp: "2026-09-18T12:00:00", actor: "S051", event: "Member Joined", entity: "AI Innovators" },
        { id: "ha-4", hackathonId: "hk-1", teamId: "tm-1", timestamp: "2026-09-19T09:00:00", actor: "S042", event: "Milestone Completed", entity: "Problem Understanding" },
      ],
      savedHackathonIds: [],

      register: (hackathonId, studentId, studentName) => {
        const existing = get().registrations.find((r) => r.hackathonId === hackathonId && r.studentId === studentId);
        if (existing) return { ok: false, error: "already_registered" };
        const reg: HackathonRegistration = { id: uid("reg"), studentId, studentName, hackathonId, status: "Registered", registeredAt: now() };
        get().addActivity({ hackathonId, actor: studentName, event: "Registered", entity: hackathonId });
        set({ registrations: [reg, ...get().registrations] });
        return { ok: true };
      },

      unregister: (hackathonId, studentId) => {
        set({ registrations: get().registrations.filter((r) => !(r.hackathonId === hackathonId && r.studentId === studentId)) });
      },

      createTeam: (hackathonId, name, leaderId, leaderName, problemStatementId) => {
        const id = uid("tm");
        const team: Team = {
          id, hackathonId, problemStatementId, name, leaderId,
          members: [{ studentId: leaderId, studentName: leaderName, teamRole: "Leader", joinedAt: now(), status: "Leader" }],
          openRoles: [], status: "Forming", createdAt: now(),
        };
        get().addActivity({ hackathonId, teamId: id, actor: leaderName, event: "Team Created", entity: name });
        set({ teams: [team, ...get().teams] });
        return id;
      },

      joinTeam: (teamId, studentId, studentName, role) => {
        const team = get().teams.find((t) => t.id === teamId);
        if (!team) return { ok: false, error: "team_not_found" };
        if (team.members.some((m) => m.studentId === studentId && m.status !== "Left")) return { ok: false, error: "already_member" };
        if (team.members.filter((m) => m.status === "Leader" || m.status === "Member").length >= 4) return { ok: false, error: "team_full" };
        const member: TeamMember = { studentId, studentName, teamRole: role, joinedAt: now(), status: "Member" };
        get().addActivity({ teamId, actor: studentName, event: "Member Joined", entity: team.name });
        set({ teams: get().teams.map((t) => t.id === teamId ? { ...t, members: [...t.members, member] } : t) });
        return { ok: true };
      },

      leaveTeam: (teamId, studentId) => {
        set({ teams: get().teams.map((t) => t.id === teamId ? { ...t, members: t.members.map((m) => m.studentId === studentId ? { ...m, status: "Left" as const } : m) } : t) });
      },

      inviteMember: (teamId, studentId, studentName, role) => {
        const member: TeamMember = { studentId, studentName, teamRole: role, joinedAt: now(), status: "Invited" };
        set({ teams: get().teams.map((t) => t.id === teamId ? { ...t, members: [...t.members, member] } : t) });
        get().addActivity({ teamId, actor: "System", event: "Invitation Sent", entity: studentName });
      },

      createSubmission: (submissionData) => {
        const id = uid("sub");
        const submission: Submission = { ...submissionData, id, status: "Draft", version: "Draft", createdAt: now(), updatedAt: now() };
        get().addActivity({ teamId: submissionData.teamId, hackathonId: submissionData.hackathonId, actor: "System", event: "Submission Created", entity: submissionData.projectTitle });
        set({ submissions: [submission, ...get().submissions] });
        return id;
      },

      submitFinal: (submissionId) => {
        get().addActivity({ actor: "System", event: "Submission Submitted", entity: submissionId });
        set({ submissions: get().submissions.map((s) => s.id === submissionId ? { ...s, status: "Submitted" as const, version: "Final" as const, submittedAt: now(), updatedAt: now() } : s) });
      },

      createEvaluation: (evalData) => {
        const id = uid("ev");
        const totalScore = Math.round(evalData.scores.reduce((sum, s) => sum + s.score * s.weight, 0));
        const evaluation: Evaluation = { ...evalData, id, totalScore, status: "In Progress", createdAt: now(), updatedAt: now() };
        get().addActivity({ teamId: evalData.teamId, hackathonId: evalData.hackathonId, actor: evalData.evaluatorName, event: "Evaluation Started", entity: evalData.submissionId });
        set({ evaluations: [evaluation, ...get().evaluations] });
        return id;
      },

      submitEvaluation: (evaluationId) => {
        set({ evaluations: get().evaluations.map((e) => e.id === evaluationId ? { ...e, status: "Submitted" as const, updatedAt: now() } : e) });
        get().addActivity({ actor: "System", event: "Evaluation Submitted", entity: evaluationId });
      },

      generateEvidence: (evaluationId) => {
        const ev = get().evaluations.find((e) => e.id === evaluationId);
        if (!ev) return;
        const sub = get().submissions.find((s) => s.id === ev.submissionId);
        if (!sub) return;
        const intel = useIntelligence.getState();
        // Generate evidence for each skill demonstrated in the submission contributions
        for (const contrib of sub.contributions) {
          for (const skill of contrib.skillsDemonstrated) {
            // Only generate evidence for S042 (the active student)
            if (contrib.studentId === "S042") {
              const score = ev.scores.find((s) => s.criterionName.includes("Technical"))?.score ?? 75;
              intel.addEvidence({
                skillId: skill.skillId,
                skillName: skill.skillName,
                sourceType: "Hackathon" as any,
                sourceTitle: `Hackathon Evaluation — ${sub.projectTitle}`,
                score: Math.round(score * 0.85),
                status: "Evaluated",
                verificationStatus: "Pending",
                description: `Hackathon evidence from ${sub.projectTitle}. Role: ${contrib.role}. Contribution: ${contrib.contribution}. Evaluation score: ${ev.totalScore}/100.`,
              });
            }
          }
        }
        get().addActivity({ actor: "System", event: "Evidence Created", entity: evaluationId });
      },

      toggleSave: (hackathonId) => {
        const saved = get().savedHackathonIds.includes(hackathonId);
        set({ savedHackathonIds: saved ? get().savedHackathonIds.filter((id) => id !== hackathonId) : [...get().savedHackathonIds, hackathonId] });
      },

      addActivity: (a) => set({ activities: [{ ...a, id: uid("ha"), timestamp: now() }, ...get().activities] }),

      resetHackathon: () => set({ registrations: [], teams: [DEMO_TEAM as Team], submissions: [], evaluations: [], mentorSessions: [], milestones: [], tasks: [], activities: [], savedHackathonIds: [] }),
    }),
    {
      name: "skillsetu-hackathon-v1",
      partialize: (s) => ({ registrations: s.registrations, teams: s.teams, submissions: s.submissions, evaluations: s.evaluations, mentorSessions: s.mentorSessions, milestones: s.milestones, tasks: s.tasks, activities: s.activities, savedHackathonIds: s.savedHackathonIds }),
    },
  ),
);
