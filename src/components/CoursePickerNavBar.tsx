import React from 'react';
import { CourseData, MilestoneMode } from '../types';
import {
  BookOpen,
  PlusCircle,
  Pencil,
  Sparkles,
  Gamepad2,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { StarryMascot } from './StarryMascot';

interface CoursePickerNavBarProps {
  courses: CourseData[];
  activeCourse: CourseData | null;
  onSelectCourse: (course: CourseData) => void;
  onAddCourse: () => void;
  onEditCourse: (course: CourseData) => void;
  onStartGame: () => void;
  milestoneMode: MilestoneMode;
  onToggleMilestoneMode: (mode: MilestoneMode) => void;
}

export const CoursePickerNavBar: React.FC<CoursePickerNavBarProps> = ({
  courses,
  activeCourse,
  onSelectCourse,
  onAddCourse,
  onEditCourse,
  onStartGame,
  milestoneMode,
  onToggleMilestoneMode,
}) => {
  // Compute overall mastery for a given course
  const getCourseMastery = (course: CourseData) => {
    if (!course.modules || course.modules.length === 0) return 70;
    const total = course.modules.reduce((sum, m) => sum + m.masteryPercentage, 0);
    return Math.round(total / course.modules.length);
  };

  const activeMastery = activeCourse ? getCourseMastery(activeCourse) : 0;
  const activeQuestionsCount = activeCourse?.questions ? activeCourse.questions.length : 0;

  return (
    <section className="w-full bg-[#F7F4EB] border-4 border-[#2E3526] rounded-3xl p-5 sm:p-6 shadow-xl text-[#1E2516] space-y-5 animate-in fade-in">
      {/* 1. SECTION HEADER: "What class will we be studying for?" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DAC6]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B4232] text-[#C4F46C] text-[11px] font-black uppercase tracking-wider mb-1.5 shadow-xs">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Course Study Selector</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1E2516] tracking-tight flex items-center gap-2">
            <span>What class will we be studying for?</span>
          </h2>
          <p className="text-xs text-[#5D6B4F] mt-0.5 max-w-xl">
            Choose your target course below to calibrate high-yield content, view professor notes, and flow directly into the interactive study game.
          </p>
        </div>

        {/* Action Buttons: Add Class & Edit Active Class */}
        <div className="flex items-center gap-2 shrink-0">
          {activeCourse && (
            <button
              type="button"
              onClick={() => onEditCourse(activeCourse)}
              className="px-3.5 py-2 rounded-full bg-[#EAE2CB] hover:bg-[#DDD2B8] text-[#2F3725] text-xs font-bold border border-[#CCC0A3] flex items-center gap-1.5 transition-colors cursor-pointer"
              title={`Edit ${activeCourse.code} class name, professor, or dates`}
            >
              <Pencil className="w-3.5 h-3.5 text-[#4D5A3D]" />
              <span className="hidden xs:inline">Edit</span> <span>{activeCourse.code}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddCourse}
            className="px-4 py-2 rounded-full bg-[#3B4232] hover:bg-[#282F21] text-[#C4F46C] text-xs font-black border border-[#1E2516] flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-xs"
            title="Create and add your own custom class"
          >
            <PlusCircle className="w-4 h-4 text-[#C4F46C]" />
            <span>+ Add Class</span>
          </button>
        </div>
      </div>

      {/* 2. INTERACTIVE COURSE PICKER RAIL / GRID */}
      <div>
        <div className="text-[11px] font-black uppercase tracking-wider text-[#69775C] mb-2.5 flex items-center justify-between">
          <span>Enrolled Courses ({courses.length}) — Click to Select</span>
          {activeCourse && (
            <span className="text-[10px] font-bold text-[#869578] hidden sm:inline">
              Active: <strong className="text-[#2F3725]">{activeCourse.code}</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {courses.map((course) => {
            const isSelected = activeCourse ? course.id === activeCourse.id : false;
            const mastery = getCourseMastery(course);
            const questionCount = course.questions?.length || 0;

            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCourse(course);
                  }
                }}
                className={`relative rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-[#2E3524] text-white border-3 border-[#A4DF37] shadow-lg shadow-[#A4DF37]/15 ring-2 ring-[#C4F46C]/30 scale-[1.02]'
                    : 'bg-[#ECE5D3] hover:bg-[#E3DABF] text-[#242C1B] border-2 border-[#D5CAA8]'
                }`}
              >
                {/* Active Indicator Pin */}
                {isSelected && (
                  <div className="absolute -top-2.5 -right-2 px-2.5 py-0.5 rounded-full bg-[#C4F46C] text-[#1B2213] text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#1B2213]" />
                    <span>Studying</span>
                  </div>
                )}

                <div>
                  {/* Top Bar on Card: Code + Edit quick button */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-base font-black tracking-tight ${
                        isSelected ? 'text-[#C4F46C]' : 'text-[#1E2516]'
                      }`}
                    >
                      {course.code}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCourse(course);
                      }}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        isSelected
                          ? 'hover:bg-[#465337] text-[#C4F46C]'
                          : 'hover:bg-[#D5CAA8] text-[#556345]'
                      }`}
                      title={`Edit ${course.code} name or details`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Course Title */}
                  <h4
                    className={`text-xs font-bold line-clamp-2 min-h-[2rem] mb-2 leading-snug ${
                      isSelected ? 'text-[#E3ECD3]' : 'text-[#3D4732]'
                    }`}
                  >
                    {course.name}
                  </h4>
                </div>

                {/* Bottom stats row */}
                <div className="pt-2 border-t border-black/10 mt-1 flex items-center justify-between text-[11px]">
                  <span
                    className={`font-semibold ${
                      isSelected ? 'text-[#B4C59F]' : 'text-[#6B795D]'
                    }`}
                  >
                    {course.modules?.length || 0} Modules • {questionCount} Qs
                  </span>

                  <span
                    className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                      isSelected
                        ? 'bg-[#434F35] text-[#C4F46C]'
                        : 'bg-[#DDD2B8] text-[#2F3725]'
                    }`}
                  >
                    {mastery}% Mastery
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick "+ Add New Class" Card */}
          <button
            type="button"
            onClick={onAddCourse}
            className="rounded-2xl p-4 text-left border-2 border-dashed border-[#8B987C] bg-transparent hover:bg-[#EAE2CB]/70 text-[#3F4B32] transition-colors cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[110px] group"
          >
            <div className="w-8 h-8 rounded-full bg-[#EAE2CB] group-hover:bg-[#3B4232] group-hover:text-[#C4F46C] text-[#3B4232] flex items-center justify-center transition-colors">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-black tracking-tight text-[#2B3520]">
              + Add Custom Class
            </span>
            <span className="text-[10px] text-[#69775C] text-center">
              Create your own class & modules
            </span>
          </button>
        </div>
      </div>

      {/* 3. DIRECT FLOW TO THE INTERACTIVE GAME WORK */}
      <div className="w-full bg-[#272D1F] border-2 border-[#48543B] rounded-2xl p-4 sm:p-5 text-white flex flex-col lg:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5 w-full lg:w-auto">
          <StarryMascot mood="waving" size={56} className="shrink-0" />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#3D4733] text-[#C4F46C] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Gamepad2 className="w-3 h-3" />
                Interactive Game Drill Ready
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#1C2116] text-[#A7B896] text-[10px] font-bold border border-[#3C4731] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#A4DF37]" />
                Strict Academic Content (0% Syllabus Trivia)
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Ready to Lock In for <span className="text-[#C4F46C]">{activeCourse?.code || 'Your Course'}</span>{activeCourse ? `: ${activeCourse.name}` : ''}
            </h3>

            <p className="text-xs text-[#A9B997] mt-0.5">
              {activeQuestionsCount} professor-grounded practice questions loaded • Current Course Mastery: <strong className="text-white">{activeMastery}%</strong>
            </p>
          </div>
        </div>

        {/* Study Mode selector & Big Launch Game Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto justify-end shrink-0">
          {/* Milestone mode pills */}
          <div className="inline-flex p-1 rounded-full bg-[#1B2015] border border-[#3E4933] text-[11px] font-bold w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => onToggleMilestoneMode('post_exam_only')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                milestoneMode === 'post_exam_only'
                  ? 'bg-[#C4F46C] text-[#1A2212] font-black shadow-xs'
                  : 'text-[#A0B090] hover:text-white'
              }`}
            >
              Post-Exam Only
            </button>
            <button
              type="button"
              onClick={() => onToggleMilestoneMode('cumulative_review')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                milestoneMode === 'cumulative_review'
                  ? 'bg-[#C4F46C] text-[#1A2212] font-black shadow-xs'
                  : 'text-[#A0B090] hover:text-white'
              }`}
            >
              Cumulative Review
            </button>
          </div>

          {/* Primary CTA: Flow directly to Game Session */}
          <button
            type="button"
            onClick={onStartGame}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#C4F46C] hover:bg-[#b0e551] text-[#1A2212] font-black text-xs sm:text-sm shadow-[0_6px_20px_rgba(196,244,108,0.3)] border border-[#141A0E] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-current text-[#1A2212]" />
            <span>Start Interactive Game Work</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
