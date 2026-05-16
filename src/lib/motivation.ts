import type { Session } from "@/db/db";
import type { MovementId } from "@/data/progressions";

// Rotating affirmations — keyed loosely by context (fresh start, mid-streak, returning).
const AFFIRMATIONS = {
  fresh: [
    "Every rep is a vote for the person you're becoming.",
    "Day one is the hardest. You're here.",
    "Strength is the habit, not the moment.",
  ],
  streak: [
    "Don't break the chain.",
    "The body keeps the score. Show up.",
    "Progress lives in the boring days.",
    "You've already done the hard part — you started.",
    "Compound interest, but for your body.",
  ],
  comeback: [
    "Missed a few. Doesn't matter. We restart today.",
    "Welcome back. The bar's where you left it.",
    "Detours, not derailments.",
  ],
  pr: [
    "That's a personal record.",
    "Past you would be proud.",
    "You just did something you couldn't last week.",
  ],
} as const;

export function pickAffirmation(streak: number, daysSinceLast: number | null): string {
  let bucket: keyof typeof AFFIRMATIONS = "fresh";
  if (streak >= 2) bucket = "streak";
  else if (daysSinceLast !== null && daysSinceLast > 3) bucket = "comeback";
  const arr = AFFIRMATIONS[bucket];
  // Stable per-day pick.
  const seed = new Date().toISOString().slice(0, 10);
  const idx = Math.abs(hash(seed + bucket)) % arr.length;
  return arr[idx];
}

export function prAffirmation(): string {
  const arr = AFFIRMATIONS.pr;
  return arr[Math.floor(Math.random() * arr.length)];
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export type StreakInfo = {
  current: number;
  longest: number;
  lastSessionDate: string | null;
  daysSinceLast: number | null;
};

// Counts consecutive days (going back from today) with at least one completed session.
export function computeStreak(sessions: Session[]): StreakInfo {
  const completed = sessions
    .filter((s) => s.completedAt)
    .map((s) => s.date)
    .sort();
  const set = new Set(completed);

  const today = new Date();
  const ymd = (d: Date) => d.toISOString().slice(0, 10);

  // Current streak — count back from today; if today not completed, allow yesterday.
  let cur = 0;
  const cursor = new Date(today);
  if (!set.has(ymd(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(ymd(cursor))) {
    cur += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak — scan all completed dates.
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of completed) {
    const cur = new Date(d + "T00:00:00");
    if (prev && (cur.getTime() - prev.getTime()) / 86400000 === 1) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
    prev = cur;
  }

  const lastSessionDate = completed.length ? completed[completed.length - 1] : null;
  const daysSinceLast = lastSessionDate
    ? Math.floor(
        (new Date(ymd(today) + "T00:00:00").getTime() -
          new Date(lastSessionDate + "T00:00:00").getTime()) /
          86400000
      )
    : null;

  return { current: cur, longest, lastSessionDate, daysSinceLast };
}

// Sum of all 6 ladder levels (out of 48) → a "rank" the user can chase.
export function rankFromLevels(levels: Record<MovementId, number>): {
  total: number;
  max: number;
  name: string;
  pct: number;
} {
  const total = Object.values(levels).reduce((a, b) => a + b, 0);
  const max = 48;
  const pct = Math.round((total / max) * 100);
  const tiers: [number, string][] = [
    [6, "Novice"],
    [12, "Apprentice"],
    [18, "Strong"],
    [24, "Athlete"],
    [30, "Advanced"],
    [36, "Elite"],
    [42, "Beast"],
    [48, "Mythic"],
  ];
  const name = tiers.find(([t]) => total <= t)?.[1] ?? "Mythic";
  return { total, max, name, pct };
}

// Returns the most recent prior session for the given exercise key (movement id or core slot).
export function lastSessionFor(sessions: Session[], key: string, beforeDate: string) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const s = sessions[i];
    if (s.date >= beforeDate) continue;
    const ex = s.exercises.find((e) => e.key === key);
    if (ex && ex.sets.some((x) => x.reps > 0)) return ex;
  }
  return null;
}
