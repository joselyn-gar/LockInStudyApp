import { useState, useEffect } from 'react';
import { DEFAULT_MGT_COURSE, INITIAL_FORECASTS, INITIAL_AVAILABLE_COURSES } from './data/defaultCourseData';
import {
  CourseData,
  MilestoneMode,
  CanvasConfig,
  ForecastItem,
  CourseMilestone,
  DailyProgressPoint,
  EmbeddedFileItem,
  StudyQuestion,
} from './types';
import { AppShell, ShellRoute } from './components/AppShell';
import { GameSession, SessionResult } from './components/GameSession';
import { CanvasSettingsModal } from './components/CanvasSettingsModal';
import { ClassEditModal } from './components/ClassEditModal';
import { SetupFlow } from './screens/SetupFlow';
import { TodayScreen } from './screens/TodayScreen';
import { ExamsScreen } from './screens/ExamsScreen';
import { ForecastScreen } from './screens/ForecastScreen';
import { GamesScreen } from './screens/GamesScreen';
import { MasteryScreen } from './screens/MasteryScreen';
import { SourcesScreen } from './screens/SourcesScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { courseMastery, forecastToQuestion, nextExamFor, todayIso, UpcomingExam } from './lib/derive';
import { dayLabel, liveStreak, nextStreak, yesterdayIso } from './lib/streak';

const STORAGE_KEYS = {
  COURSES: 'lockin_courses',
  ACTIVE_COURSE_ID: 'lockin_active_course_id',
  CANVAS_CONFIG: 'lockin_canvas_config',
  TOTAL_XP: 'lockin_total_xp',
  STREAK: 'lockin_streak',
  LAST_STUDY_DAY: 'lockin_last_study_day',
  STUDY_HISTORY: 'lockin_study_history',
  MILESTONE_MODE: 'lockin_milestone_mode',
};

const DEMO_STUDY_HISTORY: DailyProgressPoint[] = [
  {
    date: 'Mon Oct 5',
    fullDate: '2026-10-05',
    xpEarned: 20,
    cumulativeXp: 20,
    masteryPercentage: 65,
    questionsAnswered: 8,
    focusArea: 'Foundations & Principles',
  },
  {
    date: 'Tue Oct 6',
    fullDate: '2026-10-06',
    xpEarned: 35,
    cumulativeXp: 55,
    masteryPercentage: 72,
    questionsAnswered: 14,
    focusArea: 'Module 2 Applied Frameworks',
  },
  {
    date: 'Wed Oct 7',
    fullDate: '2026-10-07',
    xpEarned: 25,
    cumulativeXp: 80,
    masteryPercentage: 76,
    questionsAnswered: 10,
    focusArea: 'Strategy Nuances & Rubrics',
  },
  {
    date: 'Thu Oct 8',
    fullDate: '2026-10-08',
    xpEarned: 40,
    cumulativeXp: 120,
    masteryPercentage: 83,
    questionsAnswered: 16,
    focusArea: 'Midterm 1 Review Drill',
  },
  {
    date: 'Fri Oct 9',
    fullDate: '2026-10-09',
    xpEarned: 15,
    cumulativeXp: 135,
    masteryPercentage: 85,
    questionsAnswered: 6,
    focusArea: 'Post-Exam Frontiers',
  },
  {
    date: 'Sat Oct 10',
    fullDate: '2026-10-10',
    xpEarned: 30,
    cumulativeXp: 165,
    masteryPercentage: 88,
    questionsAnswered: 12,
    focusArea: 'Network Effects Case Study',
  },
  {
    date: 'Sun Oct 11',
    fullDate: '2026-10-11',
    xpEarned: 25,
    cumulativeXp: 190,
    masteryPercentage: 91,
    questionsAnswered: 10,
    focusArea: 'Comprehensive Integration',
  },
];

const BLANK_CANVAS_CONFIG: CanvasConfig = {
  patToken: '',
  domain: 'canvas.instructure.com',
  semesterLabel: 'Fall 2026',
  termStartDate: '2026-08-28',
  termEndDate: '2026-12-15',
  isConnected: false,
  lastSyncedAt: '',
};

type View = 'setup' | ShellRoute | 'game' | 'results';

const load = <T,>(key: string, fallback: T, parse: (raw: string) => T = JSON.parse): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return parse(raw);
  } catch {}
  return fallback;
};

const save = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
};

export default function App() {
  // ---------------------------------------------------------------- state
  const [enrolledCourses, setEnrolledCourses] = useState<CourseData[]>(() => {
    const parsed = load<unknown>(STORAGE_KEYS.COURSES, []);
    return Array.isArray(parsed) ? (parsed as CourseData[]) : [];
  });

  const [activeCourse, setActiveCourse] = useState<CourseData | null>(() => {
    const parsed = load<CourseData[]>(STORAGE_KEYS.COURSES, []);
    const savedActiveId = load<string>(STORAGE_KEYS.ACTIVE_COURSE_ID, '', (r) => r);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.find((c) => c.id === savedActiveId) || parsed[0];
    return null;
  });

  const [view, setView] = useState<View>(() => (enrolledCourses.length ? 'today' : 'setup'));

  const [milestoneMode, setMilestoneMode] = useState<MilestoneMode>(() =>
    load<MilestoneMode>(STORAGE_KEYS.MILESTONE_MODE, 'post_exam_only', (r) => (r === 'cumulative_review' ? r : 'post_exam_only')),
  );
  const [forecasts, setForecasts] = useState<ForecastItem[]>(() => (enrolledCourses.length > 0 ? INITIAL_FORECASTS : []));
  const [isGeneratingForecasts, setIsGeneratingForecasts] = useState<boolean>(false);
  const [forecastError, setForecastError] = useState<string>('');

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(() => load(STORAGE_KEYS.CANVAS_CONFIG, BLANK_CANVAS_CONFIG));
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const [totalXp, setTotalXp] = useState<number>(() => load(STORAGE_KEYS.TOTAL_XP, 0, (r) => parseInt(r, 10) || 0));
  const [lastStudyDay, setLastStudyDay] = useState<string>(() => load(STORAGE_KEYS.LAST_STUDY_DAY, '', (r) => r));
  const [currentStreak, setCurrentStreak] = useState<number>(() =>
    liveStreak(
      load(STORAGE_KEYS.STREAK, 0, (r) => parseInt(r, 10) || 0),
      load(STORAGE_KEYS.LAST_STUDY_DAY, '', (r) => r)
    )
  );
  const [studyHistory, setStudyHistory] = useState<DailyProgressPoint[]>(() => load(STORAGE_KEYS.STUDY_HISTORY, []));

  const [isClassEditModalOpen, setIsClassEditModalOpen] = useState<boolean>(false);
  const [courseToEdit, setCourseToEdit] = useState<CourseData | null>(null);

  // Current game session
  const [selectedMilestoneForGame, setSelectedMilestoneForGame] = useState<CourseMilestone | null>(null);
  const [fixedQuestions, setFixedQuestions] = useState<StudyQuestion[] | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [readinessBefore, setReadinessBefore] = useState(0);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [returnTo, setReturnTo] = useState<ShellRoute>('today');

  // ---------------------------------------------------------- persistence
  useEffect(() => save(STORAGE_KEYS.COURSES, JSON.stringify(enrolledCourses)), [enrolledCourses]);
  useEffect(() => save(STORAGE_KEYS.ACTIVE_COURSE_ID, activeCourse ? activeCourse.id : null), [activeCourse]);
  useEffect(() => save(STORAGE_KEYS.CANVAS_CONFIG, JSON.stringify(canvasConfig)), [canvasConfig]);
  useEffect(() => save(STORAGE_KEYS.TOTAL_XP, String(totalXp)), [totalXp]);
  useEffect(() => save(STORAGE_KEYS.STREAK, String(currentStreak)), [currentStreak]);
  useEffect(() => save(STORAGE_KEYS.LAST_STUDY_DAY, lastStudyDay || null), [lastStudyDay]);
  useEffect(() => save(STORAGE_KEYS.STUDY_HISTORY, JSON.stringify(studyHistory)), [studyHistory]);
  useEffect(() => save(STORAGE_KEYS.MILESTONE_MODE, milestoneMode), [milestoneMode]);

  // Mastery and file changes land on activeCourse first. Mirror them into the
  // saved course list so they survive a reload and show on Today's rings.
  useEffect(() => {
    if (!activeCourse) return;
    setEnrolledCourses((prev) => {
      const i = prev.findIndex((c) => c.id === activeCourse.id);
      if (i === -1 || prev[i] === activeCourse) return prev;
      const copy = [...prev];
      copy[i] = activeCourse;
      return copy;
    });
  }, [activeCourse]);

  // ------------------------------------------------------------- helpers
  const handleLoadDemoData = () => {
    setEnrolledCourses(INITIAL_AVAILABLE_COURSES);
    setActiveCourse(DEFAULT_MGT_COURSE);
    setForecasts(INITIAL_FORECASTS);
    setTotalXp(145);
    setCurrentStreak(4);
    setLastStudyDay(yesterdayIso());
    setStudyHistory(DEMO_STUDY_HISTORY);
    setCanvasConfig({
      patToken: '',
      domain: 'canvas.instructure.com',
      semesterLabel: 'Fall 2026',
      termStartDate: '2026-08-28',
      termEndDate: '2026-12-15',
      isConnected: true,
      lastSyncedAt: '2 min ago',
    });
  };

  const handleResetToBlankCanvas = () => {
    setEnrolledCourses([]);
    setActiveCourse(null);
    setForecasts([]);
    setTotalXp(0);
    setCurrentStreak(0);
    setLastStudyDay('');
    setStudyHistory([]);
    setCanvasConfig(BLANK_CANVAS_CONFIG);
    Object.values(STORAGE_KEYS).forEach((k) => save(k, null));
    setView('setup');
  };

  const handleOpenCreateClass = () => {
    setCourseToEdit(null);
    setIsClassEditModalOpen(true);
  };

  const handleOpenEditClass = (course: CourseData) => {
    setCourseToEdit(course);
    setIsClassEditModalOpen(true);
  };

  const handleSaveCourse = (savedCourse: CourseData) => {
    setEnrolledCourses((prev) => {
      const exists = prev.some((c) => c.id === savedCourse.id);
      if (exists) return prev.map((c) => (c.id === savedCourse.id ? savedCourse : c));
      return [...prev, savedCourse];
    });
    setActiveCourse(savedCourse);
    if (view === 'setup') setView('today');
  };

  const handleDeleteCourse = (courseId: string) => {
    setEnrolledCourses((prev) => {
      const remaining = prev.filter((c) => c.id !== courseId);
      if (activeCourse?.id === courseId) setActiveCourse(remaining.length > 0 ? remaining[0] : null);
      return remaining;
    });
  };

  const handleUpdateMilestones = (courseId: string, milestones: CourseMilestone[]) => {
    setEnrolledCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, milestones } : c)));
    setActiveCourse((prev) => (prev && prev.id === courseId ? { ...prev, milestones } : prev));
  };

  const handleAddFile = (newFile: EmbeddedFileItem, extractedQuestions?: StudyQuestion[]) => {
    const apply = (c: CourseData): CourseData =>
      c.code === newFile.courseCode
        ? {
            ...c,
            embeddedFiles: [newFile, ...(c.embeddedFiles || [])],
            questions:
              extractedQuestions && extractedQuestions.length > 0 ? [...extractedQuestions, ...c.questions] : c.questions,
          }
        : c;
    setEnrolledCourses((prev) => prev.map(apply));
    setActiveCourse((prev) => (prev ? apply(prev) : prev));
  };

  const handleRemoveFile = (fileId: string) => {
    const apply = (c: CourseData): CourseData => ({
      ...c,
      embeddedFiles: (c.embeddedFiles || []).filter((f) => f.id !== fileId),
    });
    setEnrolledCourses((prev) => prev.map(apply));
    setActiveCourse((prev) => (prev ? apply(prev) : prev));
  };

  // Sync with Canvas API proxy backend
  const handleTriggerCanvasSync = async (cfg: CanvasConfig): Promise<boolean> => {
    try {
      const res = await fetch('/api/canvas/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cfg.patToken, domain: cfg.domain }),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/canvas/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: canvasConfig.patToken, domain: canvasConfig.domain }),
      });
      const data = await res.json();
      if (data.success && data.live) {
        setCanvasConfig((c) => ({
          ...c,
          isConnected: true,
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        }));
        setSyncMessage(`Canvas answered with ${Array.isArray(data.data) ? data.data.length : 0} courses.`);
      } else {
        setSyncMessage('Canvas didn’t answer. Check your address and token in Canvas settings.');
      }
    } catch {
      setSyncMessage('Couldn’t reach the Lock In server.');
    } finally {
      setIsSyncing(false);
    }
  };

  // AI Exam Forecasting Engine call (Gemini via Express server)
  const handleRefreshForecasts = async () => {
    if (!activeCourse) {
      setForecasts([]);
      return;
    }
    setIsGeneratingForecasts(true);
    setForecastError('');
    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: activeCourse.name,
          modules: activeCourse.modules || [],
          pastExams: activeCourse.pastExams || [],
          lectureNotes: activeCourse.lectureNotes || [],
          milestoneMode: milestoneMode === 'post_exam_only' ? 'Post-Exam Only' : 'Cumulative Review',
        }),
      });

      const data = await res.json();
      if (data && data.forecasts && data.forecasts.length > 0) {
        setForecasts(data.forecasts);
      } else if (data && data.error) {
        setForecastError(data.error);
      }
    } catch {
      setForecastError('The forecast server didn’t respond.');
    } finally {
      setIsGeneratingForecasts(false);
    }
  };

  // Re-generate forecasts when milestone mode or active course changes
  useEffect(() => {
    if (activeCourse) {
      handleRefreshForecasts();
    } else {
      setForecasts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestoneMode, activeCourse?.id]);

  // Update Module Mastery score
  const handleUpdateMastery = (moduleId: string, points: number) => {
    if (!activeCourse) return;
    let computedAvgMastery = 0;
    setActiveCourse((prev) => {
      if (!prev) return null;
      const updatedModules = prev.modules.map((m) => {
        if (m.id === moduleId) {
          const newMastery = Math.min(100, m.masteryPercentage + points);
          let newStatus: 'locked_in' | 'in_review' | 'needs_drill' = 'needs_drill';
          if (newMastery >= 85) newStatus = 'locked_in';
          else if (newMastery >= 70) newStatus = 'in_review';
          return {
            ...m,
            masteryPercentage: newMastery,
            status: newStatus,
          };
        }
        return m;
      });
      const sum = updatedModules.reduce((acc, m) => acc + m.masteryPercentage, 0);
      computedAvgMastery = Math.round(sum / (updatedModules.length || 1));
      return {
        ...prev,
        modules: updatedModules,
      };
    });

    const xpGained = points * 2;
    setTotalXp((prev) => prev + xpGained);
    if (lastStudyDay !== todayIso()) {
      setCurrentStreak((prev) => nextStreak(prev, lastStudyDay));
      setLastStudyDay(todayIso());
    }

    // Live sync into Recharts study history
    setStudyHistory((prev) => {
      const today = todayIso();
      const copy = [...prev];
      const lastIndex = copy.length - 1;
      if (lastIndex >= 0 && copy[lastIndex].fullDate === today) {
        copy[lastIndex] = {
          ...copy[lastIndex],
          xpEarned: copy[lastIndex].xpEarned + xpGained,
          cumulativeXp: copy[lastIndex].cumulativeXp + xpGained,
          masteryPercentage: computedAvgMastery || Math.min(100, copy[lastIndex].masteryPercentage + 2),
          questionsAnswered: copy[lastIndex].questionsAnswered + 1,
        };
        return copy;
      }
      return [
        ...copy,
        {
          date: dayLabel(today),
          fullDate: today,
          xpEarned: xpGained,
          cumulativeXp: (copy[lastIndex]?.cumulativeXp || 0) + xpGained,
          masteryPercentage: computedAvgMastery || 75,
          questionsAnswered: 1,
          focusArea: 'Interactive Study Session',
        },
      ];
    });
  };

  const handleCompleteOnboarding = (
    selectedCourses: CourseData[],
    newActiveCourse: CourseData,
    cfg: CanvasConfig,
    mode: MilestoneMode,
  ) => {
    setEnrolledCourses(selectedCourses);
    setActiveCourse(newActiveCourse);
    setCanvasConfig(cfg);
    setMilestoneMode(mode);
    setView('today');
  };

  // ------------------------------------------------------------- sessions
  const startSession = (opts: {
    course?: CourseData;
    milestone?: CourseMilestone | null;
    questions?: StudyQuestion[] | null;
  }) => {
    const course = opts.course || activeCourse;
    if (!course) return;
    if (course.id !== activeCourse?.id) setActiveCourse(enrolledCourses.find((c) => c.id === course.id) || course);
    setSelectedMilestoneForGame(opts.milestone ?? null);
    setFixedQuestions(opts.questions ?? null);
    setReadinessBefore(courseMastery(course));
    if (view !== 'game' && view !== 'results') setReturnTo(view as ShellRoute);
    setGameKey((k) => k + 1);
    setView('game');
  };

  const startDaily = (exam?: UpcomingExam) => {
    const target = exam || (activeCourse ? nextExamFor(activeCourse) : undefined);
    startSession({ course: target?.course, milestone: target?.milestone || null });
  };

  const playTop3 = () => {
    if (!activeCourse) return;
    const top = [...forecasts].sort((a, b) => b.probabilityScore - a.probabilityScore).slice(0, 3);
    if (top.length) startSession({ course: activeCourse, questions: top.map((f) => forecastToQuestion(f, activeCourse)) });
  };

  const exitSession = () => {
    setSelectedMilestoneForGame(null);
    setFixedQuestions(null);
    setView(returnTo);
  };

  // ---------------------------------------------------------------- views
  const navigate = (route: ShellRoute) => {
    setView(route);
    window.scrollTo({ top: 0 });
  };

  const modals = (
    <>
      {/* Mounted only while open: the modal copies config into local state on mount. */}
      {isSettingsOpen && (
        <CanvasSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={canvasConfig}
          onSaveConfig={(newCfg) => setCanvasConfig(newCfg)}
          onTriggerSync={handleTriggerCanvasSync}
          activeCourseCode={activeCourse ? activeCourse.code : 'No Course'}
          availableCourses={enrolledCourses.map((c) => ({ code: c.code, name: c.name }))}
          onCourseChange={(newCode) => {
            const found = enrolledCourses.find((c) => c.code === newCode);
            if (found) setActiveCourse(found);
          }}
          onAddNewClass={() => {
            setIsSettingsOpen(false);
            handleOpenCreateClass();
          }}
          onResetToBlankCanvas={handleResetToBlankCanvas}
          onLoadDemoData={handleLoadDemoData}
          embeddedFiles={activeCourse?.embeddedFiles || []}
          onAddEmbeddedFile={handleAddFile}
          onRemoveEmbeddedFile={handleRemoveFile}
          onLoadPreset={handleLoadDemoData}
        />
      )}
      <ClassEditModal
        isOpen={isClassEditModalOpen}
        onClose={() => setIsClassEditModalOpen(false)}
        courseToEdit={courseToEdit}
        onSaveCourse={handleSaveCourse}
        onDeleteCourse={handleDeleteCourse}
        canDelete={enrolledCourses.length > 1}
      />
    </>
  );

  if (view === 'setup') {
    return (
      <>
        <SetupFlow
          initialConfig={canvasConfig}
          initialCourses={enrolledCourses}
          onComplete={handleCompleteOnboarding}
          onUseSample={() => {
            handleLoadDemoData();
            setView('today');
          }}
        />
        {modals}
      </>
    );
  }

  if (view === 'game') {
    return (
      <>
        <GameSession
          key={gameKey}
          course={activeCourse}
          milestoneMode={milestoneMode}
          targetMilestone={selectedMilestoneForGame}
          fixedQuestions={fixedQuestions}
          onExitSession={exitSession}
          onUpdateMastery={handleUpdateMastery}
          onFinish={(result) => {
            setLastResult(result);
            setView('results');
          }}
          onLoadDemoQuestions={handleLoadDemoData}
        />
        {modals}
      </>
    );
  }

  const route: ShellRoute = view === 'results' ? 'games' : view;

  return (
    <>
      <AppShell route={route} onNavigate={navigate} streak={currentStreak} onOpenSettings={() => setIsSettingsOpen(true)}>
        {view === 'results' && activeCourse && lastResult && (
          <ResultsScreen
            course={activeCourse}
            result={lastResult}
            readinessBefore={readinessBefore}
            onKeepGoing={() =>
              startSession({ course: activeCourse, milestone: selectedMilestoneForGame, questions: fixedQuestions })
            }
            onDone={() => {
              setSelectedMilestoneForGame(null);
              setFixedQuestions(null);
              navigate('today');
            }}
          />
        )}
        {view === 'today' && (
          <TodayScreen
            courses={enrolledCourses}
            canvasConfig={canvasConfig}
            onStartDailySession={startDaily}
            onOpenCourse={(c) => {
              setActiveCourse(c);
              navigate('mastery');
            }}
            onOpenExam={(e) => {
              setActiveCourse(e.course);
              navigate('forecast');
            }}
            onAddClass={handleOpenCreateClass}
          />
        )}
        {view === 'exams' && (
          <ExamsScreen
            courses={enrolledCourses}
            onUpdateMilestones={handleUpdateMilestones}
            onStudyExam={(c, m) => startSession({ course: c, milestone: m })}
            onAddClass={handleOpenCreateClass}
          />
        )}
        {view === 'forecast' && (
          <ForecastScreen
            course={activeCourse}
            courses={enrolledCourses}
            forecasts={forecasts}
            isGenerating={isGeneratingForecasts}
            forecastError={forecastError}
            onSelectCourse={setActiveCourse}
            onRefresh={handleRefreshForecasts}
            onPlayTop3={playTop3}
          />
        )}
        {view === 'games' && (
          <GamesScreen
            courses={enrolledCourses}
            hasForecast={forecasts.length > 0}
            onDailySession={() => startDaily()}
            onExamDrill={(c, m) => startSession({ course: c, milestone: m })}
            onForecastTop3={playTop3}
          />
        )}
        {view === 'mastery' && <MasteryScreen courses={enrolledCourses} totalXp={totalXp} history={studyHistory} />}
        {view === 'sources' && (
          <SourcesScreen
            courses={enrolledCourses}
            activeCourse={activeCourse}
            canvasConfig={canvasConfig}
            isSyncing={isSyncing}
            syncMessage={syncMessage}
            onSelectCourse={setActiveCourse}
            onAddClass={handleOpenCreateClass}
            onEditClass={handleOpenEditClass}
            onOpenCanvasSettings={() => setIsSettingsOpen(true)}
            onSyncNow={handleSyncNow}
            onAddFile={handleAddFile}
            onRemoveFile={handleRemoveFile}
            onLoadSample={handleLoadDemoData}
            onReset={() => {
              if (window.confirm('Reset Lock In? This removes your classes, streak and XP.')) handleResetToBlankCanvas();
            }}
          />
        )}
      </AppShell>
      {modals}
    </>
  );
}
