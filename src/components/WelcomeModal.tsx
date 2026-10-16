import React, { useState } from 'react';
import { StarryMascot } from './StarryMascot';
import {
  Sparkles,
  Layers,
  Gamepad2,
  Calendar,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  X,
  Flame,
  Award,
  FileText,
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: () => void;
  onGoToDashboard: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  onGoToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'start'>('overview');

  if (!isOpen) return null;

  const handleStartGame = () => {
    localStorage.setItem('lockin_welcome_seen', 'true');
    onClose();
    onStartGame();
  };

  const handleGoToDashboard = () => {
    localStorage.setItem('lockin_welcome_seen', 'true');
    onClose();
    onGoToDashboard();
  };

  const handleDismiss = () => {
    localStorage.setItem('lockin_welcome_seen', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1D2218]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#F7F4EB] border-4 border-[#3B4232] rounded-[2.5rem] shadow-2xl text-[#1E2516] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header Banner */}
        <div className="p-5 sm:p-6 bg-[#3B4232] text-white flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="bg-[#262C20] p-1.5 rounded-2xl border border-[#4F5943] shadow-inner">
              <StarryMascot mood="waving" size={46} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C4F46C] text-[#1B2213] text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" /> New Student Guide
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Welcome to LOCK</span>
                <span className="text-[#C4F46C]">IN</span>
              </h2>
              <p className="text-xs text-[#CAD7B9]">
                Your course-specific exam forecaster & adaptive study system
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-2 rounded-full hover:bg-[#4E5943] text-[#CAD7B9] hover:text-white transition-colors cursor-pointer"
            title="Close Welcome Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 px-5 sm:px-6 pt-4 pb-2 border-b border-[#E3DCB8] bg-[#F1ECD9] shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-[#3B4232] text-[#C4F46C] shadow-xs'
                : 'text-[#647253] hover:text-[#252E1D]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. What is Lock In?</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'bg-[#3B4232] text-[#C4F46C] shadow-xs'
                : 'text-[#647253] hover:text-[#252E1D]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Core Features</span>
          </button>
          <button
            onClick={() => setActiveTab('start')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'start'
                ? 'bg-[#3B4232] text-[#C4F46C] shadow-xs'
                : 'text-[#647253] hover:text-[#252E1D]'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>3. Where to Start</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-[#EBE4D0] border border-[#DDD3BC] flex flex-col sm:flex-row items-center gap-4">
                <StarryMascot mood="waving" size={70} className="shrink-0" />
                <div className="space-y-1 text-xs text-[#28321F] text-center sm:text-left">
                  <h3 className="text-sm font-black text-[#1E2516]">
                    Built for Real Exams, Not Syllabus Trivia
                  </h3>
                  <p className="leading-relaxed">
                    Most flashcard apps test you on textbook definitions or administrative details. <strong>Lock In</strong> is different: it analyzes <strong>substantive academic concepts, lecture transcript nuances, and historical exam questions</strong> to teach you how your specific professor phrases and grades questions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#E1DBCA] space-y-1">
                  <div className="font-black text-[#8E3214] flex items-center gap-1.5">
                    <span>❌ Generic Study Apps</span>
                  </div>
                  <p className="text-[#647257] leading-relaxed text-[11px]">
                    Ask about homework deadlines, grade weights, or generic definitions that don't match your professor's strict exam rubric.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EDF8D6] border-2 border-[#98D849] space-y-1">
                  <div className="font-black text-[#265313] flex items-center gap-1.5">
                    <span>✅ Lock In Study Engine</span>
                  </div>
                  <p className="text-[#365922] leading-relaxed text-[11px]">
                    Tests core concepts, professor counter-examples, and high-miss past exam problems with instant rubric feedback.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border-2 border-[#E2DCBA] space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#4E5C41]">
                  What Powers Your Sessions:
                </h4>
                <ul className="space-y-2 text-xs text-[#2E3725]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7BB429] shrink-0 mt-0.5" />
                    <span><strong>Scraped Professor Notes:</strong> Exact mental models and verbatim quotes from class slides.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7BB429] shrink-0 mt-0.5" />
                    <span><strong>Historical Exam Archives:</strong> Real past midterm & final exam problems with rubric traps.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7BB429] shrink-0 mt-0.5" />
                    <span><strong>Gemini AI Forecaster:</strong> High-probability predicted questions focused on your upcoming test.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: CORE FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Feature 1 */}
                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#E2DCBA] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#3B4232] text-[#C4F46C] flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-black text-sm text-[#1E2516]">Living Zoom Opening</span>
                  </div>
                  <p className="text-[#59664B] text-[11px] leading-relaxed">
                    A cinematic living zoom sequence that immerses you into today's focus topic and provides quick launch bubble options.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#E2DCBA] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#3B4232] text-[#C4F46C] flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-black text-sm text-[#1E2516]">Milestone Scope Modes</span>
                  </div>
                  <p className="text-[#59664B] text-[11px] leading-relaxed">
                    Toggle between <strong>Post-Exam Only</strong> (drilling new un-tested units for Exam 2) and <strong>Cumulative Review</strong> for comprehensive finals.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#E2DCBA] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#3B4232] text-[#C4F46C] flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-black text-sm text-[#1E2516]">Course Picker & Add Class</span>
                  </div>
                  <p className="text-[#59664B] text-[11px] leading-relaxed">
                    Switch between classes with one click, edit professor details, or create custom courses with your own module syllabi and lecture slides.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#E2DCBA] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#3B4232] text-[#C4F46C] flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-black text-sm text-[#1E2516]">Adaptive 10-Question Drill</span>
                  </div>
                  <p className="text-[#59664B] text-[11px] leading-relaxed">
                    Quick daily sessions calibrated to your diagnostic weaknesses with Starry reaction animations, streak counting, and mastery XP.
                  </p>
                </div>
              </div>

              {/* Feature 5 Banner */}
              <div className="p-3.5 rounded-2xl bg-[#EBE4D0] border border-[#DDD3BC] flex items-center gap-3 text-xs">
                <FileText className="w-5 h-5 text-[#3B4232] shrink-0" />
                <p className="text-[#2F3924] leading-relaxed text-[11px]">
                  <strong>Embed Custom Course Files:</strong> In the Scraped Notes tab, upload lecture slides, PDF past exams, or study guides to automatically extract exam-ready practice problems!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: WHERE TO START */}
          {activeTab === 'start' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-white border-2 border-[#E2DCBA] flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#3B4232] text-[#C4F46C] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <strong className="block text-sm font-black text-[#1E2516]">
                      Start with a Blank Slate or Connect Canvas
                    </strong>
                    <p className="text-[#5B674D]">
                      Add your own university classes, connect your Canvas LMS token to sync syllabi and modules, or click <strong>Load Sample Data</strong> anytime to test-drive.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-white border-2 border-[#E2DCBA] flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#3B4232] text-[#C4F46C] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <strong className="block text-sm font-black text-[#1E2516]">
                      Set Your Milestone Review Mode
                    </strong>
                    <p className="text-[#5B674D]">
                      Focus on <strong>Post-Exam Only</strong> to lock in topics since Exam 1, or toggle to <strong>Cumulative Review</strong> to rehearse the entire term.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-white border-2 border-[#E2DCBA] flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#3B4232] text-[#C4F46C] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <strong className="block text-sm font-black text-[#1E2516]">
                      Launch Your Daily Practice Session
                    </strong>
                    <p className="text-[#5B674D]">
                      Complete today’s 10-question adaptive drill. You’ll earn XP, protect your study streak, and raise your course module mastery percentage!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#E8F5D2] border border-[#A4DF55] text-xs text-[#2A5714]">
                <Flame className="w-4 h-4 text-[#D96B43] shrink-0 fill-current" />
                <span>Daily consistency keeps your streak alive and builds real exam intuition.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-[#EDE7D6] border-t border-[#DFD8C4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#626F54]">
            <Award className="w-4 h-4 text-[#8BA466]" />
            <span>Ready to lock in your study session?</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleGoToDashboard}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-[#3B4232] hover:bg-[#2B3124] text-white text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              Explore Dashboard 🏠
            </button>

            <button
              onClick={handleStartGame}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-[#C4F46C] hover:bg-[#b2e557] text-[#1B2213] text-xs font-black transition-transform active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5 border border-[#1E2516]"
            >
              <span>Start Daily Drill ⚡</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
