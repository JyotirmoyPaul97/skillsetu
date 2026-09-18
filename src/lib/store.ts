"use client";

import { create } from "zustand";
import type { Role } from "@prisma/client";
import type { AuthUser } from "@/lib/types";

export type View =
  | "landing"
  | "login"
  | "register"
  | "student"
  | "industry"
  | "academia"
  | "institution";

export type PortalTab =
  // student
  | "overview"
  | "skills"
  | "opportunities"
  | "applications"
  | "feedback"
  // industry
  | "talent"
  | "post-opp"
  | "my-opps"
  | "team-builder"
  | "industry-feedback"
  // academia
  | "ac-opps"
  | "curriculum"
  // institution
  | "analytics"
  | "placements"
  | "students"
  | "alignment";

interface AppState {
  // session
  user: (AuthUser & { profile?: unknown }) | null;
  loadingUser: boolean;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (payload: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;

  // view
  view: View;
  setView: (v: View) => void;

  // portal tab
  tab: PortalTab;
  setTab: (t: PortalTab) => void;

  // pending role for auth screen prefill
  pendingRole: Role | null;
  setPendingRole: (r: Role | null) => void;
}

export const useApp = create<AppState>((set, get) => ({
  user: null,
  loadingUser: true,
  view: "landing",
  tab: "overview",
  pendingRole: null,

  fetchUser: async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        set({ user: data.user, loadingUser: false });
        // route to portal matching role
        const role = data.user.role;
        const portalMap: Record<Role, View> = {
          STUDENT: "student",
          INDUSTRY: "industry",
          ACADEMIA: "academia",
          INSTITUTION: "institution",
          ADMIN: "institution",
        };
        set({ view: portalMap[role as Role] ?? "landing" });
        // default tab per role
        const tabMap: Record<Role, PortalTab> = {
          STUDENT: "overview",
          INDUSTRY: "talent",
          ACADEMIA: "ac-opps",
          INSTITUTION: "analytics",
          ADMIN: "analytics",
        };
        set({ tab: tabMap[role as Role] ?? "overview" });
      } else {
        set({ user: null, loadingUser: false });
      }
    } catch {
      set({ user: null, loadingUser: false });
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        return { ok: false, error: e.error || "login_failed" };
      }
      // hydrate full profile via /me
      await get().fetchUser();
      return { ok: true };
    } catch {
      return { ok: false, error: "network" };
    }
  },

  register: async (payload) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        return { ok: false, error: e.error || "register_failed" };
      }
      // hydrate full profile via /me
      await get().fetchUser();
      return { ok: true };
    } catch {
      return { ok: false, error: "network" };
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    set({ user: null, view: "landing", tab: "overview" });
  },

  setView: (v) => set({ view: v }),
  setTab: (t) => set({ tab: t }),
  setPendingRole: (r) => set({ pendingRole: r }),
}));
