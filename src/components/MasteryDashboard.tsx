import React, { useState, useEffect, useRef } from 'react';
import { CourseData, MilestoneMode } from '../types';
import { StarryMascot } from './StarryMascot';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Play,
  BookmarkCheck,
  PartyPopper,
  X,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MasteryDashboardProps {
  course: CourseData;
  milestoneMode: MilestoneMode;
  onDrillModule: (moduleId: string) => void;
  onStartDailySession: () => void;
  onUpdateMastery?: (moduleId: string, points: number) => void;
}

export const triggerLockedInConfetti = () => {
  // Center blast
  confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.6 },
    colors: ['#C4F46C', '#82AF34', '#FFD700', '#D96B43', '#2A3321', '#FFFFFF'],
    shapes: ['square', 'circle'],
    scalar: 1.1,
  });

  // Left & right cannons
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 60,
      origin: { x: 0.05, y: 0.65 },
      colors: ['#C4F46C', '#FFD700', '#A3E635'],
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 60,
      origin: { x: 0.95, y: 0.65 },
      colors: ['#C4F46C', '#D96B43', '#82AF34'],
    });
  }, 200);

  // Floating stars finale
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 90,
      origin: { y: 0.4 },
      colors: ['#C4F46C', '#FFE17D', '#6EE7B7'],
      startVelocity: 35,
    });
  }, 400);
};

export const MasteryDashboard: React.FC<MasteryDashboardProps> = ({
  course,
  milestoneMode,
  onDrillModule,
  onStartDailySession,
  onUpdateMastery,
}) => {
  // Filter modules based on milestone mode
  const displayedModules = React.useMemo(() => {
    if (milestoneMode === 'post_exam_only') {
      return course.modules.filter((m) => m.isPostExam);
    }
    return course.modules;
  }, [course.modules, milestoneMode]);

  // Overall average mastery
  const avgMastery = Math.round(
    displayedModules.reduce((acc, m) => acc + m.masteryPercentage, 0) / Math.max(1, displayedModules.length)
  );

  // Track celebratory banner for newly locked-in modules
  const [celebratedModule, setCelebratedModule] = useState<{
    id: string;
    number: number;
    title: string;
    score: number;
  } | null>(null);

  const prevMasteryMapRef = useRef<Record<string, number>>({});
  const isInitialMount = useRef(true);

  // Monitor module mastery transitions across updates
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const initialMap: Record<string, number> = {};
      course.modules.forEach((m) => {
        initialMap[m.id] = m.masteryPercentage;
      });
      prevMasteryMapRef.current = initialMap;
      return;
    }

    // Check if any module crossed into >= 85% ("Locked In")
    course.modules.forEach((m) => {
      const prevVal = prevMasteryMapRef.current[m.id] ?? 0;
      if (prevVal < 85 && m.masteryPercentage >= 85) {
        triggerLockedInConfetti();
        setCelebratedModule({
          id: m.id,
          number: m.number,
          title: m.title,
          score: m.masteryPercentage,
        });
      }
      prevMasteryMapRef.current[m.id] = m.masteryPercentage;
    });
  }, [course.modules]);

  // Auto-dismiss banner after 6 seconds
  useEffect(() => {
    if (celebratedModule) {
      const timer = setTimeout(() => {
        setCelebratedModule(null);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [celebratedModule]);

  return (
    <div className="w-full bg-[#F7F4EB] border-4 border-[#3B4232] rounded-[2.5rem] p-6 sm:p-8 shadow-xl text-[#1E2516] mb-8">
      {/* Top Mastery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1DBCB]">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#3B4232] text-[#C4F46C] flex items-center justify-center shrink-0 shadow-sm">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#3B4232] text-[#C4F46C] text-[11px] font-black uppercase tracking-wider mb-1">
              Canvas Mastery Matrix
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1F2617] tracking-tight">
              Module Mastery Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6750] mt-0.5">
              Showing {displayedModules.length} modules • Scope:{' '}
              <span className="font-bold text-[#1E2516]">
                {milestoneMode === 'post_exam_only' ? 'Post-Exam 1 Only' : 'Cumulative (All Terms)'}
              </span>
            </p>
          </div>
        </div>

        {/* Global Mastery Stat Card */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#DFD8C4] self-start sm:self-auto shadow-xs">
          <StarryMascot mood={avgMastery >= 85 ? 'triumphant' : 'focused'} size={48} className="shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-[#717E65] uppercase">Target Scope Mastery</div>
            <div className="text-xl font-black text-[#1F2616] flex items-center gap-1">
              <span>{avgMastery}%</span>
              <span className="text-xs font-bold text-[#5B664F]">overall</span>
            </div>
          </div>
        </div>
      </div>

      {/* Celebratory Banner when reaching 85%+ Locked In */}
      {celebratedModule && (
        <div className="mt-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#262D1D] via-[#353D2A] to-[#262D1D] text-white border-2 border-[#C4F46C] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#C4F46C] text-[#1B2213] flex items-center justify-center font-black text-2xl shrink-0 shadow-sm animate-bounce">
              🎉
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#C4F46C]">
                <Sparkles className="w-3.5 h-3.5" /> 85%+ Locked In Status Achieved!
                <span className="px-2 py-0.5 rounded-full bg-[#1C2315] text-[#C4F46C] text-[10px] font-black border border-[#4B5A39]">
                  +25 ⭐ Treats Fed to Starry!
                </span>
              </div>
              <div className="text-base sm:text-lg font-black text-white leading-tight">
                Module {celebratedModule.number}: {celebratedModule.title} is now{' '}
                <span className="text-[#C4F46C]">Locked In ({celebratedModule.score}%)</span>!
              </div>
              <div className="text-xs text-[#CEDBC0] mt-0.5">
                Exam readiness threshold satisfied. Starry received a cosmic study feast to glow bright!
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={triggerLockedInConfetti}
              className="px-3.5 py-1.5 rounded-full bg-[#C4F46C] hover:bg-[#b0e550] text-[#1B2213] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
              title="Trigger celebratory confetti again!"
            >
              <PartyPopper className="w-3.5 h-3.5" />
              <span>More Confetti</span>
            </button>
            <button
              onClick={() => setCelebratedModule(null)}
              className="p-1.5 rounded-full text-[#AAB896] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modules Grid */}
      {displayedModules.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border-2 border-dashed border-[#D5CDBC] text-center space-y-2 mt-6">
          <p className="text-sm font-black text-[#1E2516]">No Modules Found for this Scope</p>
          <p className="text-xs text-[#5D6B4F]">
            Click &quot;Edit Class&quot; to configure your syllabus modules or toggle to Cumulative Review to see all course units.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {displayedModules.map((mod) => {
            const isLockedIn = mod.masteryPercentage >= 85 || mod.status === 'locked_in';
            const isInReview = !isLockedIn && (mod.masteryPercentage >= 70 || mod.status === 'in_review');

            let badgeStyle = 'bg-[#C4F46C] text-[#1B2213] border-[#95D44A]';
            let statusLabel = 'Locked In';
            let icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#214911]" />;

            if (isInReview) {
              badgeStyle = 'bg-[#FFF0B8] text-[#695209] border-[#E8D489]';
              statusLabel = 'In Review';
              icon = <Sparkles className="w-3.5 h-3.5 text-[#916E0A]" />;
            } else if (!isLockedIn) {
              badgeStyle = 'bg-[#FDE2D7] text-[#86290C] border-[#F4A78A]';
              statusLabel = 'Needs Drill';
              icon = <AlertCircle className="w-3.5 h-3.5 text-[#D96B43]" />;
            }

            return (
              <div
                key={mod.id}
                className={`p-5 rounded-3xl bg-white border-2 transition-all flex flex-col justify-between shadow-xs group ${
                  isLockedIn
                    ? 'border-[#C4F46C]/70 hover:border-[#3B4232] shadow-sm'
                    : 'border-[#E3DCB8] hover:border-[#3B4232]'
                }`}
              >
                <div>
                  {/* Module title & number */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-[#3B4232] text-[#C4F46C] text-xs font-black flex items-center justify-center shrink-0">
                        M{mod.number}
                      </span>
                      <span className="text-[11px] font-bold text-[#728067]">
                        Module {mod.number} {mod.isPostExam ? '• Post-Exam' : '• Exam 1 Scope'}
                      </span>
                    </div>

                    {/* Interactive Badge (Clicking Locked In fires confetti!) */}
                    {isLockedIn ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerLockedInConfetti();
                          setCelebratedModule({
                            id: mod.id,
                            number: mod.number,
                            title: mod.title,
                            score: mod.masteryPercentage,
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border cursor-pointer hover:scale-105 active:scale-95 transition-transform ${badgeStyle}`}
                        title="Locked In (85%+)! Click to trigger confetti celebration"
                      >
                        {icon}
                        <span>{statusLabel}</span>
                        <PartyPopper className="w-3 h-3 text-[#214911] ml-0.5" />
                      </button>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeStyle}`}
                      >
                        {icon} {statusLabel}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-[#1E2516] mb-3 leading-snug">
                    {mod.title}
                  </h3>

                  {/* Mastery Percentage Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#3B4530] mb-1">
                      <span className="flex items-center gap-1.5">
                        <span>Mastery Level</span>
                        {isLockedIn && (
                          <span className="text-[10px] font-black text-[#2B771A] bg-[#C4F46C]/30 px-1.5 py-0.2 rounded-md">
                            Exam Ready
                          </span>
                        )}
                      </span>
                      <span className={isLockedIn ? 'text-[#246B16] font-black' : ''}>
                        {mod.masteryPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-[#EFE9D7] rounded-full overflow-hidden p-0.5 border border-[#DDD3B9]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLockedIn
                            ? 'bg-gradient-to-r from-[#97CF49] to-[#C4F46C]'
                            : isInReview
                            ? 'bg-gradient-to-r from-[#F0C850] to-[#E9AE32]'
                            : 'bg-gradient-to-r from-[#E5805B] to-[#D96B43]'
                        }`}
                        style={{ width: `${mod.masteryPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Professor Topics pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mod.topics.map((tp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-[#F5EFE1] text-[#4F5943] text-[10px] font-bold border border-[#E3DABF]"
                      >
                        {tp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions: Drill question + Quick boost / celebrate */}
                <div className="space-y-2 pt-2 border-t border-[#EAE3D0]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDrillModule(mod.id)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#F4EEDC] hover:bg-[#3B4232] hover:text-[#C4F46C] text-[#293220] text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#DDD4BB]"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Drill Questions</span>
                    </button>

                    {/* Quick Boost / Confetti trigger action */}
                    {!isLockedIn ? (
                      onUpdateMastery && (
                        <button
                          type="button"
                          onClick={() => {
                            const pointsToLockIn = Math.max(5, 85 - mod.masteryPercentage);
                            onUpdateMastery(mod.id, pointsToLockIn);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-[#C4F46C] hover:bg-[#b5e758] text-[#1B2213] text-xs font-black transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-[#1E2516] shadow-xs whitespace-nowrap"
                          title={`Boost by +${Math.max(5, 85 - mod.masteryPercentage)}% to reach 85% Locked In status with confetti!`}
                        >
                          <Zap className="w-3 h-3 text-[#1B2213]" />
                          <span>Lock In (85%) • +10 ⭐</span>
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerLockedInConfetti();
                          setCelebratedModule({
                            id: mod.id,
                            number: mod.number,
                            title: mod.title,
                            score: mod.masteryPercentage,
                          });
                        }}
                        className="py-2.5 px-3 rounded-xl bg-[#3B4232] hover:bg-[#2A3123] text-[#C4F46C] text-xs font-black transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-[#48533B] shadow-xs whitespace-nowrap"
                        title="Replay Locked In celebration with confetti!"
                      >
                        <PartyPopper className="w-3 h-3 text-[#C4F46C]" />
                        <span>Celebrate 🎉</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Start Daily Session Footer Pill */}
      <div className="mt-6 pt-6 border-t border-[#E1DBCB] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#ECE5D2] p-4 rounded-2xl border border-[#DCD3BD]">
        <div className="flex items-center gap-3">
          <StarryMascot mood="waving" size={42} className="shrink-0" />
          <div className="text-xs text-[#313B26]">
            <strong className="block text-sm font-black text-[#1E2516]">
              Keep the streak alive!
            </strong>
            Daily 3-minute adaptive drills build long-term synaptic recall for exam day.
          </div>
        </div>

        <button
          onClick={onStartDailySession}
          className="px-6 py-3 rounded-full bg-[#C4F46C] hover:bg-[#b5e958] text-[#1B2213] text-xs font-black shadow-md border border-[#1E2516] flex items-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0"
        >
          <span>Start Daily Session</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
