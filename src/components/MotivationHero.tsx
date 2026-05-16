import { Flame, Sparkles, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import type { StreakInfo } from "@/lib/motivation";
import { prettyDate } from "@/lib/util";

type Props = {
  date: string;
  streak: StreakInfo;
  rank: { total: number; max: number; name: string; pct: number };
  affirmation: string;
  mission: string;
};

export function MotivationHero({ date, streak, rank, affirmation, mission }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/5 p-6 shadow-glow"
      style={{
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(244,63,94,0.12) 60%, rgba(0,0,0,0) 100%), radial-gradient(600px 200px at 100% 0%, rgba(244,63,94,0.18), transparent 60%), #0c0c10",
      }}
    >
      {/* Floating sparkle ornament */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(244,63,94,0.25), transparent 60%)",
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
            {prettyDate(date)}
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
            {greeting()}
          </h1>
          <p className="mt-1 max-w-md text-sm italic text-zinc-300">"{affirmation}"</p>
        </div>

        <StreakMedal streak={streak} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat icon={Trophy} label="Rank" value={rank.name} sub={`${rank.total}/${rank.max} XP`} />
        <Stat icon={Flame} label="Streak" value={`${streak.current}d`} sub={streak.longest > streak.current ? `best ${streak.longest}d` : "keep going"} />
        <Stat icon={Target} label="Today" value={mission} sub="your one goal" full />
      </div>
    </motion.div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Let's get strong.";
  if (h < 17) return "Afternoon work.";
  if (h < 21) return "Time to lift.";
  return "One more session.";
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  full,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  sub?: string;
  full?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-black/30 p-3 backdrop-blur ${
        full ? "col-span-2 md:col-span-1" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-semibold leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-zinc-500">{sub}</div>}
    </div>
  );
}

function StreakMedal({ streak }: { streak: StreakInfo }) {
  const fire = streak.current > 0;
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="relative grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/40 backdrop-blur"
    >
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow: fire
            ? "0 0 30px rgba(244,114,182,0.35), inset 0 0 20px rgba(244,114,182,0.15)"
            : "none",
        }}
        animate={fire ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative text-center">
        {fire ? (
          <Flame className="mx-auto h-5 w-5 text-rose-300" />
        ) : (
          <Sparkles className="mx-auto h-5 w-5 text-zinc-500" />
        )}
        <div className="font-display text-xl font-bold leading-none">{streak.current}</div>
        <div className="text-[9px] uppercase tracking-wider text-zinc-400">day{streak.current === 1 ? "" : "s"}</div>
      </div>
    </motion.div>
  );
}
