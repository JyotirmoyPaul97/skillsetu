"use client";

import { create } from "zustand";

export type GateWhich =
  | "login"
  | "get-started"
  | "portal-student"
  | "portal-industry"
  | "portal-academia"
  | "portal-institution"
  | null;

interface Phase1State {
  gate: GateWhich;
  openGate: (w: Exclude<GateWhich, null>) => void;
  closeGate: () => void;
  /** mobile drawer open state for the header */
  mobileNav: boolean;
  setMobileNav: (v: boolean) => void;
}

export const usePhase1 = create<Phase1State>((set) => ({
  gate: null,
  mobileNav: false,
  openGate: (w) => set({ gate: w }),
  closeGate: () => set({ gate: null }),
  setMobileNav: (v) => set({ mobileNav: v }),
}));
