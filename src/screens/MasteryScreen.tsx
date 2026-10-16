import React from 'react';
import { CourseData, DailyProgressPoint } from '../types';
import { Bar, Card, Eyebrow, MasteryTag, PageTitle, Ring, EmptyState } from '../components/ui';
import { AT_RISK_BELOW, courseMastery, masteryLevel } from '../lib/derive';

interface MasteryScreenProps {
  courses: CourseData[];
  totalXp: number;
  history: DailyProgressPoint[];
}

export const MasteryScreen: React.FC<MasteryScreenProps> = ({ courses, totalXp, history }) => {
  if (courses.length === 0) return <EmptyState title="Nothing to measure yet" body="Play a session and your mastery shows up here." />;

  const recent = history.slice(-7);
  const maxXp = Math.max(1, ...recent.map((d) => d.xpEarned));

  return (
    <div className="space-y-5">
      <PageTitle>Mastery</PageTitle>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {courses.map((c) => {
            const pct = courseMastery(c);
            return (
              <Card as="section" key={c.id} className="p-5 sm:p-6" aria-labelledby={`m-${c.id}`}>
                <div className="mb-4 flex items-center gap-4">
                  <Ring value={pct} atRisk={pct < AT_RISK_BELOW} size={56} label={`${c.name} mastery ${pct}%`} />
                  <div>
                    <h2 id={`m-${c.id}`} className="text-[19px]">
                      {c.name}
                    </h2>
                    <p className="text-[13px] text-muted">{c.modules.length} modules</p>
                  </div>
                </div>
                <ul className="divide-y divide-line">
                  {c.modules.map((m) => (
                    <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[minmax(0,1fr)_160px_auto]">
                      <span className="min-w-0 text-[15px]">
                        <span className="text-muted">{m.number}. </span>
                        {m.title}
                      </span>
                      <span className="order-3 col-span-2 sm:order-none sm:col-span-1">
                        <Bar value={m.masteryPercentage} label={`${m.title} ${m.masteryPercentage}%`} />
                      </span>
                      <MasteryTag level={masteryLevel(m.masteryPercentage)} />
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <Card className="h-fit p-5">
          <Eyebrow>Last 7 days</Eyebrow>
          <div className="mt-1 text-[28px] font-bold tracking-[-0.02em]">{totalXp} XP</div>
          {recent.length === 0 ? (
            <p className="mt-2 text-[14px] text-muted">No sessions yet.</p>
          ) : (
            <ul className="mt-4 flex h-32 items-end gap-2" aria-label="XP earned per day">
              {recent.map((d) => (
                <li key={d.fullDate || d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className="w-full rounded-md bg-ink"
                    style={{ height: `${Math.max(4, (d.xpEarned / maxXp) * 100)}%` }}
                    title={`${d.date}: ${d.xpEarned} XP`}
                  />
                  <span className="text-[11px] text-muted">{(d.date || '').slice(0, 3)}</span>
                  <span className="sr-only">
                    {d.date}: {d.xpEarned} XP
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};
