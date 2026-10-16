import React from 'react';
import { RefreshCw } from 'lucide-react';
import { CourseData, ForecastItem } from '../types';
import { Bar, Button, Card, Chip, Eyebrow, EmptyState, PageTitle } from '../components/ui';
import { formatShortDate, nextExamFor, sourceTags } from '../lib/derive';

interface ForecastScreenProps {
  course: CourseData | null;
  courses: CourseData[];
  forecasts: ForecastItem[];
  isGenerating: boolean;
  forecastError: string;
  onSelectCourse: (course: CourseData) => void;
  onRefresh: () => void;
  onPlayTop3: () => void;
}

export const ForecastScreen: React.FC<ForecastScreenProps> = ({
  course,
  courses,
  forecasts,
  isGenerating,
  forecastError,
  onSelectCourse,
  onRefresh,
  onPlayTop3,
}) => {
  if (!course) {
    return <EmptyState title="No class selected" body="Add a class in Sources to see what’s likely on your exam." />;
  }

  const next = nextExamFor(course);
  const sorted = [...forecasts].sort((a, b) => b.probabilityScore - a.probabilityScore);
  const top = sorted[0];
  const tags = sourceTags(course);

  return (
    <div className="space-y-5">
      {courses.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a class">
          {courses.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCourse(c)}
              aria-pressed={c.id === course.id}
              className={`min-h-11 rounded-full border px-4 text-[14px] font-medium cursor-pointer ${
                c.id === course.id ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink'
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      )}

      <div>
        <Chip className="mb-3 font-semibold !text-ink">
          {[course.name, next?.milestone.name, next && formatShortDate(next.milestone.date)].filter(Boolean).join(' · ')}
        </Chip>
        <PageTitle>What’s likely on your exam</PageTitle>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="h-fit p-2 sm:p-3">
          {isGenerating && sorted.length === 0 ? (
            <div className="space-y-3 p-4" aria-live="polite">
              <p className="text-muted">Reading your notes and past exams…</p>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-soft" />
              ))}
            </div>
          ) : forecastError && sorted.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-semibold">Couldn’t build a forecast.</p>
              <p className="mt-1 text-muted">{forecastError}</p>
              <Button variant="secondary" className="mt-4" onClick={onRefresh}>
                Try again
              </Button>
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-semibold">No forecast yet.</p>
              <p className="mt-1 text-muted">Add lecture notes or past exams in Sources, then refresh.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {sorted.map((fc) => (
                <li key={fc.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-3 py-4 sm:grid-cols-[minmax(0,1fr)_140px_52px]">
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold">{fc.topic}</div>
                    <div className="truncate text-[13px] text-muted">
                      {[fc.lectureNoteAnchor, fc.pastExamAnchor].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <div className="order-3 col-span-2 sm:order-none sm:col-span-1">
                    <Bar value={fc.probabilityScore} muted={fc.probabilityScore < 30} label={`${fc.topic} likelihood`} />
                  </div>
                  <div className="text-right text-[17px] font-bold">{fc.probabilityScore}%</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          {top && (
            <section className="rounded-card bg-ink p-5 text-white">
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold">
                Professor-specific guidance
              </span>
              <h2 className="mt-3 text-[19px] leading-snug">How {course.professor} tests</h2>
              <p className="mt-2 text-[14px] text-white/80">{top.whyWillBeTested || top.professorFraming}</p>
            </section>
          )}

          <Card className="p-5">
            <Eyebrow>Built from</Eyebrow>
            {tags.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Chip key={t} className="font-semibold !text-ink">
                    {t}
                  </Chip>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[14px] text-muted">Nothing yet. Add files in Sources.</p>
            )}
          </Card>

          <Button full onClick={onPlayTop3} disabled={sorted.length === 0}>
            Play the top 3 topics
          </Button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isGenerating}
            className="mx-auto flex min-h-11 items-center gap-2 rounded-full px-4 text-[14px] text-muted-strong hover:bg-soft disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} aria-hidden />
            {isGenerating ? 'Refreshing…' : 'Refresh forecast'}
          </button>
        </div>
      </div>
    </div>
  );
};
