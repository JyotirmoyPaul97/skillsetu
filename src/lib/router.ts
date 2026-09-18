"use client";

import { create } from "zustand";

/**
 * Hash-based client router. The whole SKILL SETU app lives on the single `/`
 * Next.js route (project constraint); different screens are distinguished by
 * the URL hash (e.g. `#/app/dashboard`, `#/login`).
 *
 * - `/`            → Phase 1 landing (unchanged)
 * - `/login`       → Login view
 * - `/app/<path>`  → authenticated app shell with the given route active
 */

function readHash(): string {
  if (typeof window === "undefined") return "";
  const h = window.location.hash.replace(/^#/, "");
  return h.startsWith("/") ? h : "/" + h;
}

interface RouterState {
  route: string; // e.g. "/app/dashboard", "/login", "/"
  navigate: (route: string) => void;
  back: () => void;
}

export const useRouter = create<RouterState>((set) => ({
  route: typeof window === "undefined" ? "/" : readHash() || "/",
  navigate: (route) => {
    const r = route.startsWith("/") ? route : "/" + route;
    if (typeof window !== "undefined") {
      window.location.hash = r;
    }
    set({ route: r });
  },
  back: () => {
    if (typeof window !== "undefined") window.history.back();
  },
}));

// keep store in sync with browser hash (back/forward buttons)
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    useRouter.setState({ route: readHash() || "/" });
  });
}

/** Parse the current route into the active app section, e.g. "/app/skills/technical" → ["skills","technical"]. */
export function appSection(route: string): string[] {
  const r = route.replace(/^\/app\/?/, "");
  return r.split("/").filter(Boolean);
}

/** Is the current route inside the authenticated app shell? */
export function isAppRoute(route: string): boolean {
  return route.startsWith("/app");
}
