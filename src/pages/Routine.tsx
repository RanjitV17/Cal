import {
  CORE_SCHEME,
  CORE_TRIPLET,
  MOVEMENTS,
  STRENGTH_SCHEME,
  SUPERSET_PAIRS,
  WARMUP,
} from "@/data/progressions";
import { useStore } from "@/store/useStore";
import { ladderTone } from "@/lib/util";

export function Routine() {
  const { settings, updateSettings, levels } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Routine</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Based on r/bodyweightfitness Recommended Routine. Adjust rest and units below.
        </p>
      </div>

      <section className="card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Settings
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.02] px-3 py-2.5">
            <span className="text-sm">Rest between sets</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.restSeconds}
                onChange={(e) => updateSettings({ restSeconds: Number(e.target.value) || 0 })}
                className="input w-20 text-right"
                min={0}
                step={15}
              />
              <span className="text-xs text-zinc-500">sec</span>
            </div>
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.02] px-3 py-2.5">
            <span className="text-sm">Units</span>
            <button
              onClick={() => updateSettings({ unitsMetric: !settings.unitsMetric })}
              className="btn-ghost text-xs"
            >
              {settings.unitsMetric ? "Metric (kg)" : "Imperial (lb)"}
            </button>
          </label>
        </div>
      </section>

      <section className="card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Warmup
        </h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {WARMUP.map((w) => (
            <li
              key={w.name}
              className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2 text-sm"
            >
              <span>{w.name}</span>
              <span className="text-xs text-zinc-500">{w.reps}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Strength · {STRENGTH_SCHEME.sets}×{STRENGTH_SCHEME.minReps}-{STRENGTH_SCHEME.maxReps}
        </h2>
        <div className="space-y-2">
          {SUPERSET_PAIRS.map(([a, b], i) => (
            <div key={i} className="rounded-xl bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Pair {i + 1}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {[a, b].map((id) => (
                  <div key={id} className="flex items-center gap-2">
                    <span className="text-sm font-medium">{MOVEMENTS[id].name}</span>
                    <span className={`pill border ${ladderTone(levels[id])}`}>Lvl {levels[id]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Core Triplet · {CORE_SCHEME.sets}×{CORE_SCHEME.minReps}-{CORE_SCHEME.maxReps}
        </h2>
        <ul className="grid gap-2 md:grid-cols-3">
          {CORE_TRIPLET.map((slot) => (
            <li key={slot.id} className="rounded-xl bg-white/[0.02] p-3">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">{slot.name}</div>
              <div className="mt-1 text-sm">{slot.options.map((o) => o.name).join(" · ")}</div>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-center text-xs text-zinc-600">
        Source:{" "}
        <a
          href="https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-zinc-400"
        >
          r/bodyweightfitness Recommended Routine
        </a>
      </p>
    </div>
  );
}
