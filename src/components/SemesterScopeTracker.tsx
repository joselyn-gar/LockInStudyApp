import React from 'react';
import { MilestoneMode, CourseData, CourseMilestone } from '../types';
import { Calendar, CheckCircle2, Clock, Layers, Sparkles, Pencil, Gamepad2, ArrowRight } from 'lucide-react';

interface SemesterScopeTrackerProps {
  course: CourseData;
  milestoneMode: MilestoneMode;
  onToggleMilestoneMode: (mode: MilestoneMode) => void;
  onOpenSettings: () => void;
  onEditCourse?: () => void;
  onStudyMilestone?: (milestone: CourseMilestone) => void;
}

export const SemesterScopeTracker: React.FC<SemesterScopeTrackerProps> = ({
  course,
  milestoneMode,
  onToggleMilestoneMode,
  onOpenSettings,
  onEditCourse,
  onStudyMilestone,
}) => {
  // Calculate term progress safely
  const start = course.startDate ? new Date(course.startDate).getTime() : Date.now();
  const end = course.endDate ? new Date(course.endDate).getTime() : Date.now() + 1000 * 60 * 60 * 24 * 90;
  const now = Date.now();
  const totalDuration = Math.max(1, end - start);
  const elapsed = Math.max(0, Math.min(totalDuration, now - start));
  const progressPercent = Math.round((elapsed / totalDuration) * 100);
  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

  return (
    <div className="w-full bg-[#2E3526] border-2 border-[#4E5842] rounded-3xl p-4 sm:p-6 shadow-md text-white mb-6">
      {/* Top Row: Course badge & Term timeline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#434D39]">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          {/* Flexible, non-squishing Course Code Badge */}
          <div className="shrink-0 min-w-[58px] px-3 h-11 rounded-2xl bg-[#C4F46C] text-[#1B2213] font-black flex items-center justify-center text-xs sm:text-sm tracking-tight shadow-sm whitespace-nowrap border border-[#A2D94B]">
            {course.code}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-xl font-black text-white leading-tight break-words">
                {course.name}
              </h2>
              {onEditCourse && (
                <button
                  type="button"
                  onClick={onEditCourse}
                  className="shrink-0 px-2 py-0.5 rounded-full bg-[#3B4232] hover:bg-[#4E5842] text-[#C4F46C] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#525F46]"
                  title="Edit Class Name or Details"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#B5C4A3] flex flex-wrap items-center gap-2 mt-1">
              <span className="font-medium text-[#D8E6C8]">{course.professor}</span>
              <span className="text-[#5F6E4C]">•</span>
              <span className="font-bold text-white">{course.term}</span>
            </p>
          </div>
        </div>

        {/* Date scope & edit bounds */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 rounded-full bg-[#3B4232] hover:bg-[#4B5540] text-xs font-bold text-[#E2EDD2] border border-[#546048] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#C4F46C]" />
            <span>Scope Bounds</span>
          </button>
          <div className="px-3 py-1.5 rounded-full bg-[#1F241A] text-xs font-bold text-[#C4F46C] border border-[#3A4331] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{daysLeft} days to Finals</span>
          </div>
        </div>
      </div>

      {/* Progress Bar of Term */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-[#AAB897] mb-1.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#C4F46C]" />
            Term Timeline: Week 8 of 16
          </span>
          <span className="font-bold text-white">{progressPercent}% of Semester Completed</span>
        </div>
        <div className="w-full h-3 bg-[#1C2117] rounded-full overflow-hidden p-0.5 border border-[#444E39]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#88B841] to-[#C4F46C] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Milestones Strip */}
      <div className="mt-4 pt-3 border-t border-[#434D39]">
        <div className="flex items-center justify-between text-xs text-[#AAB897] font-semibold mb-2">
          <span className="uppercase tracking-wider text-[10px] font-black text-[#8EA27B]">
            Exam Milestones
          </span>
          <span className="text-[11px] text-[#C4F46C] font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Click Upcoming or Complete to study for that exam
          </span>
        </div>

        {(!course.milestones || course.milestones.length === 0) ? (
          <div className="p-4 rounded-2xl bg-[#22281D]/80 border border-[#4D583F] text-center text-xs text-[#A6B594]">
            No exam milestones configured yet. Click <span className="text-[#C4F46C] font-bold">Edit</span> above to add upcoming exam dates!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {course.milestones.map((m) => (
            <div
              key={m.id}
              onClick={() => onStudyMilestone?.(m)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onStudyMilestone?.(m);
                }
              }}
              title={`Click to study for ${m.name} in the interactive game`}
              className={`group p-3.5 rounded-2xl border text-xs transition-all cursor-pointer relative select-none ${
                m.isCompleted
                  ? 'bg-[#22281D]/80 hover:bg-[#2B3324] border-[#4D583F] hover:border-[#C4F46C] text-[#CEDBC0]'
                  : 'bg-[#373F2E] hover:bg-[#434C38] border-[#5E6D4E] hover:border-[#FFA88A] text-white shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1.5 gap-2">
                <span className="truncate text-xs font-black text-white group-hover:text-[#C4F46C] transition-colors">
                  {m.name}
                </span>

                {/* Interactive Upcoming / Complete Button */}
                {m.isCompleted ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStudyMilestone?.(m);
                    }}
                    title={`Click to review and practice questions for ${m.name}`}
                    className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C4F46C]/15 hover:bg-[#C4F46C] text-[#C4F46C] hover:text-[#1B2213] text-[10px] uppercase font-black tracking-wide border border-[#C4F46C]/35 hover:border-[#C4F46C] transition-all cursor-pointer active:scale-95 shadow-xs"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Complete</span>
                    <span className="text-[9px] font-bold opacity-80 ml-0.5">Study →</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStudyMilestone?.(m);
                    }}
                    title={`Click to start practice exam questions for ${m.name}`}
                    className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D96B43]/20 hover:bg-[#D96B43] text-[#FFA88A] hover:text-white text-[10px] uppercase font-black tracking-wide border border-[#D96B43]/45 hover:border-[#FFA88A] transition-all cursor-pointer active:scale-95 shadow-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFA88A]" />
                    <span>Upcoming</span>
                    <span className="text-[9px] font-bold opacity-90 ml-0.5">Study →</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] text-[#A6B594] flex items-center justify-between mb-2">
                <span>Date: {m.date}</span>
                <span>Modules {m.coverageModules.join(', ')}</span>
              </div>

              {/* Bottom quick-study callout */}
              <div className="pt-2 border-t border-[#444E39]/70 flex items-center justify-between text-[11px]">
                <span className="text-[#8FA27C] text-[10px]">
                  {m.isCompleted ? 'Archived scope' : 'Target exam'}
                </span>
                <span className="inline-flex items-center gap-1 font-black text-[#C4F46C] group-hover:translate-x-0.5 transition-transform">
                  <Gamepad2 className="w-3 h-3" />
                  <span>{m.isCompleted ? 'Review Exam' : 'Study for Exam'}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Crucial Milestone Toggle: Post-Exam Only vs Cumulative Review */}
      <div className="mt-5 pt-4 border-t border-[#434D39] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#242A1D] p-3.5 rounded-2xl border border-[#3E4734]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#3B4232] text-[#C4F46C] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-[#A7B695]">
              Active Study Scope Focus
            </div>
            <div className="text-xs text-[#E1EDD1]">
              Calibrates question pool & forecast targeting
            </div>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="inline-flex p-1 rounded-full bg-[#181D14] border border-[#3B4431] self-start sm:self-auto">
          <button
            onClick={() => onToggleMilestoneMode('post_exam_only')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              milestoneMode === 'post_exam_only'
                ? 'bg-[#C4F46C] text-[#1B2213] shadow-sm'
                : 'text-[#9CAD8A] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Post-Exam Only (New Material)
          </button>
          <button
            onClick={() => onToggleMilestoneMode('cumulative_review')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              milestoneMode === 'cumulative_review'
                ? 'bg-[#C4F46C] text-[#1B2213] shadow-sm'
                : 'text-[#9CAD8A] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Cumulative Review (Day 1 - Current)
          </button>
        </div>
      </div>
    </div>
  );
};
