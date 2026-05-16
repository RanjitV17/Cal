import { useState } from "react";
import { Check, ChevronDown, Lock, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Movement } from "@/data/progressions";
import { classNames, ladderTone } from "@/lib/util";

type Props = {
  movement: Movement;
  currentLevel: number;
  onSelectLevel?: (level: number) => void;
  defaultOpen?: boolean;
  readiness?: number; // 0..1
  nextHint?: string;
};

export function ProgressionLadder({
  movement,
  currentLevel,
  onSelectLevel,
  defaultOpen = false,
  readiness,
  nextHint,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const currentStep = movement.steps.find((s) => s.level === currentLevel);
  const nextStep = movement.steps.find((s) => s.level === currentLevel + 1);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-white/[0.02]"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-wider text-zinc-500">
            {movement.pattern}
          </div>
          <div className="font-display text-lg font-semibold">{movement.name}</div>
          {!open && currentStep && (
            <div className="mt-1 space-y-1">
              <div className="truncate text-xs text-zinc-400">
                Now: <span className="text-zinc-200">{currentStep.name}</span>
                {nextStep && (
                  <>
                    <span className="text-zinc-600"> → </span>
                    <span className="text-zinc-400">{nextStep.name}</span>
                  </>
                )}
              </div>
              {typeof readiness === "number" && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className={classNames(
                        "h-full rounded-full",
                        readiness >= 1
                          ? "bg-emerald-400"
                          : "bg-gradient-to-r from-indigo-400 to-rose-400"
                      )}
                      style={{ width: `${Math.round(readiness * 100)}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-[10px] tabular-nums text-zinc-500">
                    {Math.round(readiness * 100)}%
                  </span>
                </div>
              )}
              {nextHint && !open && (
                <div className="truncate text-[11px] text-zinc-500">{nextHint}</div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={classNames("pill border", ladderTone(currentLevel))}>
            Level {toRoman(currentLevel)}
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="grid h-7 w-7 place-items-center rounded-lg text-zinc-400"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="ladder-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/5"
          >
            <ol className="divide-y divide-white/5">
        {movement.steps.map((step) => {
          const isCurrent = step.level === currentLevel;
          const isDone = step.level < currentLevel;
          const isLocked = step.level > currentLevel + 1;
          return (
            <li key={step.level}>
              <button
                disabled={isLocked && !onSelectLevel}
                onClick={() => onSelectLevel?.(step.level)}
                className={classNames(
                  "group flex w-full items-center gap-4 p-3 text-left transition",
                  isCurrent && "bg-white/[0.04]",
                  !isLocked && "hover:bg-white/[0.04]"
                )}
              >
                <motion.div
                  layout
                  className={classNames(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-xs font-semibold",
                    isDone && "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
                    isCurrent && ladderTone(step.level),
                    !isDone && !isCurrent && "bg-white/[0.03] text-zinc-400 border-white/5"
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" />
                  ) : isLocked ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    toRoman(step.level)
                  )}
                </motion.div>
                <div className="min-w-0 flex-1">
                  <div
                    className={classNames(
                      "truncate text-sm",
                      isCurrent ? "font-semibold text-white" : "text-zinc-200",
                      isLocked && "text-zinc-500"
                    )}
                  >
                    {step.name}
                  </div>
                  {step.cues && (
                    <div className="truncate text-xs text-zinc-500">{step.cues}</div>
                  )}
                </div>
                {step.video && (
                  <a
                    href={step.video}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.04] text-zinc-300 hover:bg-white/[0.1] hover:text-white"
                    aria-label="watch tutorial"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </a>
                )}
              </button>
            </li>
          );
        })}
      </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function toRoman(n: number) {
  return ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"][n - 1] ?? String(n);
}
