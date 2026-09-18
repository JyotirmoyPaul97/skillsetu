/**
 * SKILL SETU — Phase 10 Evaluator Demo Store.
 *
 * Central orchestrator for the Evaluator Demo Mode. Tracks the demo event
 * timeline, last action, and affected modules. ALL data mutations flow
 * through the EXISTING Phase 3-8 Zustand stores — this store ONLY records
 * events and orchestrates the demo workflow (no duplicate engines, no
 * duplicate student/skill/opportunity data).
 *
 * Master spec §20 (central demo state), §21 (deterministic calculations),
 * §63 (rules calculate, AI explains), §80 (no duplicate engines).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Demo event types (§18 Event Timeline) ──────────────────────────
export type DemoActor =
  | "Industry Portal"
  | "Student Portal"
  | "Academia Portal"
  | "Institution Portal"
  | "Skill Intelligence Engine"
  | "Opportunity Match Engine"
  | "Evaluator";

export type DemoEventCategory =
  | "Demand Change"
  | "Evidence Generated"
  | "Evidence Verified"
  | "Readiness Recalculated"
  | "Skill Gap Recalculated"
  | "Match Recalculated"
  | "Recommendation Recalculated"
  | "Feedback Submitted"
  | "Passport Updated"
  | "Institution Insight Updated"
  | "Academia Signal Updated"
  | "Demo Reset"
  | "Demo Started";

export interface DemoEvent {
  id: string;
  timestamp: string; // ISO datetime
  actor: DemoActor;
  action: string;
  affectedEntity: string;
  category: DemoEventCategory;
  affectedModules: string[]; // ["Skill Profile", "Role Readiness", ...]
  explanation: string; // for "Why did this change?"
}

interface DemoState {
  isActive: boolean;
  events: DemoEvent[];
  lastAction: string | null;
  lastActionTimestamp: string | null;
  affectedModules: string[];
  newEvidenceId: string | null; // tracks the demo-generated evidence for verify action
  feedbackId: string | null; // tracks the industry feedback ID

  startDemo: () => void;
  resetDemoState: () => void; // resets ONLY the demo store (not the underlying stores)
  recordEvent: (e: Omit<DemoEvent, "id" | "timestamp">) => string;
  clearEvents: () => void;
  setActive: (active: boolean) => void;
  setNewEvidenceId: (id: string | null) => void;
  setFeedbackId: (id: string | null) => void;
}

function now() {
  return new Date().toISOString();
}

function uid(p: string) {
  return p + "-" + Math.random().toString(36).slice(2, 9);
}

const BASELINE_DEMO_EVENTS: DemoEvent[] = [
  {
    id: "demo-start",
    timestamp: now(),
    actor: "Evaluator",
    action: "Started Evaluator Demo Mode",
    affectedEntity: "S042 · Data Scientist",
    category: "Demo Started",
    affectedModules: ["Demo Control Panel", "Event Timeline"],
    explanation:
      "Evaluator Demo Mode activated. Baseline state: S042 (AI & Data Science, Data Scientist target role). Readiness 61% — Python 82, SQL 64, Statistics 51, Machine Learning 43, Problem Solving 75. Critical gap: Machine Learning (43 vs 70 target). Suggested next best action: Build an applied Machine Learning project.",
  },
];

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      isActive: false,
      events: BASELINE_DEMO_EVENTS,
      lastAction: "Demo baseline state",
      lastActionTimestamp: now(),
      affectedModules: ["Skill Profile", "Role Readiness", "Skill Gap", "Opportunity Match"],
      newEvidenceId: null,
      feedbackId: null,

      startDemo: () => {
        const event: DemoEvent = {
          id: uid("ev"),
          timestamp: now(),
          actor: "Evaluator",
          action: "Started Evaluator Demo Mode",
          affectedEntity: "S042 · Data Scientist",
          category: "Demo Started",
          affectedModules: ["Demo Control Panel", "Event Timeline"],
          explanation:
            "Evaluator Demo Mode activated. Baseline state: S042 (AI & Data Science, Data Scientist target role). Readiness 61%. Critical gap: Machine Learning. Suggested next best action: Build an applied Machine Learning project.",
        };
        set({
          isActive: true,
          events: [event],
          lastAction: "Demo started",
          lastActionTimestamp: now(),
          affectedModules: ["Demo Control Panel", "Event Timeline"],
          newEvidenceId: null,
          feedbackId: null,
        });
      },

      resetDemoState: () => {
        const event: DemoEvent = {
          id: uid("ev"),
          timestamp: now(),
          actor: "Evaluator",
          action: "Reset Demo to baseline state",
          affectedEntity: "All portals",
          category: "Demo Reset",
          affectedModules: [
            "Skill Profile",
            "Role Readiness",
            "Skill Gap",
            "Opportunity Match",
            "Skill Passport",
            "Institution Insights",
            "Event Timeline",
          ],
          explanation:
            "Demo state restored to baseline. All evidence, feedback, readiness, gaps, matches, and timeline events cleared. S042 returns to baseline: Python 82, SQL 64, Statistics 51, ML 43, Problem Solving 75. Readiness 61%.",
        };
        set({
          isActive: true, // stay active after reset
          events: [event],
          lastAction: "Demo reset to baseline",
          lastActionTimestamp: now(),
          affectedModules: event.affectedModules,
          newEvidenceId: null,
          feedbackId: null,
        });
      },

      recordEvent: (e) => {
        const event: DemoEvent = {
          ...e,
          id: uid("ev"),
          timestamp: now(),
        };
        set({
          events: [event, ...get().events],
          lastAction: e.action,
          lastActionTimestamp: event.timestamp,
          affectedModules: e.affectedModules,
        });
        return event.id;
      },

      clearEvents: () => set({ events: [], lastAction: null, lastActionTimestamp: null, affectedModules: [] }),
      setActive: (active) => set({ isActive: active }),
      setNewEvidenceId: (id) => set({ newEvidenceId: id }),
      setFeedbackId: (id) => set({ feedbackId: id }),
    }),
    {
      name: "skillsetu-demo-v1",
      partialize: (s) => ({
        isActive: s.isActive,
        events: s.events.slice(0, 50),
        lastAction: s.lastAction,
        lastActionTimestamp: s.lastActionTimestamp,
        affectedModules: s.affectedModules,
        newEvidenceId: s.newEvidenceId,
        feedbackId: s.feedbackId,
      }),
    },
  ),
);
