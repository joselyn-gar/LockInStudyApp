import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { CanvasConfig, CourseData, EmbeddedFileItem, MilestoneMode, StudyQuestion } from '../types';
import { INITIAL_AVAILABLE_COURSES } from '../data/defaultCourseData';
import { StarryMascot } from '../components/StarryMascot';
import { PatHelpTooltip } from '../components/PatHelpTooltip';
import { FileEmbedSection } from '../components/FileEmbedSection';
import { ClassEditModal } from '../components/ClassEditModal';
import { ExamEditor } from '../components/ExamEditor';
import { Button, Card, Chip } from '../components/ui';

type Source = 'canvas' | 'upload';
type Step = 'welcome' | 'source' | 'canvas' | 'exams' | 'scope';

interface SetupFlowProps {
  initialConfig: CanvasConfig;
  initialCourses: CourseData[];
  onComplete: (courses: CourseData[], active: CourseData, config: CanvasConfig, mode: MilestoneMode) => void;
  onUseSample: () => void;
}

const STEP_NUMBER: Record<Step, number> = { welcome: 0, source: 1, canvas: 1, exams: 2, scope: 3 };

const field =
  'min-h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px] text-ink placeholder:text-muted focus:border-ink focus:outline-none';

export const SetupFlow: React.FC<SetupFlowProps> = ({ initialConfig, initialCourses, onComplete, onUseSample }) => {
  const [step, setStep] = useState<Step>(initialCourses.length ? 'source' : 'welcome');
  const [source, setSource] = useState<Source>('canvas');
  const [config, setConfig] = useState<CanvasConfig>(initialConfig);
  const [courses, setCourses] = useState<CourseData[]>(initialCourses);
  const [selected, setSelected] = useState<string[]>(initialCourses.map((c) => c.id));
  const [mode, setMode] = useState<MilestoneMode>('post_exam_only');
  const [uploadTarget, setUploadTarget] = useState<string>(initialCourses[0]?.code || '');
  const [classModal, setClassModal] = useState<{ open: boolean; course: CourseData | null }>({ open: false, course: null });
  const [checking, setChecking] = useState(false);
  const [canvasMessage, setCanvasMessage] = useState('');

  const n = STEP_NUMBER[step];
  const chosen = courses.filter((c) => selected.includes(c.id));

  const saveCourse = (c: CourseData) => {
    setCourses((prev) => (prev.some((p) => p.id === c.id) ? prev.map((p) => (p.id === c.id ? c : p)) : [...prev, c]));
    setSelected((prev) => (prev.includes(c.id) ? prev : [...prev, c.id]));
    if (!uploadTarget) setUploadTarget(c.code);
    setClassModal({ open: false, course: null });
  };

  const addFile = (file: EmbeddedFileItem, qs?: StudyQuestion[]) =>
    setCourses((prev) =>
      prev.map((c) =>
        c.code === file.courseCode
          ? { ...c, embeddedFiles: [file, ...(c.embeddedFiles || [])], questions: qs?.length ? [...qs, ...c.questions] : c.questions }
          : c
      )
    );

  const removeFile = (id: string) =>
    setCourses((prev) => prev.map((c) => ({ ...c, embeddedFiles: (c.embeddedFiles || []).filter((f) => f.id !== id) })));

  const connectCanvas = async () => {
    setChecking(true);
    setCanvasMessage('');
    try {
      const res = await fetch('/api/canvas/test-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: config.patToken, domain: config.domain }),
      });
      const data = await res.json();
      if (data.success && data.live) {
        setConfig((c) => ({
          ...c,
          isConnected: true,
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        }));
        setStep('exams');
      } else if (data.success) {
        setCanvasMessage('Saved your token, but Canvas didn’t answer from here. You can add classes by hand for now.');
      } else {
        setCanvasMessage(data.error || 'That token didn’t work. Check it and try again.');
      }
    } catch {
      setCanvasMessage('Couldn’t reach the Lock In server. Check your connection.');
    } finally {
      setChecking(false);
    }
  };

  const finish = () => {
    const withFiles = chosen.length ? chosen : courses;
    if (!withFiles.length) return;
    onComplete(withFiles, withFiles[0], config, mode);
  };

  return (
    <div className="min-h-dvh bg-bg">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-8">
        <div className="flex items-center gap-2">
          <StarryMascot mood="focused" size={30} />
          <span className="text-[19px] font-bold tracking-[-0.02em]">Lock In</span>
        </div>
        {n > 0 && <Chip>Step {n} of 3 · Set up your semester</Chip>}
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-4 text-center sm:pt-8">
        {step === 'welcome' && (
          <>
            <StarryMascot mood="waving" size={150} className="mx-auto" />
            <h1 className="mt-4 text-[32px] leading-tight sm:text-[40px]">Hi, I’m Starry.</h1>
            <p className="mx-auto mt-2 max-w-md text-[16px] text-muted">
              Tell me where your classes live. I’ll turn them into 15-minute games built around your next exam.
            </p>
            <div className="mt-8 flex flex-col items-center gap-2">
              <Button onClick={() => setStep('source')} className="px-8">
                Get started
              </Button>
              <Button variant="ghost" onClick={onUseSample}>
                Try it with sample classes
              </Button>
            </div>
          </>
        )}

        {step === 'source' && (
          <>
            <StarryMascot mood="thinking" size={90} className="mx-auto" />
            <h1 className="mt-3 text-[30px] leading-tight sm:text-[40px]">Where should I study from?</h1>
            <p className="mx-auto mt-2 max-w-xl text-[16px] text-muted">
              Pick a source once. Lock In keeps your exams, readings and assignments in sync, so you never re-prompt.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2" role="radiogroup" aria-label="Study source">
              {(
                [
                  {
                    id: 'canvas' as Source,
                    glyph: 'C',
                    title: 'Sync with Canvas',
                    sub: 'Recommended',
                    points: ['Pulls syllabi, due dates and exam dates', 'Reads slides, readings and past quizzes', 'Updates as your professor posts'],
                  },
                  {
                    id: 'upload' as Source,
                    glyph: '↑',
                    title: 'Upload files',
                    sub: 'PDF, slides, notes',
                    points: ['Drop in a study guide or lecture deck', 'Add your exam date and format', 'Works for any class, any school'],
                  },
                ]
              ).map((o) => {
                const on = source === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setSource(o.id)}
                    className={`rounded-[20px] border bg-white p-6 text-left transition-colors cursor-pointer ${
                      on ? 'border-2 border-ink' : 'border-2 border-line hover:border-muted'
                    }`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-soft text-[18px] font-bold" aria-hidden>
                      {o.glyph}
                    </span>
                    <span className="mt-4 block text-[19px] font-bold tracking-[-0.02em]">{o.title}</span>
                    <span className="block text-[14px] text-muted">{o.sub}</span>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-[14px] text-muted-strong">
                      {o.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <Button className="mt-8 px-8" onClick={() => setStep(source === 'canvas' ? 'canvas' : 'exams')}>
              {source === 'canvas' ? 'Connect Canvas' : 'Upload files'}
            </Button>
          </>
        )}

        {step === 'canvas' && (
          <>
            <h1 className="text-[30px] leading-tight sm:text-[36px]">Connect Canvas</h1>
            <p className="mx-auto mt-2 max-w-md text-[16px] text-muted">Your school’s Canvas address and a personal access token.</p>
            <Card className="mx-auto mt-6 max-w-lg space-y-4 p-6 text-left">
              <label className="block">
                <span className="mb-1 block text-[13px] font-medium">Canvas address</span>
                <input
                  className={field}
                  value={config.domain}
                  onChange={(e) => setConfig({ ...config, domain: e.target.value })}
                  placeholder="canvas.yourschool.edu"
                  autoComplete="url"
                />
              </label>
              <label className="block">
                <span className="mb-1 flex items-center text-[13px] font-medium">
                  Access token <PatHelpTooltip />
                </span>
                <input
                  type="password"
                  className={`${field} font-mono`}
                  value={config.patToken}
                  onChange={(e) => setConfig({ ...config, patToken: e.target.value })}
                  placeholder="Paste your token"
                  autoComplete="off"
                />
              </label>
              {canvasMessage && (
                <p className="text-[14px] text-muted-strong" role="status">
                  {canvasMessage}
                </p>
              )}
            </Card>
            <div className="mt-6 flex flex-col items-center gap-2">
              <Button className="px-8" onClick={connectCanvas} disabled={!config.patToken || checking}>
                {checking ? 'Checking…' : 'Connect'}
              </Button>
              <Button variant="ghost" onClick={() => setStep('exams')}>
                Skip for now
              </Button>
            </div>
          </>
        )}

        {step === 'exams' && (
          <>
            <h1 className="text-[30px] leading-tight sm:text-[36px]">Confirm your exams</h1>
            <p className="mx-auto mt-2 max-w-md text-[16px] text-muted">Check the dates and formats. Sessions aim at whatever is next.</p>

            <div className="mt-6 space-y-4 text-left">
              {courses.length === 0 && (
                <Card className="p-6 text-center">
                  <p className="font-semibold">No classes yet</p>
                  <p className="mt-1 text-[14px] text-muted">Add your first class to set its exams.</p>
                </Card>
              )}
              {courses.map((c) => {
                const on = selected.includes(c.id);
                return (
                  <Card key={c.id} className={`p-5 ${on ? '' : 'opacity-60'}`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <label className="flex min-h-11 items-center gap-3 cursor-pointer">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${on ? 'border-ink bg-ink text-white' : 'border-line'}`}
                          aria-hidden
                        >
                          {on && <Check className="h-4 w-4" />}
                        </span>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={on}
                          onChange={() => setSelected((prev) => (on ? prev.filter((id) => id !== c.id) : [...prev, c.id]))}
                        />
                        <span>
                          <span className="block text-[16px] font-semibold">{c.name}</span>
                          <span className="block text-[13px] text-muted">
                            {c.code} · {c.professor}
                          </span>
                        </span>
                      </label>
                      <Button variant="ghost" onClick={() => setClassModal({ open: true, course: c })}>
                        Edit class
                      </Button>
                    </div>
                    {on && (
                      <ExamEditor
                        course={c}
                        onChange={(ms) => setCourses((prev) => prev.map((p) => (p.id === c.id ? { ...p, milestones: ms } : p)))}
                      />
                    )}
                  </Card>
                );
              })}

              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => setClassModal({ open: true, course: null })}>
                  Add a class
                </Button>
                {courses.length === 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCourses(INITIAL_AVAILABLE_COURSES);
                      setSelected(INITIAL_AVAILABLE_COURSES.map((c) => c.id));
                      setUploadTarget(INITIAL_AVAILABLE_COURSES[0].code);
                    }}
                  >
                    Use sample classes
                  </Button>
                )}
              </div>

              {source === 'upload' && courses.length > 0 && (
                <FileEmbedSection
                  courseCode={uploadTarget || courses[0].code}
                  files={(courses.find((c) => c.code === (uploadTarget || courses[0].code))?.embeddedFiles) || []}
                  onAddFile={addFile}
                  onRemoveFile={removeFile}
                  availableCourses={courses.map((c) => ({ code: c.code, name: c.name }))}
                  onCourseChange={setUploadTarget}
                />
              )}
            </div>

            <Button className="mt-8 px-8" onClick={() => setStep('scope')} disabled={chosen.length === 0}>
              Continue
            </Button>
          </>
        )}

        {step === 'scope' && (
          <>
            <h1 className="text-[30px] leading-tight sm:text-[36px]">Semester scope</h1>
            <p className="mx-auto mt-2 max-w-md text-[16px] text-muted">When your term runs, and how far back sessions should reach.</p>
            <Card className="mx-auto mt-6 max-w-lg space-y-4 p-6 text-left">
              <label className="block">
                <span className="mb-1 block text-[13px] font-medium">Semester</span>
                <input className={field} value={config.semesterLabel} onChange={(e) => setConfig({ ...config, semesterLabel: e.target.value })} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[13px] font-medium">Starts</span>
                  <input type="date" className={field} value={config.termStartDate} onChange={(e) => setConfig({ ...config, termStartDate: e.target.value })} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[13px] font-medium">Ends</span>
                  <input type="date" className={field} value={config.termEndDate} onChange={(e) => setConfig({ ...config, termEndDate: e.target.value })} />
                </label>
              </div>
              <fieldset>
                <legend className="mb-2 text-[13px] font-medium">Study scope</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['post_exam_only', 'Since last exam', 'New material only'],
                      ['cumulative_review', 'Cumulative', 'Everything so far'],
                    ] as const
                  ).map(([id, title, sub]) => (
                    <label
                      key={id}
                      className={`flex min-h-11 flex-col rounded-xl border-2 p-3 cursor-pointer ${mode === id ? 'border-ink' : 'border-line'}`}
                    >
                      <input type="radio" name="scope" className="sr-only" checked={mode === id} onChange={() => setMode(id)} />
                      <span className="text-[15px] font-semibold">{title}</span>
                      <span className="text-[13px] text-muted">{sub}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </Card>
            <Button className="mt-8 px-8" onClick={finish}>
              Start studying
            </Button>
          </>
        )}

        {n > 0 && (
          <div className="mt-6 flex justify-center gap-2" aria-hidden>
            {[1, 2, 3].map((i) => (
              <span key={i} className={`h-1.5 w-8 rounded-full ${i <= n ? 'bg-ink' : 'bg-track'}`} />
            ))}
          </div>
        )}
        {n > 1 && (
          <button
            type="button"
            onClick={() => setStep(n === 3 ? 'exams' : 'source')}
            className="mx-auto mt-4 flex min-h-11 items-center rounded-full px-4 text-[14px] text-muted-strong hover:bg-soft cursor-pointer"
          >
            Back
          </button>
        )}
      </main>

      <ClassEditModal
        isOpen={classModal.open}
        onClose={() => setClassModal({ open: false, course: null })}
        courseToEdit={classModal.course}
        onSaveCourse={saveCourse}
        onDeleteCourse={(id) => {
          setCourses((prev) => prev.filter((c) => c.id !== id));
          setSelected((prev) => prev.filter((x) => x !== id));
        }}
        canDelete={courses.length > 1}
      />
    </div>
  );
};
