import React from 'react';
import { Home, CalendarDays, TrendingUp, Gamepad2, Layers, FolderOpen, Settings } from 'lucide-react';
import { StarryMascot } from './StarryMascot';

export type ShellRoute = 'today' | 'exams' | 'forecast' | 'games' | 'mastery' | 'sources';

const NAV: { id: ShellRoute; label: string; icon: React.ElementType }[] = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'exams', label: 'Exams', icon: CalendarDays },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'mastery', label: 'Mastery', icon: Layers },
  { id: 'sources', label: 'Sources', icon: FolderOpen },
];

interface AppShellProps {
  route: ShellRoute;
  onNavigate: (route: ShellRoute) => void;
  streak: number;
  onOpenSettings: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ route, onNavigate, streak, onOpenSettings, children }) => (
  <div className="min-h-dvh bg-bg md:flex">
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
    >
      Skip to content
    </a>

    {/* Laptop: left sidebar */}
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-subtle px-4 py-6 md:flex">
      <button
        type="button"
        onClick={() => onNavigate('today')}
        className="mb-8 flex min-h-11 items-center gap-2 rounded-full px-2 text-left cursor-pointer"
        aria-label="Lock In, go to Today"
      >
        <StarryMascot mood="focused" size={30} />
        <span className="text-[19px] font-bold tracking-[-0.02em]">Lock In</span>
      </button>

      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = route === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 text-[15px] transition-colors cursor-pointer ${
                active
                  ? 'border-card-line bg-white font-semibold text-ink shadow-card'
                  : 'border-transparent text-muted-strong hover:bg-soft hover:text-ink'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-card border border-card-line bg-white p-4 shadow-card">
        <div className="text-[22px] font-bold leading-none tracking-[-0.02em]">
          {streak} {streak === 1 ? 'day' : 'days'}
        </div>
        <div className="mt-1 text-[13px] text-muted">locked-in streak</div>
      </div>
    </aside>

    {/* Phone: top bar */}
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/95 px-4 py-2 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <StarryMascot mood="focused" size={26} />
        <span className="text-[17px] font-bold tracking-[-0.02em]">Lock In</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-soft px-3 py-1 text-[13px] font-semibold text-ink" aria-label={`${streak} day streak`}>
          {streak}d streak
        </span>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted-strong hover:bg-soft cursor-pointer"
        >
          <Settings className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </header>

    <main id="main" className="min-w-0 flex-1 px-4 pb-28 pt-5 md:px-10 md:pb-12 md:pt-8">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="mb-2 hidden justify-end md:flex">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-soft text-muted-strong hover:bg-soft-hover cursor-pointer"
          >
            <Settings className="h-5 w-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </main>

    {/* Phone: bottom tab bar */}
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV.map(({ id, label, icon: Icon }) => {
        const active = route === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] cursor-pointer ${
              active ? 'font-semibold text-ink' : 'text-muted'
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
            {label}
          </button>
        );
      })}
    </nav>
  </div>
);
