import { Lock, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { classNames } from "@/lib/util";

type Props = {
  sets: { reps: number }[];
  totalSets: number;
  minReps: number;
  maxReps: number;
  onChange: (sets: { reps: number }[]) => void;
};

export function SetLogger({ sets, totalSets, minReps, maxReps, onChange }: Props) {
  const list = Array.from({ length: totalSets }, (_, i) => sets[i] ?? { reps: 0 });

  // A set is "revealed" when it's set 1, or when the previous set has reps > 0.
  const revealedCount = list.reduce(
    (acc, s, i) => (i === 0 || list[i - 1].reps > 0 ? acc + 1 : acc),
    0
  );

  const update = (i: number, reps: number) => {
    const next = [...list];
    next[i] = { reps: Math.max(0, reps) };
    // If we just zeroed a set, also zero the sets after it (they're no longer reachable).
    if (next[i].reps === 0) {
      for (let j = i + 1; j < next.length; j++) next[j] = { reps: 0 };
    }
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {list.map((s, i) => {
        const revealed = i < revealedCount;
        const hit = s.reps >= maxReps;
        const ok = s.reps >= minReps;
        return (
          <AnimatePresence key={i} initial={false} mode="popLayout">
            {revealed ? (
              <motion.div
                key="open"
                layout
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className={classNames(
                  "flex items-center gap-3 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2",
                  hit && "border-emerald-400/30 bg-emerald-500/10",
                  !hit && ok && "border-amber-400/25 bg-amber-500/5"
                )}
              >
                <div className="w-12 shrink-0 text-[10px] uppercase tracking-wider text-zinc-500">
                  Set {i + 1}
                </div>
                <div className="flex flex-1 items-center justify-end gap-3">
                  <span className="text-[10px] text-zinc-500">
                    target {minReps}–{maxReps}
                  </span>
                  <button
                    onClick={() => update(i, s.reps - 1)}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30"
                    disabled={s.reps === 0}
                    aria-label="decrement"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-8 text-center text-xl font-semibold tabular-nums">
                    {s.reps}
                  </div>
                  <button
                    onClick={() => update(i, s.reps + 1)}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/30 hover:bg-indigo-500/40"
                    aria-label="increment"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="locked"
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 overflow-hidden rounded-xl border border-dashed border-white/5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-600"
              >
                <Lock className="h-3 w-3" />
                Set {i + 1}
                <span className="ml-auto normal-case tracking-normal text-zinc-700">
                  log set {i} first
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </div>
  );
}
