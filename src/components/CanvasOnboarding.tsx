import React, { useState, useEffect } from 'react';
import { CourseData, CanvasConfig, MilestoneMode, EmbeddedFileItem, StudyQuestion } from '../types';
import { INITIAL_AVAILABLE_COURSES } from '../data/defaultCourseData';
import { StarryMascot } from './StarryMascot';
import { PatHelpTooltip } from './PatHelpTooltip';
import { FileEmbedSection } from './FileEmbedSection';
import { ClassEditModal } from './ClassEditModal';
import {
  Key,
  Globe,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  BookOpen,
  Layers,
  ChevronRight,
  RefreshCw,
  FolderSync,
  PlusCircle,
  Pencil,
} from 'lucide-react';

interface CanvasOnboardingProps {
  onCompleteOnboarding: (selectedCourses: CourseData[], activeCourse: CourseData, config: CanvasConfig) => void;
  initialConfig?: CanvasConfig;
  initialCourses?: CourseData[];
  onLoadDemoData?: () => void;
}

export const CanvasOnboarding: React.FC<CanvasOnboardingProps> = ({
  onCompleteOnboarding,
  initialConfig,
  initialCourses = [],
  onLoadDemoData,
}) => {
  // Wizard Steps:
  // 1: Connect Canvas & Set Semester (+ Manual File Embedding)
  // 2: Discovered Classes Selection
  // 3: Scraping Modules & Professor Past Exams
  // 4: Set Scope & Launch
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(
    initialConfig || {
      patToken: '',
      domain: 'canvas.instructure.com',
      semesterLabel: 'Fall 2026',
      termStartDate: '2026-08-28',
      termEndDate: '2026-12-15',
      isConnected: false,
      lastSyncedAt: '',
    }
  );

  // Available discovered courses (defaults to empty in blank canvas mode)
  const [availableCourses, setAvailableCourses] = useState<CourseData[]>(initialCourses);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(
    initialCourses.length > 0 ? [initialCourses[0].id] : []
  );
  const [activeCourseId, setActiveCourseId] = useState<string>(
    initialCourses.length > 0 ? initialCourses[0].id : ''
  );
  const [milestoneMode, setMilestoneMode] = useState<MilestoneMode>('post_exam_only');

  // Manual Embedded Files state (starts completely blank in blank canvas mode)
  const [manualFiles, setManualFiles] = useState<EmbeddedFileItem[]>([]);
  const [fileTargetCourseCode, setFileTargetCourseCode] = useState<string>(
    initialCourses.length > 0 ? initialCourses[0].code : ''
  );

  // Scraping progress state for Step 3
  const [scrapeProgress, setScrapeProgress] = useState<number>(0);
  const [scrapeLogs, setScrapeLogs] = useState<string[]>([]);

  // Add & Remove manual files
  const handleAddManualFile = (file: EmbeddedFileItem, extractedQuestions?: StudyQuestion[]) => {
    setManualFiles((prev) => [file, ...prev]);

    // Also link into availableCourses if applicable
    setAvailableCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.code === file.courseCode) {
          return {
            ...c,
            embeddedFiles: [...(c.embeddedFiles || []), file],
            questions:
              extractedQuestions && extractedQuestions.length > 0
                ? [...extractedQuestions, ...c.questions]
                : c.questions,
          };
        }
        return c;
      })
    );
  };

  const handleRemoveManualFile = (fileId: string) => {
    setManualFiles((prev) => prev.filter((f) => f.id !== fileId));
    setAvailableCourses((prevCourses) =>
      prevCourses.map((c) => ({
        ...c,
        embeddedFiles: (c.embeddedFiles || []).filter((f) => f.id !== fileId),
      }))
    );
  };

  // Class creation and editing modal state
  const [isClassEditOpen, setIsClassEditOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);

  const handleOpenCreateClass = () => {
    setEditingCourse(null);
    setIsClassEditOpen(true);
  };

  const handleOpenEditClass = (c: CourseData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCourse(c);
    setIsClassEditOpen(true);
  };

  const handleSaveClass = (savedCourse: CourseData) => {
    setAvailableCourses((prev) => {
      const exists = prev.some((c) => c.id === savedCourse.id);
      if (exists) {
        return prev.map((c) => (c.id === savedCourse.id ? savedCourse : c));
      }
      return [...prev, savedCourse];
    });

    if (!selectedCourseIds.includes(savedCourse.id)) {
      setSelectedCourseIds((prev) => [...prev, savedCourse.id]);
    }
    setActiveCourseId(savedCourse.id);
    setFileTargetCourseCode(savedCourse.code);
    setIsClassEditOpen(false);
  };

  const handleDeleteClass = (courseId: string) => {
    setAvailableCourses((prev) => prev.filter((c) => c.id !== courseId));
    setSelectedCourseIds((prev) => prev.filter((id) => id !== courseId));
    if (activeCourseId === courseId) {
      const remaining = availableCourses.filter((c) => c.id !== courseId);
      if (remaining.length > 0) setActiveCourseId(remaining[0].id);
    }
  };

  // Toggle course selection
  const handleToggleCourse = (id: string) => {
    if (selectedCourseIds.includes(id)) {
      if (selectedCourseIds.length > 1) {
        const next = selectedCourseIds.filter((cid) => cid !== id);
        setSelectedCourseIds(next);
        if (activeCourseId === id) setActiveCourseId(next[0]);
      }
    } else {
      setSelectedCourseIds([...selectedCourseIds, id]);
    }
  };

  // Step 3: Run the scraper animation
  useEffect(() => {
    if (currentStep !== 3) return;

    setScrapeProgress(5);
    setScrapeLogs(['Connecting to Canvas LMS instance...']);

    const timers: number[] = [];

    timers.push(
      window.setTimeout(() => {
        setScrapeProgress(25);
        setScrapeLogs((prev) => [
          ...prev,
          '✓ Scraped academic module concepts & core course content for selected courses',
          '✓ Strict Content Filter: Zero syllabus logistics, 100% intellectual course material',
        ]);
      }, 700)
    );

    timers.push(
      window.setTimeout(() => {
        setScrapeProgress(55);
        setScrapeLogs((prev) => [
          ...prev,
          '✓ Extracted daily lecture notes, slides, and professor mental models',
        ]);
      }, 1500)
    );

    timers.push(
      window.setTimeout(() => {
        setScrapeProgress(80);
        setScrapeLogs((prev) => [
          ...prev,
          `✓ Ingested ${manualFiles.length} manually embedded past exams and slide decks`,
        ]);
      }, 2200)
    );

    timers.push(
      window.setTimeout(() => {
        setScrapeProgress(100);
        setScrapeLogs((prev) => [
          ...prev,
          '✓ Gemini AI Forecasting Engine initialized with professor lecture anchors!',
        ]);
      }, 3000)
    );

    timers.push(
      window.setTimeout(() => {
        setCurrentStep(4);
      }, 3700)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [currentStep, manualFiles.length]);

  // Finish Onboarding
  const handleFinish = () => {
    const chosenCourses = availableCourses.filter((c) => selectedCourseIds.includes(c.id));
    const coursesWithFiles = chosenCourses.map((c) => ({
      ...c,
      embeddedFiles: manualFiles.filter((f) => f.courseCode === c.code),
    }));
    const active =
      coursesWithFiles.find((c) => c.id === activeCourseId) || coursesWithFiles[0];
    onCompleteOnboarding(coursesWithFiles, active, canvasConfig);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-3 sm:px-6 animate-in fade-in duration-300">
      {/* Outer Card with Olive Frame & Off-White Body */}
      <div className="w-full bg-[#F7F4EB] border-4 border-[#3B4232] rounded-[2.5rem] p-6 sm:p-10 shadow-2xl text-[#1E2516]">
        {/* Top Wizard Steps Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1DBCB]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3B4232] text-[#C4F46C] flex items-center justify-center shrink-0 font-black shadow-sm">
              <FolderSync className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#3B4232] text-[#C4F46C] text-[10px] font-black uppercase tracking-wider mb-0.5">
                Step 0{currentStep} of 04 • Canvas Class Onboarding
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E2516] tracking-tight">
                {currentStep === 1 && 'Connect Canvas & Embed Files'}
                {currentStep === 2 && 'Discover & Select Enrolled Classes'}
                {currentStep === 3 && 'Scraping Notes & Professor Past Exams'}
                {currentStep === 4 && 'Calibrate Study Scope & Lock In'}
              </h2>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  currentStep === s
                    ? 'bg-[#3B4232] text-[#C4F46C] scale-110 shadow-sm'
                    : currentStep > s
                    ? 'bg-[#C4F46C] text-[#1B2213]'
                    : 'bg-[#E3DCB8] text-[#717E65]'
                }`}
              >
                {currentStep > s ? '✓' : `0${s}`}
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: CONNECT CANVAS, SET TERM, & MANUALLY EMBED PAST EXAMS / NOTES     */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="mt-6 space-y-6 animate-in fade-in">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#ECE5D2] border border-[#DDD4BE]">
              <StarryMascot mood="thinking" size={56} className="shrink-0" />
              <div className="text-xs text-[#323E28]">
                <strong className="block text-sm font-black text-[#1E2516]">
                  Connect Canvas or Manually Embed Course Content!
                </strong>
                Provide your Canvas token to auto-scrape, or manually drop past exam PDFs and lecture note decks for each of your classes below.
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D4734] mb-1">
                  Canvas LMS Institution Domain
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C886E]" />
                  <input
                    type="text"
                    value={canvasConfig.domain}
                    onChange={(e) => setCanvasConfig({ ...canvasConfig, domain: e.target.value })}
                    placeholder="canvas.instructure.com or canvas.university.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border-2 border-[#D8D1BD] focus:border-[#3B4232] text-xs font-semibold text-[#1F2518] outline-hidden shadow-xs"
                  />
                </div>
              </div>

              {/* Semester Bounds Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3D4734] mb-1">
                    Semester Label
                  </label>
                  <input
                    type="text"
                    value={canvasConfig.semesterLabel}
                    onChange={(e) =>
                      setCanvasConfig({ ...canvasConfig, semesterLabel: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#D8D1BD] focus:border-[#3B4232] text-xs font-semibold text-[#1F2518] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3D4734] mb-1">
                    Term Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7C886E]" />
                    <input
                      type="date"
                      value={canvasConfig.termStartDate}
                      onChange={(e) =>
                        setCanvasConfig({ ...canvasConfig, termStartDate: e.target.value })
                      }
                      className="w-full pl-8 pr-2 py-2 rounded-xl bg-white border-2 border-[#D8D1BD] focus:border-[#3B4232] text-xs font-semibold text-[#1F2518] outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#3D4734] mb-1">
                    Term End Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7C886E]" />
                    <input
                      type="date"
                      value={canvasConfig.termEndDate}
                      onChange={(e) =>
                        setCanvasConfig({ ...canvasConfig, termEndDate: e.target.value })
                      }
                      className="w-full pl-8 pr-2 py-2 rounded-xl bg-white border-2 border-[#D8D1BD] focus:border-[#3B4232] text-xs font-semibold text-[#1F2518] outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Access Token with the Hoverable "?" Sign! */}
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D4734]">
                    Personal Access Token (PAT)
                  </label>

                  {/* The '?' Sign with Hover Tooltip */}
                  <PatHelpTooltip />

                  <span className="text-[10px] text-[#717E64] font-normal ml-auto">
                    (Optional for demo simulation)
                  </span>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C886E]" />
                  <input
                    type="password"
                    value={canvasConfig.patToken}
                    onChange={(e) => setCanvasConfig({ ...canvasConfig, patToken: e.target.value })}
                    placeholder="Enter Canvas token (hover ? above for instructions)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border-2 border-[#D8D1BD] focus:border-[#3B4232] text-xs font-mono text-[#1F2518] outline-hidden shadow-xs"
                  />
                </div>
              </div>

              {/* ======================================================== */}
              {/* OPTION BELOW: MANUALLY EMBED FILES FOR EACH CLASS        */}
              {/* ======================================================== */}
              <div className="pt-2">
                <FileEmbedSection
                  courseCode={fileTargetCourseCode}
                  files={manualFiles.filter((f) => f.courseCode === fileTargetCourseCode)}
                  onAddFile={handleAddManualFile}
                  onRemoveFile={handleRemoveManualFile}
                  availableCourses={availableCourses.map((c) => ({
                    code: c.code,
                    name: c.name,
                  }))}
                  onCourseChange={(newCode) => setFileTargetCourseCode(newCode)}
                  onAddNewClass={handleOpenCreateClass}
                />
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4 border-t border-[#E1DBCB] flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#C4F46C] hover:bg-[#b5e958] text-[#1B2213] font-black text-sm shadow-md border-2 border-[#1E2516] flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <span>Continue to Class Discovery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: CLASS DISCOVERY & SELECTION                      */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="mt-6 space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-[#5D6B4F]">
                Found <strong>{availableCourses.length} active courses</strong> enrolled under <strong>{canvasConfig.semesterLabel}</strong>. Select the classes you want to forecast, or add your own:
              </p>

              <button
                type="button"
                onClick={handleOpenCreateClass}
                className="px-3.5 py-1.5 rounded-full bg-[#3B4232] hover:bg-[#2A3123] text-[#C4F46C] text-xs font-black flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer self-start sm:self-auto shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Add Custom Class</span>
              </button>
            </div>

            {/* Class Cards List */}
            {availableCourses.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border-2 border-dashed border-[#D5CDBC] text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#EBE4D5] text-[#3B4232] mx-auto flex items-center justify-center shadow-xs">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-[#1E2516]">
                    No Classes Added Yet (Blank Canvas)
                  </h3>
                  <p className="text-xs text-[#5D6B4F] max-w-md mx-auto">
                    You can create your custom university course with your own modules and exam dates, or load sample courses to preview how Lock In operates.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleOpenCreateClass}
                    className="px-5 py-2.5 rounded-full bg-[#3B4232] text-[#C4F46C] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-[#2A3123]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Create Custom Class</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onLoadDemoData) onLoadDemoData();
                      setAvailableCourses(INITIAL_AVAILABLE_COURSES);
                      setSelectedCourseIds(['canvas-mgt-301', 'canvas-cs-189']);
                      setActiveCourseId('canvas-mgt-301');
                    }}
                    className="px-4 py-2.5 rounded-full bg-[#EAE2CB] hover:bg-[#DDD3B7] text-[#2F3725] text-xs font-bold border border-[#CCC0A3] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#8AA746]" />
                    <span>Load Sample Classes (Demo)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {availableCourses.map((c) => {
                  const isSelected = selectedCourseIds.includes(c.id);
                  const classFilesCount = manualFiles.filter((f) => f.courseCode === c.code).length;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleToggleCourse(c.id)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start justify-between gap-4 cursor-pointer select-none ${
                        isSelected
                          ? 'bg-white border-[#3B4232] shadow-md'
                          : 'bg-white/60 border-[#D8D1BD] opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isSelected ? 'bg-[#3B4232] text-[#C4F46C]' : 'bg-[#E3DCB8] text-[#697658]'
                          }`}
                        >
                          {c.code.replace(/\s+/g, '')}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-[#3B4232]">
                              {c.code}
                            </span>
                            <span className="text-xs text-[#717E66]">• {c.professor}</span>
                          </div>
                          <h4 className="text-base font-black text-[#1E2516] mt-0.5">{c.name}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#5A674D]">
                            <span className="flex items-center gap-1 font-semibold">
                              <BookOpen className="w-3.5 h-3.5 text-[#3B4232]" />
                              {c.modules.length} Modules
                            </span>
                            <span className="flex items-center gap-1 font-semibold">
                              <FileText className="w-3.5 h-3.5 text-[#3B4232]" />
                              {c.lectureNotes.length} Lecture Notes
                            </span>
                            <span className="flex items-center gap-1 font-semibold">
                              <Layers className="w-3.5 h-3.5 text-[#D96B43]" />
                              {c.pastExams.length} Past Exam Archives
                            </span>
                            {classFilesCount > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-[#C4F46C]/30 text-[#254F10] font-bold">
                                + {classFilesCount} Embedded Files
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 mt-1">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditClass(c, e)}
                          className="p-1.5 px-2.5 rounded-lg bg-[#EFE9D7] hover:bg-[#3B4232] hover:text-[#C4F46C] text-[#3B4632] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Edit Class Code & Title"
                        >
                          <Pencil className="w-3 h-3" />
                          <span className="text-[10px]">Edit</span>
                        </button>

                        {/* Selection Checkbox */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 ${
                            isSelected
                              ? 'bg-[#C4F46C] border-[#1E2516] text-[#1B2213]'
                              : 'border-[#C4BCA8]'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 2 Actions */}
            <div className="pt-4 border-t border-[#E1DBCB] flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-full bg-[#EAE3D0] hover:bg-[#DCD3BD] text-[#333E27] font-bold text-xs transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                disabled={selectedCourseIds.length === 0}
                onClick={() => setCurrentStep(3)}
                className="px-8 py-3.5 rounded-full bg-[#C4F46C] hover:bg-[#b5e958] text-[#1B2213] font-black text-sm shadow-md border-2 border-[#1E2516] flex items-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
              >
                <span>Scrape {selectedCourseIds.length} Selected Classes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: LIVE SCRAPING PIPELINE                           */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="mt-6 space-y-6 flex flex-col items-center animate-in fade-in">
            <StarryMascot mood="focused" size={130} />

            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-black text-[#1E2516]">
                Scraping Course Files & Lecture Notes...
              </h3>
              <p className="text-xs text-[#5E6C51] mt-1 max-w-md">
                Extracting professor notes, embedded past exams, and cross-referencing archives with Gemini.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-lg">
              <div className="flex items-center justify-between text-xs font-black text-[#323D28] mb-1.5">
                <span>Ingestion Progress</span>
                <span>{scrapeProgress}%</span>
              </div>
              <div className="w-full h-3.5 bg-[#E4DCBE] rounded-full overflow-hidden p-0.5 border border-[#CDC2A3]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#80B238] to-[#C4F46C] transition-all duration-300"
                  style={{ width: `${scrapeProgress}%` }}
                />
              </div>
            </div>

            {/* Terminal / Log console */}
            <div className="w-full max-w-lg p-4 rounded-2xl bg-[#2E3526] text-[#E0ECD1] text-xs font-mono space-y-2 border border-[#48533B]">
              {scrapeLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#C4F46C]">›</span>
                  <span className="leading-snug">{log}</span>
                </div>
              ))}
              {scrapeProgress < 100 && (
                <div className="flex items-center gap-2 text-[#9EAE89] pt-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C4F46C]" />
                  <span>Processing Canvas media packets & custom PDFs...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: REVIEW & SELECT PRIMARY CLASS TO LAUNCH          */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="mt-6 space-y-6 animate-in fade-in">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#E8F8D0] border border-[#95D44A]">
              <StarryMascot mood="triumphant" size={56} className="shrink-0" />
              <div className="text-xs text-[#254F11]">
                <strong className="block text-sm font-black text-[#1E2516]">
                  {selectedCourseIds.length} Classes Ready & Scraped!
                </strong>
                Choose your primary class to begin today’s adaptive session. You can switch courses anytime from the top bar!
              </div>
            </div>

            {/* Active Class Selector Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D4734] mb-2">
                Select Active Focus Class:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableCourses
                  .filter((c) => selectedCourseIds.includes(c.id))
                  .map((c) => {
                    const isActive = activeCourseId === c.id;
                    const classFilesCount = manualFiles.filter((f) => f.courseCode === c.code).length;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setActiveCourseId(c.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isActive
                            ? 'bg-white border-[#3B4232] shadow-md ring-2 ring-[#C4F46C]'
                            : 'bg-white/60 border-[#D8D1BD] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#3B4232] text-[#C4F46C] text-[10px] font-black">
                              {c.code}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#2E5817] bg-[#E8F8D0] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-[#396A1E]" /> Active Focus
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-black text-[#1E2516] mt-1">{c.name}</h4>
                          <p className="text-[11px] text-[#69785D] mt-0.5">{c.professor}</p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-[#EDE7D6] flex items-center justify-between text-[11px] text-[#556447]">
                          <span>{c.modules.length} Modules</span>
                          <span>
                            {c.pastExams.length} Exams
                            {classFilesCount > 0 && ` (+${classFilesCount} files)`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Milestone Scope Setting */}
            <div className="p-4 rounded-2xl bg-[#ECE5D2] border border-[#DDD4BE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-[#3B4531]">
                  Default Study Scope:
                </div>
                <div className="text-xs text-[#5D6B50]">
                  Focus on new post-exam material or include Day 1 cumulative review.
                </div>
              </div>

              <div className="inline-flex p-1 rounded-full bg-[#272D20] text-xs">
                <button
                  onClick={() => setMilestoneMode('post_exam_only')}
                  className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                    milestoneMode === 'post_exam_only'
                      ? 'bg-[#C4F46C] text-[#1B2213]'
                      : 'text-[#9CAD8A] hover:text-white'
                  }`}
                >
                  Post-Exam Only
                </button>
                <button
                  onClick={() => setMilestoneMode('cumulative_review')}
                  className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                    milestoneMode === 'cumulative_review'
                      ? 'bg-[#C4F46C] text-[#1B2213]'
                      : 'text-[#9CAD8A] hover:text-white'
                  }`}
                >
                  Cumulative
                </button>
              </div>
            </div>

            {/* Launch App Button */}
            <div className="pt-4 border-t border-[#E1DBCB] flex justify-end">
              <button
                onClick={handleFinish}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#C4F46C] hover:bg-[#b5e958] text-[#1B2213] font-black text-base shadow-xl border-2 border-[#1E2516] flex items-center justify-center gap-3 cursor-pointer transition-transform active:scale-95"
              >
                <Sparkles className="w-5 h-5 text-[#1B2213]" />
                <span>Finish Setup & Lock In!</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Class Create / Edit Modal */}
      <ClassEditModal
        isOpen={isClassEditOpen}
        onClose={() => setIsClassEditOpen(false)}
        courseToEdit={editingCourse}
        onSaveCourse={handleSaveClass}
        onDeleteCourse={handleDeleteClass}
        canDelete={availableCourses.length > 1}
      />
    </div>
  );
};
