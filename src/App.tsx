import { Route, Routes } from "react-router-dom";
import { Nav } from "@/components/Nav";
import { Dashboard } from "@/pages/Dashboard";
import { Workout } from "@/pages/Workout";
import { Progressions } from "@/pages/Progressions";
import { History } from "@/pages/History";
import { Routine } from "@/pages/Routine";

export default function App() {
  return (
    <div className="min-h-full">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-24 pt-6 md:max-w-5xl md:flex-row md:gap-8 md:px-8 md:pb-8">
        <aside className="md:sticky md:top-8 md:h-[calc(100vh-4rem)] md:w-52 md:shrink-0">
          <header className="mb-6 flex items-center gap-3 md:mb-8">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 shadow-glow">
              <span className="text-sm font-black text-white">L</span>
            </div>
            <div>
              <div className="font-display text-lg font-semibold leading-none">Ladder</div>
              <div className="text-xs text-zinc-500">Bodyweight Tracker</div>
            </div>
          </header>
          <div className="hidden md:block">
            <Nav />
          </div>
        </aside>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/progressions" element={<Progressions />} />
            <Route path="/history" element={<History />} />
            <Route path="/routine" element={<Routine />} />
          </Routes>
        </main>
        <div className="md:hidden">
          <Nav />
        </div>
      </div>
    </div>
  );
}
