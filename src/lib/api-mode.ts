/**
 * SKILL SETU — Phase 11 API Mode.
 *
 * Determines whether the frontend uses:
 *  - "demo" mode: localStorage Zustand stores (Phase 3-10 behavior — no backend)
 *  - "production" mode: API routes via the api-client (Phase 11 — real backend)
 *
 * The mode is toggled by the user via the System Architecture badge in the header.
 * Persisted to localStorage so the choice survives refresh.
 *
 * Master spec §4 (single source of truth): in production mode, the backend is the
 * source of truth. In demo mode, localStorage is the source of truth (PROTOTYPE).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ApiMode = "demo" | "production";

interface ApiModeState {
  mode: ApiMode;
  setMode: (mode: ApiMode) => void;
  toggle: () => void;
}

export const useApiMode = create<ApiModeState>()(
  persist(
    (set, get) => ({
      mode: "demo", // default to demo mode — preserves Phase 1-10 behavior
      setMode: (mode) => set({ mode }),
      toggle: () => set({ mode: get().mode === "demo" ? "production" : "demo" }),
    }),
    {
      name: "skillsetu-api-mode-v1",
    },
  ),
);

/**
 * Returns true if the frontend should call the API (production mode).
 * Use this in components to decide between API fetch and Zustand store read.
 */
export function useIsProductionMode(): boolean {
  return useApiMode((s) => s.mode === "production");
}

/**
 * Server-side-safe mode getter (for API routes / server components).
 * Always returns "demo" on the server (no localStorage).
 */
export function getApiMode(): ApiMode {
  if (typeof window === "undefined") return "demo";
  try {
    const raw = localStorage.getItem("skillsetu-api-mode-v1");
    if (!raw) return "demo";
    const parsed = JSON.parse(raw);
    return parsed?.state?.mode === "production" ? "production" : "demo";
  } catch {
    return "demo";
  }
}
