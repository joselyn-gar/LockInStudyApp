import React from 'react';
import { Pencil } from 'lucide-react';
import { CanvasConfig, CourseData, EmbeddedFileItem, StudyQuestion } from '../types';
import { Button, Card, Chip, Eyebrow, PageTitle } from '../components/ui';
import { FileEmbedSection } from '../components/FileEmbedSection';

interface SourcesScreenProps {
  courses: CourseData[];
  activeCourse: CourseData | null;
  canvasConfig: CanvasConfig;
  isSyncing: boolean;
  syncMessage: string;
  onSelectCourse: (course: CourseData) => void;
  onAddClass: () => void;
  onEditClass: (course: CourseData) => void;
  onOpenCanvasSettings: () => void;
  onSyncNow: () => void;
  onAddFile: (file: EmbeddedFileItem, questions?: StudyQuestion[]) => void;
  onRemoveFile: (fileId: string) => void;
  onLoadSample: () => void;
  onReset: () => void;
}

export const SourcesScreen: React.FC<SourcesScreenProps> = ({
  courses,
  activeCourse,
  canvasConfig,
  isSyncing,
  syncMessage,
  onSelectCourse,
  onAddClass,
  onEditClass,
  onOpenCanvasSettings,
  onSyncNow,
  onAddFile,
  onRemoveFile,
  onLoadSample,
  onReset,
}) => (
  <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <PageTitle>Sources</PageTitle>
      <Button onClick={onAddClass}>Add a class</Button>
    </div>

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* Canvas */}
      <Card as="section" className="p-5 sm:p-6" aria-labelledby="canvas-h">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="canvas-h" className="text-[19px]">
              Canvas
            </h2>
            <p className="text-[14px] text-muted">
              {canvasConfig.isConnected
                ? `${canvasConfig.domain} · synced ${canvasConfig.lastSyncedAt || 'recently'}`
                : 'Not connected. Add a Canvas access token to pull classes and due dates.'}
            </p>
          </div>
          <Chip dark={canvasConfig.isConnected}>
            {canvasConfig.isConnected ? 'Connected' : 'Off'}
          </Chip>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onSyncNow} disabled={isSyncing || !canvasConfig.patToken}>
            {isSyncing ? 'Syncing…' : 'Sync now'}
          </Button>
          <Button variant="ghost" onClick={onOpenCanvasSettings}>
            Canvas settings
          </Button>
        </div>
        {syncMessage && (
          <p className="mt-3 text-[13px] text-muted-strong" role="status">
            {syncMessage}
          </p>
        )}
      </Card>

      {/* Classes */}
      <Card as="section" className="p-5 sm:p-6" aria-labelledby="classes-h">
        <h2 id="classes-h" className="text-[19px]">
          Classes
        </h2>
        {courses.length === 0 ? (
          <p className="mt-1 text-[14px] text-muted">No classes yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {courses.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                <button
                  type="button"
                  onClick={() => onSelectCourse(c)}
                  aria-pressed={activeCourse?.id === c.id}
                  className="min-h-11 min-w-0 flex-1 text-left cursor-pointer"
                >
                  <span className={`block truncate text-[15px] ${activeCourse?.id === c.id ? 'font-bold' : 'font-medium'}`}>
                    {c.code} · {c.name}
                  </span>
                  <span className="block text-[13px] text-muted">
                    {c.questions.length} questions · {(c.embeddedFiles || []).length} files
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditClass(c)}
                  aria-label={`Edit ${c.name}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-soft hover:text-ink cursor-pointer"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>

    {/* Uploads */}
    {activeCourse ? (
      <FileEmbedSection
        courseCode={activeCourse.code}
        files={activeCourse.embeddedFiles || []}
        onAddFile={onAddFile}
        onRemoveFile={onRemoveFile}
        availableCourses={courses.map((c) => ({ code: c.code, name: c.name }))}
        onCourseChange={(code) => {
          const found = courses.find((c) => c.code === code);
          if (found) onSelectCourse(found);
        }}
        onAddNewClass={onAddClass}
      />
    ) : (
      <Card className="p-6 text-[14px] text-muted">Add a class to start uploading files.</Card>
    )}

    {/* Notes and past exams already ingested */}
    {activeCourse && (activeCourse.lectureNotes.length > 0 || activeCourse.pastExams.length > 0) && (
      <Card as="section" className="p-5 sm:p-6" aria-labelledby="notes-h">
        <h2 id="notes-h" className="text-[19px]">
          What Lock In has read for {activeCourse.code}
        </h2>
        {activeCourse.lectureNotes.length > 0 && (
          <>
            <Eyebrow className="mb-2 mt-4">Lecture notes</Eyebrow>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {activeCourse.lectureNotes.map((ln) => (
                <li key={ln.id} className="rounded-xl border border-line p-4">
                  <div className="text-[12px] text-muted">
                    Lecture {ln.lectureNumber} · {ln.slideReference}
                  </div>
                  <div className="mt-0.5 text-[15px] font-semibold">{ln.title}</div>
                  <p className="mt-1 text-[14px] text-muted-strong">{ln.professorFraming}</p>
                </li>
              ))}
            </ul>
          </>
        )}
        {activeCourse.pastExams.length > 0 && (
          <>
            <Eyebrow className="mb-2 mt-5">Past exam questions</Eyebrow>
            <ul className="divide-y divide-line">
              {activeCourse.pastExams.map((pe) => (
                <li key={pe.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="text-[12px] text-muted">
                      {pe.semester} · {pe.examName} · {pe.questionNumber}
                    </div>
                    <p className="text-[14px] font-medium">{pe.questionText}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[17px] font-bold">{pe.historicalMissRate}%</div>
                    <div className="text-[11px] text-muted">missed it</div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    )}

    <div className="flex flex-wrap gap-2 pt-2">
      <Button variant="ghost" onClick={onLoadSample}>
        Load sample classes
      </Button>
      <Button variant="ghost" onClick={onReset}>
        Reset everything
      </Button>
    </div>
  </div>
);
