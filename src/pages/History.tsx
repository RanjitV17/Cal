import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { db } from "@/db/db";
import { MOVEMENTS, MOVEMENT_ORDER, type MovementId } from "@/data/progressions";
import { classNames, prettyDate } from "@/lib/util";

export function History() {
  const sessions = useLiveQuery(() => db.sessions.orderBy("date").reverse().toArray(), []);
  const [movement, setMovement] = useState<MovementId>("pull");

  const chartData = useMemo(() => {
    if (!sessions) return [];
    return [...sessions]
      .reverse()
      .map((s) => {
        const ex = s.exercises.find((e) => e.key === movement);
        if (!ex) return null;
        const total = ex.sets.reduce((a, x) => a + x.reps, 0);
        return { date: s.date.slice(5), reps: total, level: ex.level ?? 1 };
      })
      .filter(Boolean) as { date: string; reps: number; level: number }[];
  }, [sessions, movement]);

  const heatmap = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    const map = new Map<string, number>();
    sessions?.forEach((s) => map.set(s.date, s.exercises.reduce((a, e) => a + e.sets.filter((x) => x.reps > 0).length, 0)));
    const end = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: map.get(key) ?? 0 });
    }
    return days;
  }, [sessions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">History</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Your last 12 weeks of training and per-movement progression.
        </p>
      </div>

      <section className="card p-4">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Activity
          </h2>
          <span className="text-xs text-zinc-500">
            {sessions?.length ?? 0} session{sessions?.length === 1 ? "" : "s"}
          </span>
        </header>
        <div className="grid grid-cols-[repeat(12,minmax(0,1fr))] gap-1 md:grid-cols-[repeat(14,minmax(0,1fr))]">
          {heatmap.map((d) => {
            const intensity = Math.min(4, Math.floor(d.count / 4));
            const colors = [
              "bg-white/[0.04]",
              "bg-indigo-500/20",
              "bg-indigo-500/40",
              "bg-indigo-500/60",
              "bg-indigo-500/90",
            ];
            return (
              <div
                key={d.date}
                title={`${prettyDate(d.date)} · ${d.count} sets`}
                className={classNames("aspect-square rounded-md", colors[intensity])}
              />
            );
          })}
        </div>
      </section>

      <section className="card p-4">
        <header className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Progress
          </h2>
          <div className="no-scrollbar -mr-1 flex max-w-full gap-1 overflow-x-auto">
            {MOVEMENT_ORDER.map((id) => (
              <button
                key={id}
                onClick={() => setMovement(id)}
                className={classNames(
                  "shrink-0 rounded-lg px-3 py-1 text-xs font-medium",
                  movement === id ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {MOVEMENTS[id].short}
              </button>
            ))}
          </div>
        </header>
        <div className="h-64">
          {chartData.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-zinc-500">
              No data yet — log a session on Today to see your chart.
            </div>
          ) : (
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0a0a0b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="reps" stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Recent sessions
        </h2>
        {!sessions?.length ? (
          <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
            Nothing logged yet.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {sessions.slice(0, 8).map((s) => {
              const setsDone = s.exercises.reduce(
                (a, e) => a + e.sets.filter((x) => x.reps > 0).length,
                0
              );
              return (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{prettyDate(s.date)}</div>
                    <div className="text-xs text-zinc-500">
                      {setsDone} sets · {s.completedAt ? "completed" : "in progress"}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {MOVEMENT_ORDER.map((id) => {
                      const ex = s.exercises.find((e) => e.key === id);
                      if (!ex || ex.sets.every((x) => x.reps === 0)) return null;
                      return (
                        <span key={id} className="pill bg-white/[0.04] text-zinc-300">
                          {MOVEMENTS[id].short[0]}
                        </span>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
