import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Flame, Sparkles, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import {
  CORE_SCHEME,
  CORE_TRIPLET,
  MOVEMENTS,
  STRENGTH_SCHEME,
  SUPERSET_PAIRS,
  WARMUP,
  type MovementId,
} from "@/data/progressions";
import { db, type Session, type SessionExercise } from "@/db/db";
import { SetLogger } from "@/components/SetLogger";
import { LevelUpModal, type Celebration, type LevelUp } from "@/components/LevelUpModal";
import { useStore } from "@/store/useStore";
import { classNames, ladderTone, prettyDate, todayStr } from "@/lib/util";
import { lastSessionFor } from "@/lib/motivation";

export function Workout() {
  const date = todayStr();
  const navigate = useNavigate();
  const levels = useStore((s) => s.levels);
  const bumpLevel = useStore((s) => s.bumpLevel);
  const [session, setSession] = useState<Session | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  const allSessions = useLiveQuery(() => db.sessions.orderBy("date").toArray(), []) ?? [];
  const existing = useMemo(
    () => allSessions.find((s) => s.date === date),
    [allSessions, date]
  );

  useEffect(() => {
    if (session) return;
    if (existing) {
      setSession(existing);
    } else {
      const fresh: Session = {
        date,
        startedAt: Date.now(),
        warmupDone: [],
        exercises: [
          ...SUPERSET_PAIRS.flat().map((id) => makeStrengthEntry(id, levels[id])),
          ...CORE_TRIPLET.map((slot) => ({
            key: slot.id,
            variant: slot.options[0].name,
            sets: Array.from({ length: CORE_SCHEME.sets }, () => ({ reps: 0 })),
          })),
        ],
      };
      setSession(fresh);
    }
  }, [existing, date, levels, session]);

  const save = async (next: Session) => {
    setSession(next);
    if (next.id) await db.sessions.put(next);
    else {
      const id = await db.sessions.add(next);
      setSession({ ...next, id });
    }
  };

  const toggleWarmup = (name: string) => {
    if (!session) return;
    const done = session.warmupDone.includes(name)
      ? session.warmupDone.filter((w) => w !== name)
      : [...session.warmupDone, name];
    save({ ...session, warmupDone: done });
  };

  const updateExerciseSets = (idx: number, sets: { reps: number }[]) => {
    if (!session) return;
    save({
      ...session,
      exercises: session.exercises.map((e, i) => (i === idx ? { ...e, sets } : e)),
    });
  };

  const completeSession = async () => {
    if (!session) return;
    const finished = { ...session, completedAt: Date.now() };
    await save(finished);

    const promotions: LevelUp[] = [];
    let prCount = 0;
    for (const ex of finished.exercises) {
      if (MOVEMENTS[ex.key as MovementId]) {
        const movementId = ex.key as MovementId;
        const allMax =
          ex.sets.length >= STRENGTH_SCHEME.sets &&
          ex.sets.every((s) => s.reps >= STRENGTH_SCHEME.maxReps);
        if (allMax && levels[movementId] < 8) {
          promotions.push({ movement: movementId, from: levels[movementId], to: levels[movementId] + 1 });
          bumpLevel(movementId, 1);
        }
      }
      const last = lastSessionFor(allSessions, ex.key, finished.date);
      const cur = ex.sets.reduce((a, x) => a + x.reps, 0);
      const prev = last ? last.sets.reduce((a, x) => a + x.reps, 0) : 0;
      if (cur > 0 && cur > prev) prCount += 1;
    }

    const totalReps = finished.exercises.reduce(
      (a, e) => a + e.sets.reduce((b, x) => b + x.reps, 0),
      0
    );
    const totalSets = finished.exercises.reduce(
      (a, e) => a + e.sets.filter((x) => x.reps > 0).length,
      0
    );

    setCelebration({ promotions, totalReps, totalSets, prCount });
  };

  if (!session) return null;

  const warmupPct = Math.round((session.warmupDone.length / WARMUP.length) * 100);
  const totalSets = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const completedSets = session.exercises.reduce(
    (a, e) => a + e.sets.filter((s) => s.reps > 0).length,
    0
  );
  const sessionPct = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;
  const isCompleted = !!session.completedAt;

  const finishLabel = isCompleted
    ? "Session complete"
    : sessionPct === 0
      ? "Start strong"
      : sessionPct < 50
        ? "Keep going"
        : sessionPct < 100
          ? "Finish strong"
          : "Claim your win";

  return (
    <div className="space-y-6">
      {/* Workout header — focused, no motivation/dashboard clutter */}
      <div className="space-y-3">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
        >
          <ChevronLeft className="h-3 w-3" />
          Dashboard
        </button>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              {prettyDate(date)}
            </div>
            <h1 className="font-display text-3xl font-semibold">Today's Workout</h1>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold tabular-nums">{sessionPct}%</div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">
              {completedSets} of {totalSets} sets
            </div>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            className={classNames(
              "h-full rounded-full",
              isCompleted
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                : "bg-gradient-to-r from-indigo-400 to-rose-400"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${sessionPct}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
          />
        </div>
      </div>

      {/* Warmup */}
      <section className="card p-4">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-300">
            <Flame className="h-4 w-4 text-amber-400" /> Warmup
          </h2>
          <span className="text-xs text-zinc-500">{warmupPct}%</span>
        </header>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {WARMUP.map((w) => {
            const done = session.warmupDone.includes(w.name);
            return (
              <button
                key={w.name}
                onClick={() => toggleWarmup(w.name)}
                className={classNames(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition",
                  done
                    ? "border-emerald-400/30 bg-emerald-500/10"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                )}
              >
                <div
                  className={classNames(
                    "text-sm font-medium",
                    done && "line-through text-zinc-400"
                  )}
                >
                  {w.name}
                </div>
                <div className="text-[11px] text-zinc-500">{w.reps}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Strength supersets */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Strength · {STRENGTH_SCHEME.sets}×{STRENGTH_SCHEME.minReps}-{STRENGTH_SCHEME.maxReps}
        </h2>
        {SUPERSET_PAIRS.map(([a, b], pairIdx) => (
          <SupersetCard
            key={pairIdx}
            pairIdx={pairIdx}
            a={a}
            b={b}
            session={session}
            allSessions={allSessions}
            onChange={updateExerciseSets}
          />
        ))}
      </section>

      {/* Core triplet */}
      <section className="card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-300">
          <Sparkles className="h-4 w-4 text-fuchsia-400" /> Core Triplet · {CORE_SCHEME.sets}×{CORE_SCHEME.minReps}-{CORE_SCHEME.maxReps}
        </h2>
        <div className="space-y-4">
          {CORE_TRIPLET.map((slot, i) => {
            const idx = SUPERSET_PAIRS.flat().length + i;
            const ex = session.exercises[idx];
            if (!ex) return null;
            return (
              <div key={slot.id}>
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="text-sm font-medium text-zinc-200">{slot.name}</div>
                  <select
                    className="input max-w-[180px] text-xs"
                    value={ex.variant}
                    onChange={(e) => {
                      const next = { ...session };
                      next.exercises[idx] = { ...ex, variant: e.target.value };
                      save(next);
                    }}
                  >
                    {slot.options.map((o) => (
                      <option key={o.name} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <SetLogger
                  sets={ex.sets}
                  totalSets={CORE_SCHEME.sets}
                  minReps={CORE_SCHEME.minReps}
                  maxReps={CORE_SCHEME.maxReps}
                  onChange={(s) => updateExerciseSets(idx, s)}
                />
              </div>
            );
          })}
        </div>
      </section>

      <button
        onClick={completeSession}
        disabled={isCompleted}
        className="btn-primary w-full disabled:bg-emerald-500/30 disabled:text-emerald-100 disabled:opacity-100"
      >
        <Trophy className="mr-2 h-4 w-4" />
        {finishLabel}
      </button>

      <LevelUpModal
        celebration={celebration}
        onClose={() => {
          setCelebration(null);
          navigate("/");
        }}
      />
    </div>
  );
}

function makeStrengthEntry(id: MovementId, level: number): SessionExercise {
  const m = MOVEMENTS[id];
  const step = m.steps.find((s) => s.level === level) ?? m.steps[0];
  return {
    key: id,
    variant: step.name,
    level,
    sets: Array.from({ length: STRENGTH_SCHEME.sets }, () => ({ reps: 0 })),
  };
}

function SupersetCard({
  pairIdx,
  a,
  b,
  session,
  allSessions,
  onChange,
}: {
  pairIdx: number;
  a: MovementId;
  b: MovementId;
  session: Session;
  allSessions: Session[];
  onChange: (idx: number, sets: { reps: number }[]) => void;
}) {
  const idxA = pairIdx * 2;
  const idxB = idxA + 1;
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2.5">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Pair {pairIdx + 1}
        </div>
        <div className="text-[10px] text-zinc-500">Alternate sets · 90s rest</div>
      </div>
      {[a, b].map((id, i) => {
        const idx = i === 0 ? idxA : idxB;
        const ex = session.exercises[idx];
        const m = MOVEMENTS[id];
        if (!ex) return null;
        const last = lastSessionFor(allSessions, id, session.date);
        const lastTotal = last?.sets.reduce((a, x) => a + x.reps, 0) ?? 0;
        const curTotal = ex.sets.reduce((a, x) => a + x.reps, 0);
        const isPR = lastTotal > 0 && curTotal > lastTotal;

        return (
          <div key={id} className="border-b border-white/5 p-4 last:border-b-0">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-zinc-500">
                  {m.short}
                </div>
                <div className="font-medium">{ex.variant}</div>
                {last ? (
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                    <span>
                      Last time:{" "}
                      <span className="text-zinc-300">
                        {last.sets.map((s) => s.reps).join(", ")}
                      </span>
                    </span>
                    {isPR && (
                      <motion.span
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="pill border border-rose-400/30 bg-rose-500/15 text-rose-200"
                      >
                        PR
                      </motion.span>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 text-[11px] text-zinc-500">
                    First time at this level — set the bar.
                  </div>
                )}
              </div>
              <span className={classNames("pill border", ladderTone(ex.level ?? 1))}>
                Lvl {ex.level ?? 1}
              </span>
            </div>
            <SetLogger
              sets={ex.sets}
              totalSets={STRENGTH_SCHEME.sets}
              minReps={STRENGTH_SCHEME.minReps}
              maxReps={STRENGTH_SCHEME.maxReps}
              onChange={(s) => onChange(idx, s)}
            />
          </div>
        );
      })}
    </div>
  );
}
