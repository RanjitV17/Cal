import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { MOVEMENTS, MOVEMENT_ORDER } from "@/data/progressions";
import { ProgressionLadder } from "@/components/ProgressionLadder";
import { useStore } from "@/store/useStore";
import { db } from "@/db/db";
import { graduationStatus } from "@/lib/graduation";

export function Progressions() {
  const levels = useStore((s) => s.levels);
  const setLevel = useStore((s) => s.setLevel);
  const [allOpen, setAllOpen] = useState(false);
  const [bump, setBump] = useState(0); // force remount to reset internal open state on toggle
  const sessions = useLiveQuery(() => db.sessions.orderBy("date").toArray(), []) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Progression Ladders</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Each pattern has 8 levels. Hit the top of the rep range across all sets to graduate.
          </p>
        </div>
        <button
          onClick={() => {
            setAllOpen((v) => !v);
            setBump((b) => b + 1);
          }}
          className="btn-ghost shrink-0 text-xs"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {MOVEMENT_ORDER.map((id) => {
          const status = graduationStatus(id, levels[id], sessions);
          return (
            <ProgressionLadder
              key={`${id}-${bump}`}
              movement={MOVEMENTS[id]}
              currentLevel={levels[id]}
              onSelectLevel={(lvl) => setLevel(id, lvl)}
              defaultOpen={allOpen}
              readiness={status.readiness}
              nextHint={status.nextStepHint}
            />
          );
        })}
      </div>
    </div>
  );
}
