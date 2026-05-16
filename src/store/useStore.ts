import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MovementId } from "@/data/progressions";

type Settings = {
  unitsMetric: boolean;
  restSeconds: number;
};

type State = {
  // Levels mirror the DB but are kept in zustand for fast UI access.
  levels: Record<MovementId, number>;
  setLevel: (m: MovementId, v: number) => void;
  bumpLevel: (m: MovementId, delta: number) => void;
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      levels: { pull: 1, squat: 2, dip: 1, hinge: 1, row: 2, push: 3 },
      setLevel: (m, v) =>
        set((s) => ({ levels: { ...s.levels, [m]: Math.max(1, Math.min(8, v)) } })),
      bumpLevel: (m, delta) =>
        set((s) => ({
          levels: { ...s.levels, [m]: Math.max(1, Math.min(8, s.levels[m] + delta)) },
        })),
      settings: { unitsMetric: true, restSeconds: 90 },
      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),
    }),
    { name: "ladder-store-v1" }
  )
);
