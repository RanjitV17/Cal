import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Dumbbell, Play } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "@/db/db";
import { MOVEMENTS, type MovementId } from "@/data/progressions";
import { MotivationHero } from "@/components/MotivationHero";
import { ProgressionStatus } from "@/components/ProgressionStatus";
import { useStore } from "@/store/useStore";
import { prettyDate, todayStr } from "@/lib/util";
import {
  computeStreak,
  pickAffirmation,
  rankFromLevels,
} from "@/lib/motivation";

export function Dashboard() {
  const date = todayStr();
  const navigate = useNavigate();
  const levels = useStore((s) => s.levels);
  const allSessions = useLiveQuery(() => db.sessions.orderBy("date").toArray(), []) ?? [];

  const today = allSessions.find((s) => s.date === date);
  const streak = useMemo(() => computeStreak(allSessions), [allSessions]);
  const rank = useMemo(() => rankFromLevels(levels), [levels]);
  const affirmation = useMemo(
    () => pickAffirmation(streak.current, streak.daysSinceLast),
    [streak]
  );

  const totalSets = today?.exercises.reduce((a, e) => a + e.sets.length, 0) ?? 0;
  const completedSets =
    today?.exercises.reduce((a, e) => a + e.sets.filter((x) => x.reps > 0).length, 0) ?? 0;
  const sessionPct = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;
  const isCompleted = !!today?.completedAt;
  const inProgress = !isCompleted && sessionPct > 0;

  const lowest = (Object.entries(levels) as [MovementId, number][]).sort(
    ([, a], [, b]) => a - b
  )[0];
  const mission = `Crush ${MOVEMENTS[lowest[0]].short}`;

  const cta = isCompleted
    ? { label: "View today's workout", icon: CheckCircle2, sub: "session complete" }
    : inProgress
      ? { label: "Continue workout", icon: Play, sub: `${sessionPct}% done` }
      : { label: "Start today's workout", icon: Dumbbell, sub: "warmup → 3 pairs → core" };

  return (
    <div className="space-y-6">
      <MotivationHero
        date={date}
        streak={streak}
        rank={rank}
        affirmation={affirmation}
        mission={mission}
      />

      <WorkoutCTA cta={cta} isCompleted={isCompleted} onStart={() => navigate("/workout")} />

      <ProgressionStatus sessions={allSessions} levels={levels} />

      <RecentActivity allSessions={allSessions} />
    </div>
  );
}

function WorkoutCTA({
  cta,
  isCompleted,
  onStart,
}: {
  cta: { label: string; icon: typeof Play; sub: string };
  isCompleted: boolean;
  onStart: () => void;
}) {
  const Icon = cta.icon;
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onStart}
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl border border-white/10 p-5 text-left shadow-glow"
      style={{
        background: isCompleted
          ? "linear-gradient(120deg, rgba(16,185,129,0.18), rgba(34,197,94,0.08) 60%, rgba(0,0,0,0) 100%), #0c0c10"
          : "linear-gradient(120deg, rgba(99,102,241,0.22), rgba(244,63,94,0.14) 60%, rgba(0,0,0,0) 100%), #0c0c10",
      }}
    >
      <div
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
          isCompleted ? "bg-emerald-500/25 text-emerald-100" : "bg-indigo-500/25 text-indigo-100"
        }`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-lg font-semibold leading-tight">{cta.label}</div>
        <div className="text-xs text-zinc-400">{cta.sub}</div>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-white" />
    </motion.button>
  );
}

function RecentActivity({ allSessions }: { allSessions: { date: string; completedAt?: number }[] }) {
  const completed = allSessions.filter((s) => s.completedAt).slice(-5).reverse();

  return (
    <section className="card p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Recent
        </h2>
        <span className="text-[11px] text-zinc-500">
          {completed.length} session{completed.length === 1 ? "" : "s"} logged
        </span>
      </header>
      {completed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
          No sessions yet — your first one's on the way.
        </div>
      ) : (
        <ul className="space-y-1.5">
          {completed.map((s) => (
            <li
              key={s.date}
              className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2"
            >
              <span className="text-sm">{prettyDate(s.date)}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
