import React from 'react';
import { CourseData } from '../types';
import type { SessionResult } from '../components/GameSession';
import { StarryMascot } from '../components/StarryMascot';
import { Button, Card, Eyebrow, MasteryTag, PageTitle } from '../components/ui';
import { courseMastery, masteryLevel } from '../lib/derive';

interface ResultsScreenProps {
  course: CourseData;
  result: SessionResult;
  readinessBefore: number;
  onKeepGoing: () => void;
  onDone: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ course, result, readinessBefore, onKeepGoing, onDone }) => {
  const after = courseMastery(course);
  const touched = course.modules.filter((m) => result.moduleIds.includes(m.id));
  const topics = touched.length ? touched : course.modules;

  return (
    <div className="space-y-5">
      <PageTitle>Session complete</PageTitle>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <StarryMascot mood="triumphant" size={130} className="shrink-0" />
          <div className="w-full">
            <Eyebrow>Exam readiness</Eyebrow>
            <div
              className="mt-1 flex items-baseline gap-x-3 whitespace-nowrap text-[40px] font-bold leading-none tracking-[-0.03em] sm:text-[48px]"
              aria-label={`Exam readiness went from ${readinessBefore}% to ${after}%`}
            >
              <span>{readinessBefore}%</span>
              <span className="text-[28px] font-normal" aria-hidden>
                →
              </span>
              <span>{after}%</span>
            </div>
            <p className="mt-3 text-[15px] text-muted">
              {result.correct} of {result.answered} correct · {result.minutes} {result.minutes === 1 ? 'minute' : 'minutes'} · +{result.xp} XP
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={onKeepGoing}>Keep going</Button>
              <Button variant="secondary" onClick={onDone}>
                Done for today
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <Eyebrow>Mastery by topic</Eyebrow>
          <ul className="mt-2 divide-y divide-line">
            {topics.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-3.5">
                <span className="min-w-0 text-[15px]">{m.title}</span>
                <MasteryTag level={masteryLevel(m.masteryPercentage)} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
