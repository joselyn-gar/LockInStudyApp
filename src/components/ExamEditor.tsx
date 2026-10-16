import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { CourseData, CourseMilestone } from '../types';

interface ExamEditorProps {
  course: CourseData;
  onChange: (milestones: CourseMilestone[]) => void;
}

const field =
  'min-h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px] text-ink placeholder:text-muted focus:border-ink focus:outline-none';

export const ExamEditor: React.FC<ExamEditorProps> = ({ course, onChange }) => {
  const update = (id: string, patch: Partial<CourseMilestone>) =>
    onChange(course.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const add = () =>
    onChange([
      ...course.milestones,
      {
        id: `m-${Date.now()}`,
        name: 'New exam',
        date: course.endDate || '',
        isCompleted: false,
        coverageModules: course.modules.map((m) => m.number),
      },
    ]);

  return (
    <div className="space-y-3">
      {course.milestones.length === 0 && <p className="text-[14px] text-muted">No exams yet.</p>}
      {course.milestones.map((m) => (
        <fieldset key={m.id} className="grid grid-cols-1 gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1.4fr_150px_1.2fr_auto]">
          <legend className="sr-only">{m.name}</legend>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Exam</span>
            <input className={field} value={m.name} onChange={(e) => update(m.id, { name: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Date</span>
            <input type="date" className={field} value={m.date} onChange={(e) => update(m.id, { date: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Format</span>
            <input
              className={field}
              placeholder="Multiple choice + short answer"
              value={m.format || ''}
              onChange={(e) => update(m.id, { format: e.target.value })}
            />
          </label>
          <div className="flex items-end gap-1">
            <label className="flex min-h-11 items-center gap-2 px-2 text-[13px] text-muted-strong cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 accent-ink"
                checked={m.isCompleted}
                onChange={(e) => update(m.id, { isCompleted: e.target.checked })}
              />
              Done
            </label>
            <button
              type="button"
              onClick={() => onChange(course.milestones.filter((x) => x.id !== m.id))}
              aria-label={`Remove ${m.name}`}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-soft hover:text-ink cursor-pointer"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex min-h-11 items-center gap-2 rounded-full px-3 text-[14px] font-semibold text-ink hover:bg-soft cursor-pointer"
      >
        <Plus className="h-4 w-4" aria-hidden /> Add exam
      </button>
    </div>
  );
};
