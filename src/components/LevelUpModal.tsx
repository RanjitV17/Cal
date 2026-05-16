import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, X } from "lucide-react";
import type { MovementId } from "@/data/progressions";
import { MOVEMENTS } from "@/data/progressions";

export type LevelUp = {
  movement: MovementId;
  from: number;
  to: number;
};

export type Celebration = {
  promotions: LevelUp[];
  totalReps: number;
  totalSets: number;
  prCount: number;
};

type Props = {
  celebration: Celebration | null;
  onClose: () => void;
};

export function LevelUpModal({ celebration, onClose }: Props) {
  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            key="card"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 p-6"
            style={{
              background:
                "radial-gradient(800px 300px at 50% -10%, rgba(244,114,182,0.35), transparent 60%), linear-gradient(180deg, #14101a, #0a0a0b)",
            }}
          >
            <Confetti />

            <button
              onClick={onClose}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] text-zinc-300 hover:bg-white/[0.12]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative text-center">
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 shadow-glow"
              >
                <Crown className="h-7 w-7 text-white" />
              </motion.div>
              <h2 className="mt-4 font-display text-2xl font-bold">
                {celebration.promotions.length > 0 ? "Level Up!" : "Session Crushed"}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {celebration.promotions.length > 0
                  ? "You earned a graduation."
                  : "Showed up. Did the work."}
              </p>

              {celebration.promotions.length > 0 && (
                <div className="mt-5 space-y-2 text-left">
                  {celebration.promotions.map((p) => {
                    const m = MOVEMENTS[p.movement];
                    const newStep = m.steps.find((s) => s.level === p.to);
                    return (
                      <motion.div
                        key={p.movement}
                        initial={{ x: -8, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-3"
                      >
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-sm font-bold text-amber-200">
                          {toRoman(p.to)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                            {m.short} · {toRoman(p.from)} → {toRoman(p.to)}
                          </div>
                          <div className="truncate font-medium">{newStep?.name}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <Stat n={celebration.totalSets} l="sets" />
                <Stat n={celebration.totalReps} l="reps" />
                <Stat n={celebration.prCount} l="PRs" highlight />
              </div>

              <button onClick={onClose} className="btn-primary mt-5 w-full">
                Keep going
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ n, l, highlight }: { n: number; l: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-2.5 ${
        highlight && n > 0
          ? "border-rose-400/30 bg-rose-500/10"
          : "border-white/5 bg-white/[0.03]"
      }`}
    >
      <div className="font-display text-xl font-semibold tabular-nums">{n}</div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{l}</div>
    </div>
  );
}

function toRoman(n: number) {
  return ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"][n - 1] ?? String(n);
}

// Lightweight confetti — 24 dots drifting down with random colors.
function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.4 + Math.random() * 1.2,
      hue: [340, 270, 200, 40][i % 4],
      size: 5 + Math.random() * 5,
    }))
  );
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 1.6,
            background: `hsl(${p.hue} 90% 65%)`,
          }}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{ y: 480, opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
