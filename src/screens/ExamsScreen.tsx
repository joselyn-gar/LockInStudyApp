import React, { useState } from 'react';
import { CourseData, CourseMilestone } from '../types';
import { Button, Card, Chip, EmptyState, PageTitle } from '../components/ui';
import { ExamEditor } from '../components/ExamEditor';
import { daysUntil, formatShortDate, moduleRange } from '../lib/derive';

interface ExamsScreenProps {
  courses: CourseData[];
  onUpdateMilestones: (courseId: string, milestones: CourseMilestone[]) => void;
  onStudyExam: (course: CourseData, milestone: CourseMilestone) => void;
  onAddClass: () => void;
}

export const ExamsScreen: React.FC<ExamsScreenProps> = ({ courses, onUpdateMilestones, onStudyExam, onAddClass }) => {
  const [editing, setEditing] = useState<string | null>(null);

  if (courses.length === 0) {
    return <EmptyState title="No exams yet" body="Add a class first, then put in its exam dates." action={<Button onClick={onAddClass}>Add a class</Button>} />;
  }

  return (
    <div className="space-y-5">
      <PageTitle>Exams</PageTitle>
      {courses.map((c) => {
        const sorted = [...c.milestones].sort((a, b) => a.date.localeCompare(b.date));
        const isEditing = editing === c.id;
        return (
          <Card as="section" key={c.id} className="p-5 sm:p-6" aria-labelledby={`exams-${c.id}`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 id={`exams-${c.id}`} className="text-[19px]">
                  {c.name}
                </h2>
                <p className="text-[13px] text-muted">
                  {c.code} · {c.professor}
                </p>
              </div>
              <Button variant="secondary" onClick={() => setEditing(isEditing ? null : c.id)}>
                {isEditing ? 'Done editing' : 'Edit exams'}
              </Button>
            </div>

            {isEditing ? (
              <ExamEditor course={c} onChange={(ms) => onUpdateMilestones(c.id, ms)} />
            ) : sorted.length === 0 ? (
              <p className="text-[14px] text-muted">No exams yet. Choose Edit exams to add one.</p>
            ) : (
              <ul className="divide-y divide-line">
                {sorted.map((m) => {
                  const days = daysUntil(m.date);
                  const done = m.isCompleted || days < 0;
                  return (
                    <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className={`text-[15px] font-semibold ${done ? 'text-muted' : ''}`}>{m.name}</div>
                        <div className="text-[13px] text-muted">
                          {[formatShortDate(m.date), m.format, moduleRange(m)].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      {done ? (
                        <Chip>Done</Chip>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onStudyExam(c, m)}
                          className="flex min-h-11 items-center gap-3 rounded-full border border-line px-4 text-[14px] font-semibold hover:border-ink cursor-pointer"
                        >
                          <span className="text-muted">{days === 0 ? 'Today' : `${days}d`}</span>
                          Practice
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        );
      })}
    </div>
  );
};
