export type MovementId =
  | "pull"
  | "squat"
  | "dip"
  | "hinge"
  | "row"
  | "push";

export type ProgressionStep = {
  level: number;
  name: string;
  video?: string;
  cues?: string;
};

export type Movement = {
  id: MovementId;
  name: string;
  short: string;
  pattern: "Pull" | "Push" | "Squat" | "Hinge" | "Row" | "Dip";
  wikiUrl: string;
  pairWith: MovementId;
  steps: ProgressionStep[];
};

// Sourced from r/bodyweightfitness Recommended Routine + the user's sheet.
// Levels are 1-indexed and ordered easy → hard.
export const MOVEMENTS: Record<MovementId, Movement> = {
  pull: {
    id: "pull",
    name: "Pull-up Progression",
    short: "Pull",
    pattern: "Pull",
    wikiUrl: "https://www.reddit.com/r/bodyweightfitness/wiki/exercises/pullup/",
    pairWith: "squat",
    steps: [
      { level: 1, name: "Scapular Pulls", video: "https://youtu.be/FgYoc4O-cio?t=1m21s" },
      { level: 2, name: "Arch Hangs", video: "https://youtu.be/C995b3KLXS4?t=7s" },
      { level: 3, name: "Pull-up Negatives", video: "https://www.youtube.com/watch?v=EkpJkHpJXmM" },
      { level: 4, name: "Pull-ups", video: "https://www.youtube.com/watch?v=eGo4IYIbE5g" },
      { level: 5, name: "Weighted Pull-ups" },
      { level: 6, name: "L-sit Pull-ups" },
      { level: 7, name: "Archer Pull-ups" },
      { level: 8, name: "One-arm Pull-up" },
    ],
  },
  squat: {
    id: "squat",
    name: "Squat Progression",
    short: "Squat",
    pattern: "Squat",
    wikiUrl: "https://www.reddit.com/r/bodyweightfitness/wiki/exercises/squat",
    pairWith: "pull",
    steps: [
      { level: 1, name: "Assisted Squat" },
      { level: 2, name: "Squat" },
      { level: 3, name: "Split Squat" },
      { level: 4, name: "Bulgarian Split Squat", video: "https://www.youtube.com/watch?v=kkdmHTASZg8" },
      { level: 5, name: "Beginner Shrimp Squat", video: "https://www.youtube.com/watch?v=TKt0-c83GSc" },
      { level: 6, name: "Intermediate Shrimp Squat" },
      { level: 7, name: "Advanced Shrimp Squat" },
      { level: 8, name: "Weighted Shrimp Squat" },
    ],
  },
  dip: {
    id: "dip",
    name: "Dip Progression",
    short: "Dip",
    pattern: "Dip",
    wikiUrl: "https://www.reddit.com/r/bodyweightfitness/wiki/exercises/dip",
    pairWith: "hinge",
    steps: [
      { level: 1, name: "Parallel Bar Support Hold" },
      { level: 2, name: "Negative Dips" },
      { level: 3, name: "Parallel Bar Dips" },
      { level: 4, name: "Weighted / Ring Dips" },
      { level: 5, name: "Bulgarian Dips" },
      { level: 6, name: "Russian Dips" },
      { level: 7, name: "Impossible Dips" },
      { level: 8, name: "Single-bar Dip" },
    ],
  },
  hinge: {
    id: "hinge",
    name: "Hinge Progression",
    short: "Hinge",
    pattern: "Hinge",
    wikiUrl: "https://www.reddit.com/r/bodyweightfitness/wiki/exercises/hinge",
    pairWith: "dip",
    steps: [
      { level: 1, name: "Romanian Deadlift" },
      { level: 2, name: "Single Legged Deadlift" },
      { level: 3, name: "Banded Nordic Curl Negatives" },
      { level: 4, name: "Banded Nordic Curl" },
      { level: 5, name: "Nordic Curls" },
      { level: 6, name: "Weighted Nordic Curl" },
      { level: 7, name: "Single-leg Nordic" },
      { level: 8, name: "Single-leg Weighted Nordic" },
    ],
  },
  row: {
    id: "row",
    name: "Row Progression",
    short: "Row",
    pattern: "Row",
    wikiUrl: "https://www.reddit.com/r/bodyweightfitness/wiki/exercises/row",
    pairWith: "push",
    steps: [
      { level: 1, name: "Vertical Rows" },
      { level: 2, name: "Incline Rows" },
      { level: 3, name: "Horizontal Rows" },
      { level: 4, name: "Wide Rows" },
      { level: 5, name: "Weighted Inverted Rows" },
      { level: 6, name: "Tuck Front Lever Rows" },
      { level: 7, name: "Front Lever Rows" },
      { level: 8, name: "Weighted Front Lever Rows" },
    ],
  },
  push: {
    id: "push",
    name: "Pushup Progression",
    short: "Push",
    pattern: "Push",
    wikiUrl: "https://www.reddit.com/r/bodyweightfitness/wiki/exercises/pushup",
    pairWith: "row",
    steps: [
      { level: 1, name: "Vertical Pushup" },
      { level: 2, name: "Incline Pushup" },
      { level: 3, name: "Full Pushup" },
      { level: 4, name: "Diamond Pushup" },
      { level: 5, name: "Pseudo Planche Pushup" },
      { level: 6, name: "Archer Pushup" },
      { level: 7, name: "Pseudo Planche Pushup (advanced)" },
      { level: 8, name: "Planche Pushup" },
    ],
  },
};

export const MOVEMENT_ORDER: MovementId[] = ["pull", "squat", "dip", "hinge", "row", "push"];

// Strength supersets — paired movements done back-to-back
export const SUPERSET_PAIRS: [MovementId, MovementId][] = [
  ["pull", "squat"],
  ["dip", "hinge"],
  ["row", "push"],
];

export type CoreSlot = {
  id: string;
  name: string;
  options: { name: string; video?: string }[];
};

export const CORE_TRIPLET: CoreSlot[] = [
  {
    id: "anti-extension",
    name: "Anti-Extension",
    options: [{ name: "Planks" }, { name: "Ab Roller" }, { name: "Dead Bug" }],
  },
  {
    id: "anti-rotation",
    name: "Anti-Rotation",
    options: [
      { name: "Banded Pallof Press", video: "https://www.youtube.com/watch?v=AH_QZLm_0-s" },
    ],
  },
  {
    id: "extension",
    name: "Extension",
    options: [
      { name: "Reverse Hyperextension", video: "https://www.youtube.com/watch?v=ZeRsNzFcQLQ" },
      { name: "Back Extensions" },
    ],
  },
];

export type WarmupItem = { name: string; reps: string };

export const WARMUP: WarmupItem[] = [
  { name: "Yuri's Shoulder Band Routine", reps: "5–10" },
  { name: "Squat Sky Reach", reps: "5–10" },
  { name: "GMB Wrist Prep", reps: "10+" },
  { name: "Deadbugs", reps: "30s" },
  { name: "Arch Hangs", reps: "5–10" },
  { name: "Support Hold", reps: "30s" },
  { name: "Easier Squat Progression", reps: "10" },
  { name: "Easier Hinge Progression", reps: "10" },
];

// Strength: 3 sets, 5–8 reps. Top of range across all sets → graduate.
export const STRENGTH_SCHEME = { sets: 3, minReps: 5, maxReps: 8 };
// Core: 3 sets, 8–12 reps.
export const CORE_SCHEME = { sets: 3, minReps: 8, maxReps: 12 };
