import { NavLink } from "react-router-dom";
import { CalendarRange, Dumbbell, History, Home, Layers } from "lucide-react";
import { classNames } from "@/lib/util";

const links = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/workout", label: "Workout", icon: Dumbbell, end: false },
  { to: "/progressions", label: "Ladders", icon: Layers, end: false },
  { to: "/history", label: "History", icon: History, end: false },
  { to: "/routine", label: "Routine", icon: CalendarRange, end: false },
];

export function Nav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 border-t border-white/5 bg-zinc-950/85 backdrop-blur
                 md:static md:border-none md:bg-transparent md:backdrop-blur-0"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="mx-auto flex max-w-3xl items-stretch justify-around px-2 py-1
                   md:max-w-none md:justify-start md:gap-2 md:px-0 md:py-2"
      >
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                classNames(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium md:flex-none md:flex-row md:gap-2 md:text-sm",
                  isActive
                    ? "text-white bg-white/[0.06]"
                    : "text-zinc-400 hover:text-zinc-200"
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{l.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
