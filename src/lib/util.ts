export function todayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function prettyDate(s: string): string {
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function classNames(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

// Ladder gradient — maps a level (1..8) to a soft palette consistent with the sheet's color coding.
export function ladderTone(level: number) {
  const tones = [
    "bg-sky-500/15 text-sky-200 border-sky-400/30",
    "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    "bg-amber-500/15 text-amber-200 border-amber-400/30",
    "bg-rose-500/15 text-rose-200 border-rose-400/30",
    "bg-pink-500/20 text-pink-200 border-pink-400/30",
    "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/30",
    "bg-red-500/20 text-red-200 border-red-400/30",
    "bg-red-600/30 text-red-100 border-red-500/40",
  ];
  return tones[Math.min(7, Math.max(0, level - 1))];
}
