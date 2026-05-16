import type { Session } from "@/db/db";
import type { MovementId } from "@/data/progressions";
import { MOVEMENTS, STRENGTH_SCHEME } from "@/data/progressions";

export type GraduationStatus = {
  movement: MovementId;
  currentLevel: number;
  currentName: string;
  nextName: string | null;
  isMaxLevel: boolean;
  // Most-recent session at this level
  lastSets: number[] | null; // e.g. [8, 7, 6]
  // Best-ever sets at this level (per-set max across sessions)
  bestSets: number[]; // length = STRENGTH_SCHEME.sets, default 0s
  // How many sets in the last session hit the top of the rep range
  setsAtMaxLast: number;
  setsTotal: number;
  // 0..1 — how ready you are to graduate. 1.0 = next session promotes you.
  readiness: number;
  // Friendly one-line status.
  blurb: string;
  // Specific actionable hint, e.g. "1 more rep on Set 3 to graduate"
  nextStepHint: string;
};

export function graduationStatus(
  movement: MovementId,
  currentLevel: number,
  sessions: Session[]
): GraduationStatus {
  const m = MOVEMENTS[movement];
  const currentStep = m.steps.find((s) => s.level === currentLevel)!;
  const nextStep = m.steps.find((s) => s.level === currentLevel + 1) ?? null;
  const isMaxLevel = !nextStep;

  // Filter sessions that recorded this movement at the current level.
  const relevant = sessions
    .filter((s) => s.completedAt)
    .map((s) => s.exercises.find((e) => e.key === movement && e.level === currentLevel))
    .filter(Boolean) as { sets: { reps: number }[] }[];

  const lastEx = relevant.length ? relevant[relevant.length - 1] : null;
  const lastSets = lastEx ? lastEx.sets.map((s) => s.reps) : null;

  // Best-ever per-set reps across sessions at this level.
  const bestSets = Array.from({ length: STRENGTH_SCHEME.sets }, (_, i) =>
    relevant.reduce((m, ex) => Math.max(m, ex.sets[i]?.reps ?? 0), 0)
  );

  const setsAtMaxLast = lastSets
    ? lastSets.filter((r) => r >= STRENGTH_SCHEME.maxReps).length
    : 0;

  // Readiness uses BEST sets so a single bad day doesn't reset progress.
  const bestAtMax = bestSets.filter((r) => r >= STRENGTH_SCHEME.maxReps).length;
  const totalReps = bestSets.reduce((a, b) => a + b, 0);
  const idealReps = STRENGTH_SCHEME.sets * STRENGTH_SCHEME.maxReps;
  // Blend: 60% weight on sets-at-max progress, 40% on total reps progress.
  const readiness = isMaxLevel
    ? 1
    : Math.min(
        1,
        (bestAtMax / STRENGTH_SCHEME.sets) * 0.6 + (totalReps / idealReps) * 0.4
      );

  let blurb: string;
  let nextStepHint: string;

  if (isMaxLevel) {
    blurb = "Top of the ladder";
    nextStepHint = "Maintain — try weighted variations.";
  } else if (!lastSets) {
    blurb = "Not yet logged";
    nextStepHint = `Hit ${STRENGTH_SCHEME.maxReps} reps on all 3 sets to unlock ${nextStep!.name}.`;
  } else if (setsAtMaxLast === STRENGTH_SCHEME.sets) {
    blurb = "Ready to graduate";
    nextStepHint = `Finish today to promote to ${nextStep!.name}.`;
  } else {
    const repsNeeded = bestSets.reduce(
      (a, r) => a + Math.max(0, STRENGTH_SCHEME.maxReps - r),
      0
    );
    blurb = `${bestAtMax}/${STRENGTH_SCHEME.sets} sets at top`;
    nextStepHint =
      repsNeeded <= 2
        ? `${repsNeeded} more rep${repsNeeded === 1 ? "" : "s"} (across all sets) → ${nextStep!.name}.`
        : `~${repsNeeded} more reps spread across sets to unlock ${nextStep!.name}.`;
  }

  return {
    movement,
    currentLevel,
    currentName: currentStep.name,
    nextName: nextStep?.name ?? null,
    isMaxLevel,
    lastSets,
    bestSets,
    setsAtMaxLast,
    setsTotal: STRENGTH_SCHEME.sets,
    readiness,
    blurb,
    nextStepHint,
  };
}
