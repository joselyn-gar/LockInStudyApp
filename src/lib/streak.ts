// Day-based study streak. A day counts once you answer a question correctly.
import { todayIso } from './derive';

const shiftDay = (iso: string, days: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const yesterdayIso = (today: string = todayIso()) => shiftDay(today, -1);

// Streak after studying today.
export const nextStreak = (streak: number, lastDay: string, today: string = todayIso()) => {
  if (lastDay === today) return Math.max(1, streak);
  if (lastDay === yesterdayIso(today)) return streak + 1;
  return 1;
};

// Streak to show right now: it breaks once a whole day passes with no study.
export const liveStreak = (streak: number, lastDay: string, today: string = todayIso()) =>
  lastDay === today || lastDay === yesterdayIso(today) ? streak : 0;

export const dayLabel = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '');
};
