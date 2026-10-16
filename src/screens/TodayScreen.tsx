import React from 'react';
import { CourseData, CanvasConfig } from '../types';
import { StarryMascot } from '../components/StarryMascot';
import { Button, Card, Chip, Eyebrow, Ring, EmptyState } from '../components/ui';
import {
  AT_RISK_BELOW,
  courseMastery,
  formatShortDate,
  moduleRange,
  upcomingExams,
  weakestModule,
  UpcomingExam,
} from '../lib/derive';

interface TodayScreenProps {
  courses: CourseData[];
  canvasConfig: CanvasConfig;
  onStartDailySession: (exam?: UpcomingExam) => void;
  onOpenCourse: (course: CourseData) => void;
  onOpenExam: (exam: UpcomingExam) => void;
  onAddClass: () => void;
}

const shortExam = (name: string) => name.split(':')[0].trim();

const dayCount = (n: number) => (n === 0 ? 'today' : n === 1 ? 'tomorrow' : `in ${n} days`);

export const TodayScreen: React.FC<TodayScreenProps> = ({
  courses,
  canvasConfig,
  onStartDailySession,
  onOpenCourse,
  onOpenExam,
  onAddClass,
}) => {
  const exams = upcomingExams(courses);
  const next = exams[0];
  const hasQuestions = courses.some((c) => c.questions.length > 0);

  const scope = `Semester scope: ${formatShortDate(canvasConfig.termStartDate)} – ${formatShortDate(canvasConfig.termEndDate)}`;
  const sync = canvasConfig.isConnected
    ? `Canvas synced ${canvasConfig.lastSyncedAt || 'recently'}`
    : 'Using uploaded files';

  if (courses.length === 0) {
    return (
      <EmptyState
        title="No classes yet"
        body="Add a class or connect Canvas, and your first session will be ready here."
        action={<Button onClick={onAddClass}>Add a class</Button>}
      />
    );
  }

  return (
    <div className="space-y-5">
      <Chip>
        {scope} · {sync}
      </Chip>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Hero */}
        <section className="relative flex flex-col justify-center overflow-hidden rounded-[20px] bg-soft p-6 sm:p-8 sm:pr-56">
          <h1 className="pr-16 text-[30px] leading-[1.1] sm:pr-0 sm:text-[38px]">Let’s lock in today!</h1>
          <p className="mt-3 max-w-md text-[16px] text-muted-strong">
            {next
              ? `Your ${next.course.name} ${shortExam(next.milestone.name)} is ${dayCount(next.daysLeft)}. Today’s session covers what’s on it.`
              : 'No exams on the calendar. Today’s session reviews your weakest topics.'}
          </p>
          <div className="mt-6">
            <Button onClick={() => onStartDailySession(next)} disabled={!hasQuestions}>
              Start Daily Session · 15 min
            </Button>
            {!hasQuestions && (
              <p className="mt-2 text-[13px] text-muted-strong">Upload a file in Sources to create your first questions.</p>
            )}
          </div>
          <div className="pointer-events-none absolute right-3 top-3 sm:hidden" aria-hidden>
            <StarryMascot mood="waving" size={64} />
          </div>
          <div className="pointer-events-none absolute bottom-4 right-6 hidden sm:block" aria-hidden>
            <StarryMascot mood="waving" size={150} speechText="You’ve got this" />
          </div>
        </section>

        {/* Up next */}
        <section aria-labelledby="up-next">
          <Eyebrow className="mb-2">
            <span id="up-next">Up next</span>
          </Eyebrow>
          {exams.length === 0 ? (
            <Card className="p-4 text-[14px] text-muted">No upcoming exams. Add dates in Exams.</Card>
          ) : (
            <ul className="space-y-2.5">
              {exams.slice(0, 4).map((e) => (
                <li key={`${e.course.id}-${e.milestone.id}`}>
                  <button
                    type="button"
                    onClick={() => onOpenExam(e)}
                    className="flex w-full items-center justify-between gap-3 rounded-card border border-card-line bg-white p-4 text-left shadow-card transition-colors hover:border-ink cursor-pointer"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold">
                        {e.course.code} · {shortExam(e.milestone.name)}
                      </span>
                      <span className="block truncate text-[13px] text-muted">
                        {e.milestone.format || [formatShortDate(e.milestone.date), moduleRange(e.milestone)].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    <span className="shrink-0 text-[22px] font-bold tracking-[-0.02em]" aria-label={`${e.daysLeft} days left`}>
                      {e.daysLeft}d
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Mastery rings */}
      <section aria-label="Mastery by course" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => {
          const pct = courseMastery(c);
          const atRisk = pct < AT_RISK_BELOW;
          const weak = weakestModule(c);
          const note =
            pct >= 85 ? 'On track' : atRisk ? `Start early: ${weak?.title || 'first module'}` : `Weakest: ${weak?.title || '—'}`;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onOpenCourse(c)}
              className="flex items-center gap-4 rounded-card border border-card-line bg-white p-4 text-left shadow-card transition-colors hover:border-ink cursor-pointer"
            >
              <Ring value={pct} atRisk={atRisk} label={`${c.name} mastery ${pct}%`} />
              <span className="min-w-0">
                <span className="block truncate text-[16px] font-semibold">{c.name}</span>
                <span className="block truncate text-[13px] text-muted">{note}</span>
              </span>
            </button>
          );
        })}
      </section>
    </div>
  );
};
