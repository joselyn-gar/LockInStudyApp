import React, { useState } from 'react';
import { ForecastItem, MilestoneMode, CourseData } from '../types';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, BookOpen, Clock } from 'lucide-react';
import { StarryMascot } from './StarryMascot';

interface ForecastEngineViewProps {
  course: CourseData;
  milestoneMode: MilestoneMode;
  forecasts: ForecastItem[];
  onRefreshForecasts: () => Promise<void>;
  isGenerating: boolean;
  onLaunchQuestionPractice: (forecast: ForecastItem) => void;
}

export const ForecastEngineView: React.FC<ForecastEngineViewProps> = ({
  course,
  milestoneMode,
  forecasts,
  onRefreshForecasts,
  isGenerating,
  onLaunchQuestionPractice,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(forecasts[0]?.id || null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({});
  const [revealedResults, setRevealedResults] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSelectAnswer = (forecastId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [forecastId]: optionIndex }));
    setRevealedResults((prev) => ({ ...prev, [forecastId]: true }));
  };

  return (
    <div className="w-full bg-[#F7F4EB] border-4 border-[#3B4232] rounded-[2.5rem] p-6 sm:p-8 shadow-xl text-[#1E2516] mb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1DBCB]">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#3B4232] text-[#C4F46C] flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#3B4232] text-[#C4F46C] text-[11px] font-black uppercase tracking-wider mb-1">
              Gemini AI Forecasting Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1F2617] tracking-tight">
              Forecasted Exam Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#5B674E] mt-0.5">
              Cross-referencing {(course.pastExams || []).length} past exam archives against {(course.lectureNotes || []).length} scraped lecture notes • Mode: <span className="font-bold text-[#1E2516]">{milestoneMode === 'post_exam_only' ? 'Post-Exam Only' : 'Cumulative Review'}</span>
            </p>
          </div>
        </div>

        {/* Action Button: Refresh Forecasts */}
        <button
          disabled={isGenerating}
          onClick={onRefreshForecasts}
          className="px-4 py-2.5 rounded-full bg-[#3B4232] hover:bg-[#2C3225] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C4F46C] ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Analyzing Lecture Transcripts...' : 'Regenerate Forecasts'}
        </button>
      </div>

      {/* Info Callout */}
      <div className="my-5 p-3.5 rounded-2xl bg-[#ECE5D2] border border-[#DDD4BE] flex items-center gap-3 text-xs text-[#3D4733]">
        <StarryMascot mood="thinking" size={42} className="shrink-0" />
        <p>
          <strong>Starry’s Forecast Heuristic:</strong> We detect recurrent rubric questions where past cohorts suffered &gt;35% miss rates and where the professor emphasized a counter-intuitive nuance in recent lectures.
        </p>
      </div>

      {/* Forecast Cards List */}
      {forecasts.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border-2 border-dashed border-[#D8D0BD] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EBE4D5] text-[#3B4232] mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#7E9A3C]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-[#1E2516]">No Forecasted Questions Generated Yet</h3>
            <p className="text-xs text-[#5D6B4F] max-w-md mx-auto">
              Click &quot;Regenerate Forecasts&quot; above to have Gemini cross-reference your course topics and predict high-probability exam questions!
            </p>
          </div>
          <button
            disabled={isGenerating}
            onClick={onRefreshForecasts}
            className="px-5 py-2.5 rounded-full bg-[#3B4232] hover:bg-[#2C3225] text-[#C4F46C] text-xs font-black shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Forecasts with AI</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {forecasts.map((fc) => {
          const isExpanded = expandedId === fc.id;
          const userChoice = selectedAnswers[fc.id];
          const isRevealed = revealedResults[fc.id];
          const isCorrect = userChoice === fc.forecastedQuestion.correctIndex;

          return (
            <div
              key={fc.id}
              className={`rounded-3xl border-2 transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-white border-[#3B4232] shadow-md'
                  : 'bg-white/80 border-[#E4DEC9] hover:border-[#B5C4A3]'
              }`}
            >
              {/* Card Header Accordion */}
              <div
                onClick={() => toggleExpand(fc.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  {/* Probability Gauge Badge */}
                  <div className="w-14 h-14 rounded-2xl bg-[#3B4232] text-white flex flex-col items-center justify-center shrink-0 border border-[#272D20]">
                    <span className="text-base font-black text-[#C4F46C] leading-none">
                      {fc.probabilityScore}%
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#A3B392]">
                      Prob.
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#C4F46C] text-[#1B2213] text-[10px] font-black uppercase tracking-wider">
                        {fc.confidenceLevel} Likelihood
                      </span>
                      <span className="text-xs font-semibold text-[#66725A] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Upcoming Exam 2 Target
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-[#1C2314]">
                      {fc.topic}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-bold text-[#576449]">
                    {isExpanded ? 'Hide Details' : 'View Question & Rubric'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#F3EEDF] flex items-center justify-center text-[#3B4232]">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Card Details */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-[#F0EAD9] space-y-4 animate-in fade-in duration-200">
                  {/* Two Column Ingestion Anchors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Past Exam Anchor */}
                    <div className="p-3.5 rounded-2xl bg-[#F7F4EB] border border-[#E3DCB8]">
                      <div className="font-black text-[#262E1D] flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5 text-[#3B4232]" />
                        Professor Past Exam Anchor
                      </div>
                      <div className="font-extrabold text-[#1F2617]">{fc.pastExamAnchor}</div>
                      <p className="text-[#647156] mt-1 text-[11px] leading-relaxed">
                        {fc.whyWillBeTested}
                      </p>
                    </div>

                    {/* Lecture Note Anchor */}
                    <div className="p-3.5 rounded-2xl bg-[#F7F4EB] border border-[#E3DCB8]">
                      <div className="font-black text-[#262E1D] flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-[#D96B43]" />
                        Lecture Note Anchor
                      </div>
                      <div className="font-extrabold text-[#1F2617]">{fc.lectureNoteAnchor}</div>
                      <p className="text-[#647156] mt-1 text-[11px] italic leading-relaxed">
                        "{fc.professorFraming}"
                      </p>
                    </div>
                  </div>

                  {/* Interactive Practice Question */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#2E3526] text-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#C4F46C] px-2.5 py-0.5 rounded-full bg-[#3B4232]">
                        Forecasted Exam Question
                      </span>
                      <span className="text-xs text-[#A8B795]">
                        Simulated in Professor’s Phrasing
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-white mb-4 leading-relaxed">
                      {fc.forecastedQuestion.question}
                    </p>

                    {/* Options list */}
                    <div className="space-y-2">
                      {fc.forecastedQuestion.options.map((opt, idx) => {
                        let btnStyle = 'bg-[#3A4330] hover:bg-[#48533D] text-[#E7EFE0] border-[#4E5943]';
                        if (isRevealed) {
                          if (idx === fc.forecastedQuestion.correctIndex) {
                            btnStyle = 'bg-[#C4F46C] text-[#1B2213] border-[#C4F46C] font-black';
                          } else if (idx === userChoice) {
                            btnStyle = 'bg-[#D96B43] text-white border-[#D96B43] font-black';
                          } else {
                            btnStyle = 'bg-[#292F22] text-[#869575] border-[#38422F] opacity-50';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectAnswer(fc.id, idx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                          >
                            <span className="w-5 h-5 rounded-md bg-black/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Result and Professor Notes Only Explanation */}
                    {isRevealed && (
                      <div className="mt-4 pt-4 border-t border-[#46513A] animate-in fade-in">
                        {isCorrect ? (
                          <div className="p-3.5 rounded-xl bg-[#C4F46C]/20 border border-[#C4F46C]/40 text-[#C4F46C] mb-3 flex items-center gap-2 text-xs font-bold">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            Correct! Locked in according to the professor’s exact mental model.
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-[#D96B43]/20 border border-[#D96B43]/50 text-[#FFA080] mb-3 flex items-center gap-2 text-xs font-bold">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            Missed. Check the professor’s exact rubric rationale below!
                          </div>
                        )}

                        <div className="p-3.5 rounded-xl bg-[#23291C] border border-[#3E4734] space-y-2 text-xs">
                          <div>
                            <span className="font-black text-[#C4F46C] uppercase text-[10px] tracking-wider block mb-0.5">
                              Professor Notes Only Explanation
                            </span>
                            <p className="text-[#E2ECD2] leading-relaxed">
                              {fc.forecastedQuestion.professorExplanation}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#373F2E]">
                            <span className="font-black text-[#FFA787] uppercase text-[10px] tracking-wider block mb-0.5">
                              ⚠️ Why Generic Textbook Definitions Fail Here
                            </span>
                            <p className="text-[#C6D2B6] leading-relaxed">
                              {fc.forecastedQuestion.pitfallWarning}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
