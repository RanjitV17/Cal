import Dexie, { Table } from "dexie";
import type { MovementId } from "@/data/progressions";

export type SetEntry = { reps: number };

export type SessionExercise = {
  // For strength movements, key is MovementId. For core, key is the slot id ("anti-extension" etc).
  key: string;
  // For strength: the chosen step name at session time. For core: chosen option name.
  variant: string;
  level?: number;
  sets: SetEntry[];
  notes?: string;
};

export type Session = {
  id?: number;
  date: string; // YYYY-MM-DD
  startedAt: number;
  completedAt?: number;
  warmupDone: string[];
  exercises: SessionExercise[];
};

export type CurrentLevels = {
  id: "current";
  levels: Record<MovementId, number>;
};

class WorkoutDB extends Dexie {
  sessions!: Table<Session, number>;
  meta!: Table<CurrentLevels, string>;

  constructor() {
    super("workout-tracker");
    this.version(1).stores({
      sessions: "++id, date",
      meta: "id",
    });
  }
}

export const db = new WorkoutDB();

export async function getCurrentLevels(): Promise<Record<MovementId, number>> {
  const row = await db.meta.get("current");
  return (
    row?.levels ?? {
      pull: 1,
      squat: 2,
      dip: 1,
      hinge: 1,
      row: 2,
      push: 3,
    }
  );
}

export async function setCurrentLevel(movement: MovementId, level: number) {
  const current = await getCurrentLevels();
  current[movement] = level;
  await db.meta.put({ id: "current", levels: current });
}
