import React from 'react';
import { CourseData, CourseMilestone } from '../types';
import { Button, Card, Eyebrow, PageTitle } from '../components/ui';
import { upcomingExams, weakestModule } from '../lib/derive';

interface GamesScreenProps {
  courses: CourseData[];
  hasForecast: boolean;
  onDailySession: () => void;
  onExamDrill: (course: CourseData, milestone: CourseMilestone) => void;
  onForecastTop3: () => void;
}

export const GamesScreen: React.FC<GamesScreenProps> = ({ courses, hasForecast, onDailySession, onExamDrill, onForecastTop3 }) => {
  const exams = upcomingExams(courses).slice(0, 3);
  const row =
    'flex w-full min-h-14 items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left hover:border-ink cursor-pointer';

  return (
    <div className="space-y-5">
      <PageTitle>Games</PageTitle>

      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[19px]">Daily Session</h2>
          <p className="text-[14px] text-muted">A warm-up, then 5 questions tuned to how you did. About 15 minutes.</p>
        </div>
        <Button onClick={onDailySession} className="shrink-0">
          Start Daily Session
        </Button>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card className="p-5">
          <Eyebrow className="mb-3">Practice an exam</Eyebrow>
          {exams.length === 0 ? (
            <p className="text-[14px] text-muted">No upcoming exams.</p>
          ) : (
            <div className="space-y-2">
              {exams.map((e) => (
                <button key={`${e.course.id}-${e.milestone.id}`} type="button" className={row} onClick={() => onExamDrill(e.course, e.milestone)}>
                  <span className="min-w-0 truncate text-[15px] font-medium">
                    {e.course.code} · {e.milestone.name}
                  </span>
                  <span className="shrink-0 text-[14px] font-semibold">{e.daysLeft}d</span>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <Eyebrow className="mb-3">Quick picks</Eyebrow>
          <div className="space-y-2">
            <button type="button" className={row} onClick={onForecastTop3} disabled={!hasForecast}>
              <span className="text-[15px] font-medium">Top 3 forecast topics</span>
              <span className="text-[13px] text-muted">3 questions</span>
            </button>
            {courses.map((c) => {
              const weak = weakestModule(c);
              const next = c.milestones.find((m) => !m.isCompleted && weak && m.coverageModules.includes(weak.number));
              if (!weak || !next) return null;
              return (
                <button key={c.id} type="button" className={row} onClick={() => onExamDrill(c, next)}>
                  <span className="min-w-0 truncate text-[15px] font-medium">
                    {c.code} · {weak.title}
                  </span>
                  <span className="shrink-0 text-[13px] text-muted">{weak.masteryPercentage}%</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
