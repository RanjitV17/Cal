import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import {
  MOVEMENTS,
  MOVEMENT_ORDER,
  STRENGTH_SCHEME,
  type MovementId,
} from "@/data/progressions";
import { graduationStatus, type GraduationStatus } from "@/lib/graduation";
import type { Session } from "@/db/db";
import { classNames, ladderTone } from "@/lib/util";

type Props = {
  sessions: Session[];
  levels: Record<MovementId, number>;
};

export function ProgressionStatus({ sessions, levels }: Props) {
  const statuses = MOVEMENT_ORDER.map((id) =>
    graduationStatus(id, levels[id], sessions)
  );

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Progression
        </h2>
        <span className="text-[11px] text-zinc-500">where you are · what's next</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {statuses.map((s) => (
          <StatusCard key={s.movement} s={s} />
        ))}
      </div>
    </section>
  );
}

function StatusCard({ s }: { s: GraduationStatus }) {
  const m = MOVEMENTS[s.movement];
  const ready = s.readiness >= 1;
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {m.short}
          </span>
          <span className={classNames("pill border", ladderTone(s.currentLevel))}>
            Lvl {toRoman(s.currentLevel)}
          </span>
        </div>
        <span
          className={classNames(
            "text-[10px] uppercase tracking-wider",
            ready ? "text-emerald-300" : "text-zinc-500"
          )}
        >
          {s.blurb}
        </span>
      </div>

      <div className="space-y-3 p-4">
        {/* Current → Next */}
        <div className="flex items-center gap-3 text-sm">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">
              Current
            </div>
            <div className="truncate font-medium">{s.currentName}</div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600" />
          <div className="min-w-0 flex-1 text-right">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">
              Next
            </div>
            <div
              className={classNames(
                "truncate font-medium",
                s.isMaxLevel ? "text-zinc-500" : "text-zinc-200"
              )}
            >
              {s.nextName ?? "Top of ladder"}
            </div>
          </div>
        </div>

        {/* Readiness bar */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-500">
            <span>Graduation readiness</span>
            <span className="tabular-nums">{Math.round(s.readiness * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
            <motion.div
              className={classNames(
                "h-full rounded-full",
                ready
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                  : "bg-gradient-to-r from-indigo-400 to-rose-400"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${s.readiness * 100}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            />
          </div>
        </div>

        {/* Per-set best — 3 dots showing how close each set is to maxReps */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-500">
            <span>Best sets</span>
            <span>target {STRENGTH_SCHEME.maxReps} each</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {s.bestSets.map((reps, i) => {
              const pct = Math.min(1, reps / STRENGTH_SCHEME.maxReps);
              const done = reps >= STRENGTH_SCHEME.maxReps;
              return (
                <div
                  key={i}
                  className={classNames(
                    "relative overflow-hidden rounded-lg border px-2 py-1.5",
                    done
                      ? "border-emerald-400/30 bg-emerald-500/10"
                      : "border-white/5 bg-white/[0.02]"
                  )}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-indigo-500/15"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct * 100}%` }}
                    transition={{ type: "spring", stiffness: 80, damping: 20 }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500">
                      S{i + 1}
                    </span>
                    <span
                      className={classNames(
                        "text-sm font-semibold tabular-nums",
                        done ? "text-emerald-200" : "text-zinc-200"
                      )}
                    >
                      {reps || "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hint */}
        <div className="flex items-start gap-2 rounded-xl bg-white/[0.02] p-2.5 text-[11px] text-zinc-400">
          {ready ? (
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
          ) : (
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
          )}
          <span>{s.nextStepHint}</span>
        </div>
      </div>
    </div>
  );
}

function toRoman(n: number) {
  return ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"][n - 1] ?? String(n);
}
