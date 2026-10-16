import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Flame, Check } from 'lucide-react';
import { StudyQuestion, CourseData, MilestoneMode, CourseMilestone } from '../types';
import { StarryMascot } from './StarryMascot';
import { triggerLockedInConfetti } from './confetti';
import { Button, EmptyState } from './ui';

export interface SessionResult {
  correct: number;
  answered: number;
  minutes: number;
  xp: number;
  moduleIds: string[];
}

interface GameSessionProps {
  course: CourseData | null;
  milestoneMode: MilestoneMode;
  targetMilestone?: CourseMilestone | null;
  // When set, plays exactly these questions (used by "Play the top 3 topics").
  fixedQuestions?: StudyQuestion[] | null;
  onExitSession: () => void;
  onUpdateMastery: (moduleId: string, points: number) => void;
  onFinish: (result: SessionResult) => void;
  onLoadDemoQuestions?: () => void;
}

// Same numbers as before the redesign: +5 mastery per correct adaptive answer,
// which the app turns into +10 XP.
const MASTERY_POINTS = 5;
const XP_PER_CORRECT = MASTERY_POINTS * 2;
const ADAPTIVE_ROUNDS = 5;

const DIFFICULTY_LABEL: Record<StudyQuestion['difficulty'], string> = {
  Foundational: 'Know it',
  Applied: 'Apply it',
  Synthesis: 'Connect it',
};

export const GameSession: React.FC<GameSessionProps> = (props) => {
  const { course, fixedQuestions, onExitSession, onLoadDemoQuestions } = props;
  if (!course || ((!course.questions || course.questions.length === 0) && !fixedQuestions?.length)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          title={`No questions yet for ${course?.code || 'this class'}`}
          body="Upload lecture slides or a past exam in Sources and Lock In will write questions from them."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={onExitSession}>Back to Today</Button>
              {onLoadDemoQuestions && (
                <Button variant="secondary" onClick={onLoadDemoQuestions}>
                  Use sample questions
                </Button>
              )}
            </div>
          }
        />
      </div>
    );
  }
  return <ActiveGame {...props} course={course} />;
};

const ActiveGame: React.FC<GameSessionProps & { course: CourseData }> = ({
  course,
  milestoneMode,
  targetMilestone,
  fixedQuestions,
  onExitSession,
  onUpdateMastery,
  onFinish,
}) => {
  // ---- Question pools (unchanged rules, plus fallbacks so a pool is never empty) ----
  const adaptivePool = useMemo(() => {
    const nonDiag = course.questions.filter((q) => !q.isDiagnostic);
    const pool = nonDiag.length ? nonDiag : course.questions;
    if (targetMilestone?.coverageModules?.length) {
      const targeted = pool.filter((q) => targetMilestone.coverageModules.includes(q.moduleNumber));
      if (targeted.length) return targeted;
    }
    if (milestoneMode === 'post_exam_only') {
      const postExam = pool.filter((q) => q.moduleNumber >= 4);
      if (postExam.length) return postExam;
    }
    return pool;
  }, [course, milestoneMode, targetMilestone]);

  const diagnosticPool = useMemo(() => {
    if (fixedQuestions?.length) return [];
    const diag = course.questions.filter((q) => q.isDiagnostic);
    if (targetMilestone?.coverageModules?.length) {
      const targeted = diag.filter((q) => targetMilestone.coverageModules.includes(q.moduleNumber));
      if (targeted.length) return targeted.slice(0, 3);
    }
    return diag.slice(0, 3);
  }, [course, targetMilestone, fixedQuestions]);

  const queue = useMemo<{ q: StudyQuestion; diagnostic: boolean }[]>(() => {
    if (fixedQuestions?.length) return fixedQuestions.map((q) => ({ q, diagnostic: false }));
    const adaptive = Array.from({ length: ADAPTIVE_ROUNDS }, (_, i) => adaptivePool[i % adaptivePool.length]);
    return [...diagnosticPool.map((q) => ({ q, diagnostic: true })), ...adaptive.map((q) => ({ q, diagnostic: false }))];
    // The queue is fixed when the session starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Session state ----
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [xp, setXp] = useState(0);
  const [moduleIds, setModuleIds] = useState<string[]>([]);
  const startedAt = useRef(Date.now());
  const continueRef = useRef<HTMLButtonElement>(null);

  const current = queue[index];
  const question = current.q;
  const submitted = selected !== null;
  const isCorrect = submitted && selected === question.correctIndex;
  const isLast = index + 1 >= queue.length;

  const choose = (idx: number) => {
    if (submitted || idx < 0 || idx >= question.options.length) return;
    setSelected(idx);
    const correct = idx === question.correctIndex;
    if (correct) setCorrectCount((n) => n + 1);
    if (question.moduleId) setModuleIds((ids) => (ids.includes(question.moduleId) ? ids : [...ids, question.moduleId]));

    // Diagnostic answers calibrate only; they don't change mastery (as before).
    if (current.diagnostic) return;
    if (correct) {
      setStreak((s) => s + 1);
      setXp((x) => x + XP_PER_CORRECT);
      onUpdateMastery(question.moduleId, MASTERY_POINTS);
      const mod = course.modules.find((m) => m.id === question.moduleId);
      if (mod && mod.masteryPercentage < 85 && mod.masteryPercentage + MASTERY_POINTS >= 85) triggerLockedInConfetti();
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (!submitted) return;
    if (isLast) {
      onFinish({
        correct: correctCount,
        answered: queue.length,
        minutes: Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)),
        xp,
        moduleIds,
      });
      return;
    }
    setSelected(null);
    setIndex((i) => i + 1);
  };

  // Keys 1–4 answer, Enter continues.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!submitted && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        choose(Number(e.key) - 1);
      } else if (submitted && e.key === 'Enter' && document.activeElement !== continueRef.current) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (submitted) continueRef.current?.focus();
  }, [submitted]);

  const progress = ((index + (submitted ? 1 : 0)) / queue.length) * 100;
  const eyebrow = current.diagnostic ? 'Warm-up' : DIFFICULTY_LABEL[question.difficulty] || 'Apply it';
  const correctText = question.options[question.correctIndex];

  return (
    <div className="flex min-h-dvh flex-col bg-subtle">
      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 pt-4 sm:pt-6">
        <button
          type="button"
          onClick={onExitSession}
          aria-label="End session"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-card hover:bg-soft cursor-pointer"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-white"
          role="progressbar"
          aria-label="Session progress"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-ink transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="flex items-center gap-1 text-[15px] font-bold" aria-label={`Answer streak ${streak}`}>
          <Flame className="h-4 w-4" aria-hidden />
          {streak}
        </span>
        <span className="rounded-full bg-soft px-3 py-1 text-[13px] font-semibold" aria-label={`${xp} XP this session`}>
          +{xp} XP
        </span>
      </header>

      {/* Question */}
      <main className={`mx-auto w-full max-w-4xl flex-1 px-4 pt-8 sm:pt-12 ${submitted ? 'pb-[26rem] sm:pb-56' : 'pb-16'}`}>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          <StarryMascot
            mood={!submitted ? 'thinking' : isCorrect ? 'triumphant' : 'focused'}
            size={110}
            className="shrink-0"
          />
          <div className="w-full">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
              {eyebrow} · {question.topic}
            </div>
            <div className="rounded-[20px] bg-white p-5 text-[18px] font-semibold leading-snug sm:text-[20px]" id="question">
              {question.question}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2" role="group" aria-labelledby="question">
          {question.options.map((opt, idx) => {
            const isAnswer = idx === question.correctIndex;
            const isPicked = idx === selected;
            let style = 'border-line bg-white hover:border-ink';
            if (submitted) {
              if (isAnswer) style = 'border-ink bg-ink text-white';
              else if (isPicked) style = 'border-ink bg-white';
              else style = 'border-line bg-white opacity-60';
            }
            return (
              <button
                key={idx}
                type="button"
                onClick={() => choose(idx)}
                disabled={submitted}
                aria-keyshortcuts={String(idx + 1)}
                aria-label={`${idx + 1}. ${opt}${submitted && isAnswer ? ', correct answer' : ''}${submitted && isPicked && !isAnswer ? ', your answer' : ''}`}
                className={`flex min-h-14 items-center gap-3 rounded-card border-2 border-b-4 px-4 py-3 text-left text-[15px] font-medium transition-colors cursor-pointer disabled:cursor-default ${style}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[13px] ${
                    submitted && isAnswer ? 'border-white/40' : 'border-line text-muted'
                  }`}
                  aria-hidden
                >
                  {submitted && isAnswer ? <Check className="h-4 w-4" /> : submitted && isPicked ? <X className="h-4 w-4 text-ink" /> : idx + 1}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Feedback */}
      {submitted && (
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]" role="status" aria-live="polite">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[17px] font-bold">
                {isCorrect ? 'Correct.' : `Not quite. The answer is ${question.correctIndex + 1}: ${correctText.replace(/\.+$/, '')}.`}
              </p>
              <p className="mt-1 text-[14px] text-muted-strong">{question.professorExactFraming}</p>
              {question.professorNoteCitation && (
                <p className="mt-1 text-[13px] text-muted">Source: {question.professorNoteCitation}</p>
              )}
            </div>
            <Button ref={continueRef} onClick={next} className="shrink-0 px-8">
              {isLast ? 'See results' : 'Continue'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
