import React, { useState, useEffect } from 'react';
import { StudyQuestion, CourseData, MilestoneMode, CourseMilestone } from '../types';
import { StarryMascot } from './StarryMascot';
import { triggerLockedInConfetti } from './MasteryDashboard';
import { Sparkles, ArrowRight, ArrowLeft, RotateCcw, AlertTriangle, BookOpen, Flame, Award, CheckCircle2, Gamepad2 } from 'lucide-react';

interface GameSessionProps {
  course: CourseData | null;
  milestoneMode: MilestoneMode;
  targetMilestone?: CourseMilestone | null;
  onClearTargetMilestone?: () => void;
  onExitSession: () => void;
  onUpdateMastery: (moduleId: string, points: number) => void;
  onLoadDemoQuestions?: () => void;
}

export const GameSession: React.FC<GameSessionProps> = ({
  course,
  milestoneMode,
  targetMilestone,
  onClearTargetMilestone,
  onExitSession,
  onUpdateMastery,
  onLoadDemoQuestions,
}) => {
  // If no course or course has no questions, show clean empty state
  if (!course || !course.questions || course.questions.length === 0) {
    return (
      <div className="w-full bg-[#F7F4EB] border-4 border-[#3B4232] rounded-[2.5rem] p-6 sm:p-10 shadow-2xl text-[#1E2516] text-center space-y-6 max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-3xl bg-[#3B4232] text-[#C4F46C] mx-auto flex items-center justify-center shadow-md">
          <Gamepad2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B4232] text-[#C4F46C] text-xs font-black uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Practice Drill Pool
          </div>
          <h2 className="text-2xl font-black text-[#1E2516]">
            No Practice Questions Yet for {course?.code || 'this Course'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6750] max-w-md mx-auto">
            This class currently has a blank question bank. You can embed lecture slides & past exams to automatically parse questions, or load demo sample questions to practice!
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onLoadDemoQuestions && (
            <button
              onClick={onLoadDemoQuestions}
              className="px-5 py-2.5 rounded-full bg-[#C4F46C] hover:bg-[#b2e557] text-[#1B2213] text-xs font-black shadow-md border border-[#1E2516] flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Study Questions</span>
            </button>
          )}
          <button
            onClick={onExitSession}
            className="px-5 py-2.5 rounded-full bg-[#3B4232] hover:bg-[#2B3124] text-white text-xs font-black cursor-pointer shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Phase 1: Diagnostic Calibration (3 questions)
  // Phase 2: Calibrated Adaptive Session (5 questions)
  // Phase 3: Session Complete Summary
  const [phase, setPhase] = useState<'diagnostic' | 'calibrated_game' | 'summary'>('diagnostic');
  const [diagnosticIndex, setDiagnosticIndex] = useState<number>(0);
  const [diagnosticScore, setDiagnosticScore] = useState<number>(0);

  // Active question pool based on target exam milestone and milestone mode
  const filteredQuestions = React.useMemo(() => {
    const nonDiag = course.questions.filter((q) => !q.isDiagnostic);
    if (targetMilestone && targetMilestone.coverageModules && targetMilestone.coverageModules.length > 0) {
      const targeted = nonDiag.filter((q) => targetMilestone.coverageModules.includes(q.moduleNumber));
      if (targeted.length > 0) return targeted;
    }
    if (milestoneMode === 'post_exam_only') {
      return nonDiag.filter((q) => q.moduleNumber >= 4);
    }
    return nonDiag;
  }, [course, milestoneMode, targetMilestone]);

  const diagnosticQuestions = React.useMemo(() => {
    const diag = course.questions.filter((q) => q.isDiagnostic);
    if (targetMilestone && targetMilestone.coverageModules && targetMilestone.coverageModules.length > 0) {
      const targetedDiag = diag.filter((q) => targetMilestone.coverageModules.includes(q.moduleNumber));
      if (targetedDiag.length > 0) return targetedDiag.slice(0, 3);
    }
    return diag.slice(0, 3);
  }, [course, targetMilestone]);

  // Game state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [lockInEnergy, setLockInEnergy] = useState<number>(30); // 0 to 100
  const [stats, setStats] = useState({ correct: 0, wrong: 0, total: 0 });
  const [calibratedDifficulty, setCalibratedDifficulty] = useState<'Foundational' | 'Applied' | 'Synthesis'>('Applied');

  // Active current question
  const currentQuestion: StudyQuestion | undefined =
    phase === 'diagnostic'
      ? diagnosticQuestions[diagnosticIndex]
      : filteredQuestions[currentIndex % filteredQuestions.length];

  // Update best streak
  useEffect(() => {
    if (streak > bestStreak) setBestStreak(streak);
  }, [streak, bestStreak]);

  // Submit Answer
  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted || !currentQuestion) return;

    setSelectedOption(idx);
    setIsAnswerSubmitted(true);
    const correct = idx === currentQuestion.correctIndex;
    setIsCorrect(correct);

    if (phase === 'diagnostic') {
      if (correct) {
        setDiagnosticScore((prev) => prev + 1);
        setLockInEnergy((prev) => Math.min(100, prev + 20));
      }
    } else {
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        correct: correct ? prev.correct + 1 : prev.correct,
        wrong: correct ? prev.wrong : prev.wrong + 1,
      }));

      if (correct) {
        setStreak((prev) => prev + 1);
        setLockInEnergy((prev) => Math.min(100, prev + 18));
        onUpdateMastery(currentQuestion.moduleId, 5);

        // Fire celebratory confetti if this pushes module into >= 85% Locked In status
        if (course?.modules) {
          const mod = course.modules.find((m) => m.id === currentQuestion.moduleId);
          if (mod && mod.masteryPercentage < 85 && mod.masteryPercentage + 5 >= 85) {
            triggerLockedInConfetti();
          }
        }
      } else {
        setStreak(0);
        setLockInEnergy((prev) => Math.max(0, prev - 15));
      }
    }
  };

  // Next Step Action
  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    if (phase === 'diagnostic') {
      if (diagnosticIndex + 1 < diagnosticQuestions.length) {
        setDiagnosticIndex(diagnosticIndex + 1);
      } else {
        // Diagnostic finished -> dynamically calibrate
        const finalScore = diagnosticScore + (isCorrect ? 1 : 0);
        let calibrated: 'Foundational' | 'Applied' | 'Synthesis' = 'Applied';
        if (finalScore >= 3) calibrated = 'Synthesis';
        else if (finalScore === 2) calibrated = 'Applied';
        else calibrated = 'Foundational';

        setCalibratedDifficulty(calibrated);
        setPhase('calibrated_game');
        setCurrentIndex(0);
      }
    } else {
      if (stats.total + 1 >= 5) {
        setPhase('summary');
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  // Restart
  const handleRestart = () => {
    setPhase('diagnostic');
    setDiagnosticIndex(0);
    setDiagnosticScore(0);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setStreak(0);
    setLockInEnergy(35);
    setStats({ correct: 0, wrong: 0, total: 0 });
  };

  // SUMMARY SCREEN
  if (phase === 'summary') {
    const accuracy = Math.round((stats.correct / Math.max(1, stats.total)) * 100);
    return (
      <div className="w-full max-w-2xl mx-auto bg-[#F7F4EB] border-4 border-[#3B4232] rounded-[2.5rem] p-6 sm:p-10 shadow-2xl text-[#1E2516] flex flex-col items-center animate-in fade-in">
        <div className="w-full flex items-center justify-between pb-4 border-b border-[#E1DBCB] mb-6">
          <div className="text-xs font-black uppercase tracking-wider text-[#5D6A50]">
            {targetMilestone ? `Targeted Exam Drill • ${targetMilestone.name}` : `Session Completed • ${milestoneMode === 'post_exam_only' ? 'Post-Exam' : 'Cumulative'}`}
          </div>
          <div className="px-3 py-1 rounded-full bg-[#C4F46C] text-[#1B2213] text-xs font-black">
            +35 Lock-In XP
          </div>
        </div>

        <StarryMascot mood="triumphant" size={170} speechText="Huge progress today! Locked in! 🌟" />

        <h2 className="text-3xl font-black text-[#1E2516] mt-4 mb-2 tracking-tight text-center">
          {targetMilestone ? `${targetMilestone.name} Practice Drill Complete!` : 'Daily Study Session Complete!'}
        </h2>
        <p className="text-xs sm:text-sm text-[#616D54] text-center max-w-md mb-6">
          {targetMilestone
            ? `Targeted practice for ${targetMilestone.name} (Modules ${targetMilestone.coverageModules.join(', ')}) complete! You adhered strictly to professor rubric mental models.`
            : 'You adhered strictly to the professor’s lecture mental models and avoided generic textbook traps.'}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          <div className="p-3.5 rounded-2xl bg-white border border-[#E0D9C4] text-center">
            <div className="text-[10px] font-bold text-[#6D7A60] uppercase">Accuracy</div>
            <div className="text-2xl font-black text-[#22291A] mt-0.5">{accuracy}%</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#E0D9C4] text-center">
            <div className="text-[10px] font-bold text-[#6D7A60] uppercase">Best Streak</div>
            <div className="text-2xl font-black text-[#22291A] mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 text-[#D96B43] fill-current" />
              {bestStreak}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#E0D9C4] text-center">
            <div className="text-[10px] font-bold text-[#6D7A60] uppercase">Calibrated</div>
            <div className="text-xs sm:text-sm font-black text-[#22291A] mt-1.5 px-2 py-0.5 rounded-full bg-[#C4F46C] text-[#1B2213] inline-block">
              {calibratedDifficulty}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={handleRestart}
            className="w-full sm:w-1/2 py-3 px-6 rounded-full bg-[#ECE5D4] hover:bg-[#DDD5C0] text-[#293220] font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Practice Another Session
          </button>
          <button
            onClick={onExitSession}
            className="w-full sm:w-1/2 py-3 px-6 rounded-full bg-[#C4F46C] hover:bg-[#b2e555] text-[#1B2213] font-black text-xs shadow-md border border-[#212818] transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            Return to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center p-8 bg-[#F7F4EB] rounded-3xl text-[#1E2516]">
        <p className="font-bold">No questions available for this module filter.</p>
        <button
          onClick={onExitSession}
          className="mt-3 px-4 py-2 rounded-full bg-[#3B4232] text-white text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Navigation Breadcrumb Bar */}
      <div className="w-full flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={onExitSession}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#272D1F] hover:bg-[#323A28] border border-[#48533B] text-xs font-black text-[#C4F46C] hover:text-white transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to {course.code} Dashboard</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-[#CAD7B9]">
          <span className="hidden sm:inline text-[#8D9F7C]">Studying for:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#2C3323] text-white border border-[#455038] font-black">
            {course.code}
          </span>
          {targetMilestone && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#C4F46C] text-[#1B2213] border border-[#A2D94B] font-black text-[11px] shadow-xs">
              🎯 {targetMilestone.name}
            </span>
          )}
          <span className="hidden md:inline text-[#CAD7B9] truncate max-w-[200px]">
            {course.name}
          </span>
        </div>
      </div>

      {/* TARGET MILESTONE ACTIVE BANNER */}
      {targetMilestone && (
        <div className="w-full bg-[#262D1D] border-2 border-[#576846] rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#C4F46C] text-[#1B2213] flex items-center justify-center font-black shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-white">
                  Targeted Exam Drill:
                </span>
                <span className="text-xs font-black text-[#C4F46C]">
                  {targetMilestone.name}
                </span>
                {targetMilestone.isCompleted ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#C4F46C]/15 text-[#C4F46C] text-[10px] font-black uppercase tracking-wide border border-[#C4F46C]/30">
                    Completed Exam Review
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-[#D96B43]/20 text-[#FFA88A] text-[10px] font-black uppercase tracking-wide border border-[#D96B43]/40">
                    Upcoming Exam Prep
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#A6B793] mt-0.5">
                Focusing questions on Modules {targetMilestone.coverageModules.join(', ')} • Exam Date: {targetMilestone.date}
              </p>
            </div>
          </div>

          {onClearTargetMilestone && (
            <button
              type="button"
              onClick={onClearTargetMilestone}
              className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#363F2C] hover:bg-[#455038] text-xs font-bold text-[#CAD8BA] hover:text-white transition-colors cursor-pointer border border-[#505D41]"
              title="Practice all course modules instead"
            >
              Practice All Modules
            </button>
          )}
        </div>
      )}

      {/* Top Header Bar: Game metrics */}
      <div className="w-full bg-[#2E3526] border-2 border-[#4E5842] rounded-3xl p-4 shadow-md text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {phase === 'diagnostic' ? (
            <div className="px-3 py-1 rounded-full bg-[#C4F46C] text-[#1B2213] text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Rapid Diagnostic Check
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full bg-[#3B4232] border border-[#525E46] text-[#C4F46C] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Calibrated: {calibratedDifficulty}
            </div>
          )}
          <span className="text-xs text-[#B6C5A4] font-medium hidden sm:inline">
            Module {currentQuestion.moduleNumber}
          </span>
        </div>

        {/* Energy bar & streak */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1 text-[#FFA080]">
            <Flame className="w-4 h-4 fill-current text-[#D96B43]" />
            <span>Streak: {streak}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#A6B694]">Lock-In:</span>
            <div className="w-20 h-2.5 bg-[#1B2016] rounded-full overflow-hidden p-0.5 border border-[#3E4734]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#81B33B] to-[#C4F46C] transition-all duration-300"
                style={{ width: `${lockInEnergy}%` }}
              />
            </div>
          </div>

          <button
            onClick={onExitSession}
            className="text-[11px] font-bold text-[#A6B694] hover:text-white transition-colors"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Progress pill indicator */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold text-[#E2EDD3]">
        <span>
          {phase === 'diagnostic'
            ? `Diagnostic Question ${diagnosticIndex + 1} of ${diagnosticQuestions.length}`
            : `Adaptive Drill Question ${stats.total + 1} of 5`}
        </span>
        <span className="text-[#A2B191]">
          {course.code} • {milestoneMode === 'post_exam_only' ? 'Post-Exam' : 'Cumulative'}
        </span>
      </div>

      {/* MAIN QUESTION CARD */}
      <div className="w-full bg-[#F7F4EB] border-4 border-[#3B4232] rounded-[2.5rem] p-6 sm:p-8 shadow-xl text-[#1E2516]">
        {/* Question Topic badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#E8E1CD] text-[#3D4733] border border-[#D7CEB7]">
              {currentQuestion.topic}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E2EFD2] text-[#2F5818] border border-[#BCD99F] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#52A01C]" />
              Course Content Focus
            </span>
          </div>
          <span className="text-xs font-bold text-[#6B795D]">
            Difficulty: {currentQuestion.difficulty}
          </span>
        </div>

        {/* Question Statement */}
        <h3 className="text-base sm:text-xl font-black text-[#1E2516] mb-6 leading-relaxed">
          {currentQuestion.question}
        </h3>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let optionClasses =
              'bg-white hover:bg-[#F2ECE0] border-2 border-[#DCD5C1] text-[#242C1B] font-semibold';

            if (isAnswerSubmitted) {
              if (idx === currentQuestion.correctIndex) {
                optionClasses =
                  'bg-[#C4F46C] border-2 border-[#262E1D] text-[#1B2213] font-black shadow-md';
              } else if (idx === selectedOption) {
                // If user selected this wrong answer
                optionClasses =
                  'bg-[#D96B43] border-2 border-[#76270E] text-white font-black shadow-md';
              } else {
                optionClasses =
                  'bg-white/60 border-2 border-[#E3DCB8] text-[#869279] opacity-50';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-2xl transition-all flex items-start gap-3 cursor-pointer text-xs sm:text-sm leading-snug ${optionClasses}`}
              >
                <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="grow">{option}</span>
              </button>
            );
          })}
        </div>

        {/* FEEDBACK STATE: SUCCESS OR ERROR CARD */}
        {isAnswerSubmitted && (
          <div className="mt-6 animate-in fade-in duration-300">
            {isCorrect ? (
              // SUCCESS STATE: STARRY GETS FED!
              <div className="p-5 rounded-3xl bg-[#E8F8D0] border-3 border-[#95D44A] text-[#224810] shadow-md space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#C7E99A]">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#275213] text-[#C4F46C] text-xs font-black uppercase tracking-wider">
                    <span>⭐ +10 Star Treats Earned!</span>
                  </div>
                  <span className="text-xs font-black text-[#2B5E14]">
                    Starry is munching on your study points! Nom nom nom! 🥐✨
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <StarryMascot mood="eating" size={68} className="shrink-0" />
                  <div>
                    <div className="text-base font-black flex items-center gap-1.5 text-[#244E11]">
                      <Sparkles className="w-4 h-4 text-[#44861E]" />
                      Locked In! Professor Rubric Mastered.
                    </div>
                    <p className="text-xs text-[#396323] mt-1 font-medium">
                      {currentQuestion.professorExactFraming}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#C7E99A] text-[11px] text-[#446C2B] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <strong>Source:</strong> {currentQuestion.professorNoteCitation}
                </div>
              </div>
            ) : (
              // CRUCIAL ERROR STATE: TERRACOTTA ORANGE CARD (#D96B43) WITH STRESSED STARRY
              <div className="p-6 rounded-3xl bg-[#D96B43] border-4 border-[#8B3111] text-white shadow-xl">
                {/* Top Banner with Stressed Starry */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-[#E98D6C]">
                  {/* Stressed Starry vector mascot on Terracotta Orange */}
                  <div className="shrink-0 bg-white/15 p-2 rounded-2xl border border-white/20">
                    <StarryMascot mood="stressed" size={90} />
                  </div>

                  <div className="text-center sm:text-left grow">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/25 text-[#FFDACF] text-[10px] font-black uppercase tracking-wider mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FFC4B3]" />
                      The "Professor Notes Only" Rule Triggered
                    </div>
                    <h4 className="text-xl font-black text-white tracking-tight">
                      Generic Internet / Textbook Pitfall!
                    </h4>
                    <p className="text-xs text-[#FFE8E0] mt-1">
                      You chose an answer that works in standard textbooks, but violates Prof. Miller’s explicit grading rubric.
                    </p>
                  </div>
                </div>

                {/* Professor's exact mental model & citation */}
                <div className="mt-4 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-black/20 border border-white/15 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#C4F46C] block mb-1">
                      📜 Professor Note Citation & Exact Mental Model
                    </span>
                    <p className="font-extrabold text-white text-xs sm:text-sm leading-relaxed">
                      "{currentQuestion.professorExactFraming}"
                    </p>
                    <div className="mt-1 text-[11px] text-[#FFDACF] font-semibold flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3" />
                      {currentQuestion.professorNoteCitation}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#9E3E1A] border border-[#BA4D24] text-xs">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC1AB] block mb-1">
                      ⚠️ Why Generic Internet/Textbook Answers Fail Here
                    </span>
                    <p className="text-[#FFEBE5] leading-relaxed text-[11px] sm:text-xs">
                      {currentQuestion.whyGenericAnswersFail}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Question / Calibrate Button */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#C4F46C] hover:bg-[#b0e252] text-[#1B2213] font-black text-sm shadow-md border-2 border-[#1E2516] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <span>
                  {phase === 'diagnostic'
                    ? diagnosticIndex + 1 < diagnosticQuestions.length
                      ? 'Next Diagnostic Question'
                      : 'Complete Calibration & Lock In'
                    : stats.total + 1 >= 5
                    ? 'View Session Report'
                    : 'Next Adaptive Question'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
