import { useState, useEffect } from 'react';
import { DEFAULT_MGT_COURSE, INITIAL_FORECASTS, INITIAL_AVAILABLE_COURSES } from './data/defaultCourseData';
import { CourseData, MilestoneMode, CanvasConfig, ForecastItem, CourseMilestone, DailyProgressPoint, StarFeedingState } from './types';
import { StarryMascot } from './components/StarryMascot';
import { LaunchSequence } from './components/LaunchSequence';
import { CanvasOnboarding } from './components/CanvasOnboarding';
import { SemesterScopeTracker } from './components/SemesterScopeTracker';
import { ForecastEngineView } from './components/ForecastEngineView';
import { GameSession } from './components/GameSession';
import { MasteryDashboard } from './components/MasteryDashboard';
import { CanvasSettingsModal } from './components/CanvasSettingsModal';
import { FileEmbedSection } from './components/FileEmbedSection';
import { ClassEditModal } from './components/ClassEditModal';
import { CoursePickerNavBar } from './components/CoursePickerNavBar';
import { WelcomeModal } from './components/WelcomeModal';
import { StudyProgressAnalytics } from './components/StudyProgressAnalytics';
import { StarFeedingSanctuary } from './components/StarFeedingSanctuary';
import {
  Sparkles,
  Key,
  Layers,
  Flame,
  Award,
  BookOpen,
  FileText,
  RotateCcw,
  PlusCircle,
  ChevronDown,
  Pencil,
  Home,
  Gamepad2,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Cookie,
} from 'lucide-react';

const STORAGE_KEYS = {
  COURSES: 'lockin_courses',
  ACTIVE_COURSE_ID: 'lockin_active_course_id',
  CANVAS_CONFIG: 'lockin_canvas_config',
  TOTAL_XP: 'lockin_total_xp',
  STREAK: 'lockin_streak',
  WELCOME_SEEN: 'lockin_welcome_seen',
  STUDY_HISTORY: 'lockin_study_history',
  STAR_FEEDING: 'lockin_star_feeding',
};

const DEFAULT_STAR_FEEDING: StarFeedingState = {
  fullness: 35,
  availableTreats: 0,
  totalTreatsFed: 0,
  level: 1,
  stageTitle: 'Level 1: Baby Starlight',
  hungerState: 'hungry',
};

const DEMO_STAR_FEEDING: StarFeedingState = {
  fullness: 75,
  availableTreats: 45,
  totalTreatsFed: 120,
  level: 3,
  stageTitle: 'Level 3: Radiant Stardust ✨',
  hungerState: 'energized',
};

const DEMO_STUDY_HISTORY: DailyProgressPoint[] = [
  { date: 'Mon Oct 5', fullDate: '2026-10-05', xpEarned: 20, cumulativeXp: 20, masteryPercentage: 65, questionsAnswered: 8, focusArea: 'Foundations & Principles' },
  { date: 'Tue Oct 6', fullDate: '2026-10-06', xpEarned: 35, cumulativeXp: 55, masteryPercentage: 72, questionsAnswered: 14, focusArea: 'Module 2 Applied Frameworks' },
  { date: 'Wed Oct 7', fullDate: '2026-10-07', xpEarned: 25, cumulativeXp: 80, masteryPercentage: 76, questionsAnswered: 10, focusArea: 'Strategy Nuances & Rubrics' },
  { date: 'Thu Oct 8', fullDate: '2026-10-08', xpEarned: 40, cumulativeXp: 120, masteryPercentage: 83, questionsAnswered: 16, focusArea: 'Midterm 1 Review Drill' },
  { date: 'Fri Oct 9', fullDate: '2026-10-09', xpEarned: 15, cumulativeXp: 135, masteryPercentage: 85, questionsAnswered: 6, focusArea: 'Post-Exam Frontiers' },
  { date: 'Sat Oct 10', fullDate: '2026-10-10', xpEarned: 30, cumulativeXp: 165, masteryPercentage: 88, questionsAnswered: 12, focusArea: 'Network Effects Case Study' },
  { date: 'Today (Sun)', fullDate: '2026-10-11', xpEarned: 25, cumulativeXp: 190, masteryPercentage: 91, questionsAnswered: 10, focusArea: 'Comprehensive Integration' },
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

export default function App() {
  // App Navigation Views:
  // 'launch': Step 1-3 opening animation sequence
  // 'onboarding': Canvas multi-class onboarding wizard
  // 'home': Main course dashboard
  // 'game': Daily study session (diagnostic + adaptive)
  const [view, setView] = useState<'launch' | 'onboarding' | 'home' | 'game'>('launch');
  const [activeTab, setActiveTab] = useState<'forecasts' | 'mastery' | 'professor_archives'>('forecasts');

  // Enrolled courses list & Active course (defaults to empty blank canvas for public users)
  const [enrolledCourses, setEnrolledCourses] = useState<CourseData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return []; // Blank canvas by default!
  });

  const [activeCourse, setActiveCourse] = useState<CourseData | null>(() => {
    try {
      const savedCourses = localStorage.getItem(STORAGE_KEYS.COURSES);
      const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_COURSE_ID);
      if (savedCourses) {
        const parsed: CourseData[] = JSON.parse(savedCourses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const match = parsed.find((c) => c.id === savedActiveId);
          return match || parsed[0];
        }
      }
    } catch {}
    return null; // Blank canvas by default!
  });

  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState<boolean>(false);

  // Active study mode & AI forecasts
  const [milestoneMode, setMilestoneMode] = useState<MilestoneMode>('post_exam_only');
  const [forecasts, setForecasts] = useState<ForecastItem[]>(() => {
    try {
      const savedCourses = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (savedCourses) {
        const parsed: CourseData[] = JSON.parse(savedCourses);
        if (parsed.length > 0) return INITIAL_FORECASTS;
      }
    } catch {}
    return []; // Blank canvas by default!
  });
  const [isGeneratingForecasts, setIsGeneratingForecasts] = useState<boolean>(false);

  // Canvas Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CANVAS_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return BLANK_CANVAS_CONFIG;
  });

  // User stats (starts at 0 on blank canvas)
  const [totalXp, setTotalXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TOTAL_XP);
      if (saved !== null) return parseInt(saved, 10) || 0;
    } catch {}
    return 0; // Blank canvas
  });

  const [currentStreak, setCurrentStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (saved !== null) return parseInt(saved, 10) || 0;
    } catch {}
    return 0; // Blank canvas
  });

  const [studyHistory, setStudyHistory] = useState<DailyProgressPoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return []; // Blank canvas by default!
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(enrolledCourses));
    } catch {}
  }, [enrolledCourses]);

  useEffect(() => {
    try {
      if (activeCourse) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_COURSE_ID, activeCourse.id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_COURSE_ID);
      }
    } catch {}
  }, [activeCourse]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CANVAS_CONFIG, JSON.stringify(canvasConfig));
    } catch {}
  }, [canvasConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOTAL_XP, String(totalXp));
    } catch {}
  }, [totalXp]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STREAK, String(currentStreak));
    } catch {}
  }, [currentStreak]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_HISTORY, JSON.stringify(studyHistory));
    } catch {}
  }, [studyHistory]);

  const [starFeedingState, setStarFeedingState] = useState<StarFeedingState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAR_FEEDING);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STAR_FEEDING;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAR_FEEDING, JSON.stringify(starFeedingState));
    } catch {}
  }, [starFeedingState]);

  // Feed Starry with study treats
  const handleFeedStar = (treatsToFeed: number, _snackName: string) => {
    setStarFeedingState((prev) => {
      const newAvailable = Math.max(0, prev.availableTreats - treatsToFeed);
      const newTotalFed = prev.totalTreatsFed + treatsToFeed;
      const fullnessGain = Math.round(treatsToFeed * 1.5);
      const newFullness = Math.min(100, prev.fullness + fullnessGain);

      // Evolution stage calculation
      let newLevel = 1;
      let newTitle = 'Level 1: Baby Starlight';
      if (newTotalFed >= 350) {
        newLevel = 5;
        newTitle = 'Level 5: Cosmic Master 🌟';
      } else if (newTotalFed >= 220) {
        newLevel = 4;
        newTitle = 'Level 4: Supernova Guardian ⚡';
      } else if (newTotalFed >= 120) {
        newLevel = 3;
        newTitle = 'Level 3: Radiant Stardust ✨';
      } else if (newTotalFed >= 50) {
        newLevel = 2;
        newTitle = 'Level 2: Glowing Nova 💫';
      }

      let newHungerState: StarFeedingState['hungerState'] = 'content';
      if (newFullness >= 90) newHungerState = 'locked_in_full';
      else if (newFullness >= 65) newHungerState = 'energized';
      else if (newFullness >= 35) newHungerState = 'content';
      else if (newFullness >= 15) newHungerState = 'hungry';
      else newHungerState = 'starving';

      return {
        ...prev,
        availableTreats: newAvailable,
        totalTreatsFed: newTotalFed,
        fullness: newFullness,
        level: newLevel,
        stageTitle: newTitle,
        hungerState: newHungerState,
        lastFedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    });
  };

  const handleEarnTreats = (points: number) => {
    setTotalXp((prev) => prev + points);
    setStarFeedingState((prev) => ({
      ...prev,
      availableTreats: prev.availableTreats + points,
    }));
  };

  // Welcome modal for first-time users
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.WELCOME_SEEN) !== 'true';
    } catch {
      return true;
    }
  });

  // Class creation and editing modal state
  const [isClassEditModalOpen, setIsClassEditModalOpen] = useState<boolean>(false);
  const [courseToEdit, setCourseToEdit] = useState<CourseData | null>(null);

  // Target exam milestone chosen from the dashboard (Upcoming / Complete buttons)
  const [selectedMilestoneForGame, setSelectedMilestoneForGame] = useState<CourseMilestone | null>(null);

  // Helper: Load demo sample data for preview
  const handleLoadDemoData = () => {
    setEnrolledCourses(INITIAL_AVAILABLE_COURSES);
    setActiveCourse(DEFAULT_MGT_COURSE);
    setForecasts(INITIAL_FORECASTS);
    setTotalXp(145);
    setCurrentStreak(4);
    setStudyHistory(DEMO_STUDY_HISTORY);
    setStarFeedingState(DEMO_STAR_FEEDING);
    const demoConfig: CanvasConfig = {
      patToken: '',
      domain: 'canvas.instructure.com',
      semesterLabel: 'Fall 2026',
      termStartDate: '2026-08-28',
      termEndDate: '2026-12-15',
      isConnected: true,
      lastSyncedAt: 'Today at 4:30 PM',
    };
    setCanvasConfig(demoConfig);
  };

  // Helper: Reset back to completely blank canvas
  const handleResetToBlankCanvas = () => {
    setEnrolledCourses([]);
    setActiveCourse(null);
    setForecasts([]);
    setTotalXp(0);
    setCurrentStreak(0);
    setStudyHistory([]);
    setStarFeedingState(DEFAULT_STAR_FEEDING);
    setCanvasConfig(BLANK_CANVAS_CONFIG);
    try {
      localStorage.removeItem(STORAGE_KEYS.COURSES);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_COURSE_ID);
      localStorage.removeItem(STORAGE_KEYS.CANVAS_CONFIG);
      localStorage.removeItem(STORAGE_KEYS.TOTAL_XP);
      localStorage.removeItem(STORAGE_KEYS.STREAK);
      localStorage.removeItem(STORAGE_KEYS.STUDY_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.STAR_FEEDING);
    } catch {}
  };

  const handleStudyMilestone = (milestone: CourseMilestone) => {
    setSelectedMilestoneForGame(milestone);
    // Align scope mode to milestone coverage
    if (milestone.coverageModules && milestone.coverageModules.every((m) => m >= 4)) {
      setMilestoneMode('post_exam_only');
    } else if (milestone.coverageModules && milestone.coverageModules.length >= 4) {
      setMilestoneMode('cumulative_review');
    }
    setView('game');
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
      if (exists) {
        return prev.map((c) => (c.id === savedCourse.id ? savedCourse : c));
      }
      return [...prev, savedCourse];
    });

    setActiveCourse(savedCourse);
  };

  const handleDeleteCourse = (courseId: string) => {
    setEnrolledCourses((prev) => {
      const remaining = prev.filter((c) => c.id !== courseId);
      if (activeCourse?.id === courseId) {
        setActiveCourse(remaining.length > 0 ? remaining[0] : null);
      }
      return remaining;
    });
  };

  // Sync with Canvas API proxy backend
  const handleTriggerCanvasSync = async (cfg: CanvasConfig): Promise<boolean> => {
    try {
      const res = await fetch('/api/canvas/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: cfg.patToken,
          domain: cfg.domain,
        }),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  };

  // AI Exam Forecasting Engine call (Gemini via Express server)
  const handleRefreshForecasts = async () => {
    if (!activeCourse) {
      setForecasts([]);
      return;
    }
    setIsGeneratingForecasts(true);
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
      }
    } catch {
      // Graceful fallback if network is unavailable
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
    setCurrentStreak((prev) => (prev === 0 ? 1 : prev));

    // Points earned directly convert into Star Snacks / Treats for Starry!
    setStarFeedingState((prev) => ({
      ...prev,
      availableTreats: prev.availableTreats + xpGained,
    }));

    // Live sync into Recharts study history
    setStudyHistory((prev) => {
      const todayIso = new Date().toISOString().split('T')[0];
      const copy = [...prev];
      const lastIndex = copy.length - 1;
      if (lastIndex >= 0 && (copy[lastIndex].date.includes('Today') || copy[lastIndex].fullDate === todayIso)) {
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
          date: 'Today (Sun)',
          fullDate: todayIso,
          xpEarned: xpGained,
          cumulativeXp: xpGained,
          masteryPercentage: computedAvgMastery || 75,
          questionsAnswered: 1,
          focusArea: 'Interactive Study Session',
        },
      ];
    });
  };

  // Quick practice session simulation / test logger
  const handleLogSessionXp = (points: number) => {
    setTotalXp((prev) => prev + points);
    setCurrentStreak((prev) => Math.max(1, prev === 0 ? 1 : prev));

    setStarFeedingState((prev) => ({
      ...prev,
      availableTreats: prev.availableTreats + points,
    }));

    setStudyHistory((prev) => {
      const todayIso = new Date().toISOString().split('T')[0];
      const copy = [...prev];
      const lastIndex = copy.length - 1;
      const currentMasteryScore = activeCourse && activeCourse.modules.length > 0
        ? Math.round(activeCourse.modules.reduce((acc, m) => acc + m.masteryPercentage, 0) / activeCourse.modules.length)
        : 70;

      if (lastIndex >= 0 && (copy[lastIndex].date.includes('Today') || copy[lastIndex].fullDate === todayIso)) {
        copy[lastIndex] = {
          ...copy[lastIndex],
          xpEarned: copy[lastIndex].xpEarned + points,
          cumulativeXp: copy[lastIndex].cumulativeXp + points,
          masteryPercentage: Math.min(100, (copy[lastIndex].masteryPercentage || currentMasteryScore) + 2),
          questionsAnswered: copy[lastIndex].questionsAnswered + Math.max(1, Math.round(points / 5)),
        };
        return copy;
      }
      return [
        ...copy,
        {
          date: 'Today (Sun)',
          fullDate: todayIso,
          xpEarned: points,
          cumulativeXp: (copy[lastIndex]?.cumulativeXp || 0) + points,
          masteryPercentage: currentMasteryScore,
          questionsAnswered: Math.max(1, Math.round(points / 5)),
          focusArea: 'Quick Practice Drill',
        },
      ];
    });
  };

  // Onboarding completion handler
  const handleCompleteOnboarding = (
    selectedCourses: CourseData[],
    newActiveCourse: CourseData,
    cfg: CanvasConfig
  ) => {
    setEnrolledCourses(selectedCourses);
    setActiveCourse(newActiveCourse);
    setCanvasConfig(cfg);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-[#3B4232] text-[#1D2118] flex flex-col items-center">
      {/* GLOBAL TOP NAVIGATION BAR */}
      <header className="w-full max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between border-b border-[#4E5841]/70 relative z-40">
        {/* Brand & Mascot pill */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setView('home')}
            className="flex items-center gap-2 cursor-pointer group bg-[#282E21] hover:bg-[#32392A] transition-colors px-3 py-1.5 rounded-full border border-[#48533B]"
            title="Go to Home Dashboard"
          >
            <StarryMascot mood="waving" size={32} />
            <div className="flex items-center gap-1 font-black tracking-tight text-white text-base sm:text-lg">
              <span>LOCK</span>
              <span className="text-[#C4F46C]">IN</span>
            </div>
          </div>

          {/* PRIMARY APP NAVIGATION TABS */}
          <nav className="hidden md:flex items-center gap-1 bg-[#242A1D] p-1 rounded-full border border-[#48543B]">
            <button
              onClick={() => setView('home')}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                view === 'home'
                  ? 'bg-[#C4F46C] text-[#1B2213] shadow-xs'
                  : 'text-[#9EB18A] hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setSelectedMilestoneForGame(null);
                setView('game');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                view === 'game'
                  ? 'bg-[#C4F46C] text-[#1B2213] shadow-xs'
                  : 'text-[#9EB18A] hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Study Game</span>
            </button>

            <button
              onClick={() => setView('launch')}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                view === 'launch'
                  ? 'bg-[#C4F46C] text-[#1B2213] shadow-xs'
                  : 'text-[#9EB18A] hover:text-white'
              }`}
              title="Replay opening sequence"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Living Zoom</span>
            </button>
          </nav>

          {/* ACTIVE CLASS SWITCHER DROPDOWN */}
          <div className="relative">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2C3325] hover:bg-[#394230] border border-[#48543B] text-xs font-black text-white transition-colors cursor-pointer shadow-xs"
                title="Switch active class"
              >
                <span className={`w-2 h-2 rounded-full ${activeCourse ? 'bg-[#C4F46C] animate-pulse' : 'bg-[#E3DCB8]'}`} />
                <span>{activeCourse ? activeCourse.code : 'Select Class'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#B7C6A4]" />
              </button>

              {/* Quick Edit Current Class Button */}
              {activeCourse && (
                <button
                  onClick={() => handleOpenEditClass(activeCourse)}
                  className="p-1.5 rounded-full bg-[#2C3325] hover:bg-[#394230] border border-[#48543B] text-[#C4F46C] hover:text-white transition-colors cursor-pointer shadow-xs"
                  title={`Edit ${activeCourse.code} class name or details`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Quick Add Class Button */}
              <button
                onClick={handleOpenCreateClass}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#2C3325] hover:bg-[#394230] border border-[#48543B] text-[11px] font-bold text-[#CAD7B9] hover:text-[#C4F46C] transition-colors cursor-pointer shadow-xs"
                title="Add your own custom class"
              >
                <PlusCircle className="w-3 h-3 text-[#C4F46C]" />
                <span>+ Add Class</span>
              </button>
            </div>

            {/* Dropdown Menu */}
            {isCourseDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#F7F4EB] border-2 border-[#3B4232] rounded-2xl shadow-2xl p-2.5 text-[#1E2516] z-50 animate-in fade-in">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#69775C] px-2 py-1 border-b border-[#E3DCB8] mb-1.5">
                  <span>Enrolled Classes ({enrolledCourses.length})</span>
                  <button
                    onClick={() => {
                      setIsCourseDropdownOpen(false);
                      handleOpenCreateClass();
                    }}
                    className="text-[#3B4232] hover:text-[#1E2516] font-bold underline cursor-pointer"
                  >
                    + Add New
                  </button>
                </div>

                {enrolledCourses.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#6B795D] font-bold">
                    No classes enrolled yet (Blank Canvas)
                  </div>
                ) : (
                  <div className="space-y-1 max-h-60 overflow-y-auto pr-0.5">
                    {enrolledCourses.map((c) => (
                      <div
                        key={c.id}
                        className={`p-2 rounded-xl transition-colors flex items-center justify-between gap-2 text-xs ${
                          activeCourse && c.id === activeCourse.id
                            ? 'bg-[#3B4232] text-[#C4F46C] font-black'
                            : 'hover:bg-[#EAE3D0] text-[#242C1B] font-bold'
                        }`}
                      >
                        <div
                          onClick={() => {
                            setActiveCourse(c);
                            setIsCourseDropdownOpen(false);
                          }}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="leading-tight">{c.code}</div>
                          <div className="text-[10px] opacity-80 font-normal truncate max-w-[160px]">
                            {c.name}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCourseDropdownOpen(false);
                              handleOpenEditClass(c);
                            }}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              activeCourse && c.id === activeCourse.id
                                ? 'hover:bg-[#4E5842] text-[#C4F46C]'
                                : 'hover:bg-[#DDD5BE] text-[#3B4232]'
                            }`}
                            title={`Edit ${c.code} name & info`}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          {activeCourse && c.id === activeCourse.id && <span className="text-xs ml-1">✓</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Onboard Another Class / Add Class Action */}
                <div className="pt-2 mt-1.5 border-t border-[#E3DCB8] space-y-1">
                  <button
                    onClick={() => {
                      setIsCourseDropdownOpen(false);
                      handleOpenCreateClass();
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs font-black text-[#1E2516] bg-[#EAE2CB] hover:bg-[#DDD3B7] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#3B4232]" />
                    <span>+ Add / Create Your Own Class</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsCourseDropdownOpen(false);
                      setView('onboarding');
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs font-bold text-[#556348] hover:bg-[#EAE3D0] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Key className="w-3 h-3 text-[#7B8B6C]" />
                    <span>Open Canvas Onboarding Wizard</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsCourseDropdownOpen(false);
                      handleLoadDemoData();
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs font-bold text-[#556348] hover:bg-[#EAE3D0] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#8BA446]" />
                    <span>Load Sample Classes (Demo)</span>
                  </button>

                  {enrolledCourses.length > 0 && (
                    <button
                      onClick={() => {
                        setIsCourseDropdownOpen(false);
                        if (window.confirm('Reset to Blank Canvas? This will remove all loaded classes and reset streak & XP.')) {
                          handleResetToBlankCanvas();
                        }
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs font-bold text-[#842A16] hover:bg-[#FBE8E4] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-[#B83E22]" />
                      <span>Reset to Blank Canvas</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side stats & controls */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* First-time Welcome & Features Guide trigger */}
          <button
            onClick={() => setIsWelcomeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2C3325] hover:bg-[#3D4734] border border-[#48543B] text-xs font-bold text-[#CAD7B9] hover:text-[#C4F46C] transition-colors cursor-pointer shadow-xs"
            title="Open Welcome Guide & Feature Walkthrough"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#C4F46C]" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#2C3325] border border-[#48543B] text-[#FFA88A] font-bold">
            <Flame className="w-3.5 h-3.5 fill-current text-[#D96B43]" />
            <span>{currentStreak} Days</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#2C3325] border border-[#48543B] text-[#C4F46C] font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>{totalXp} XP</span>
          </div>

          {/* Feed Star Companion Button */}
          <button
            onClick={() => {
              if (view !== 'home') setView('home');
              setTimeout(() => {
                const el = document.getElementById('star-feeding-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 120);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#273220] hover:bg-[#38462D] border border-[#4C5D3B] text-[#C4F46C] text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
            title="Star Treats: Feed Starry your earned study points!"
          >
            <span className="text-sm">⭐</span>
            <span className="hidden md:inline">Feed Star:</span>
            <span>{starFeedingState.availableTreats} Treats</span>
            <span className="text-[10px] text-[#A6BA97] hidden lg:inline">({starFeedingState.fullness}%)</span>
          </button>

          {/* Replay Intro sequence */}
          <button
            onClick={() => setView('launch')}
            title="Replay Opening Sequence"
            className="p-2 rounded-full bg-[#2C3325] hover:bg-[#3B4532] text-[#CAD7B9] border border-[#48543B] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Canvas Onboarding wizard trigger */}
          <button
            onClick={() => setView('onboarding')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#C4F46C] hover:bg-[#b2e456] text-[#1B2213] font-black text-xs transition-transform active:scale-95 shadow-xs cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Onboard Classes</span>
          </button>
        </div>
      </header>

      {/* MAIN VIEW CONTROLLER */}
      <main className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 flex-1 flex flex-col">
        {/* VIEW 1: THE OPENING ZOOM-OUT ANIMATION */}
        {view === 'launch' && (
          <LaunchSequence
            courseCode={activeCourse ? activeCourse.code : 'LOCK IN'}
            semesterLabel={activeCourse ? activeCourse.term : 'Semester 2026'}
            onComplete={() => setView('home')}
            onStartDailySession={() => {
              if (!activeCourse || !activeCourse.questions || activeCourse.questions.length === 0) {
                setView('home');
              } else {
                setView('game');
              }
            }}
          />
        )}

        {/* VIEW 2: CANVAS CLASS ONBOARDING WIZARD */}
        {view === 'onboarding' && (
          <CanvasOnboarding
            initialConfig={canvasConfig}
            initialCourses={enrolledCourses}
            onLoadDemoData={handleLoadDemoData}
            onCompleteOnboarding={handleCompleteOnboarding}
          />
        )}

        {/* VIEW 3: ACTIVE GAME SESSION */}
        {view === 'game' && (
          <div className="py-2">
            <GameSession
              course={activeCourse}
              milestoneMode={milestoneMode}
              targetMilestone={selectedMilestoneForGame}
              onClearTargetMilestone={() => setSelectedMilestoneForGame(null)}
              onExitSession={() => {
                setSelectedMilestoneForGame(null);
                setView('home');
              }}
              onUpdateMastery={handleUpdateMastery}
              onLoadDemoQuestions={handleLoadDemoData}
            />
          </div>
        )}

        {/* VIEW 4: MAIN DASHBOARD */}
        {view === 'home' && (
          enrolledCourses.length === 0 || !activeCourse ? (
            <div className="w-full bg-[#F7F4EB] border-4 border-[#3B4232] rounded-[2.5rem] p-6 sm:p-10 shadow-2xl text-[#1E2516] animate-in fade-in space-y-8">
              {/* Header with Starry Mascot */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-[#E1DBCB] text-center sm:text-left">
                <div className="p-3 bg-[#3B4232] rounded-3xl border-2 border-[#4E5842] shadow-md shrink-0">
                  <StarryMascot mood="waving" size={80} />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B4232] text-[#C4F46C] text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Clean Slate • Ready for Your Semester
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-[#1F2617] tracking-tight">
                    Welcome to LOCK IN
                  </h1>
                  <p className="text-sm sm:text-base text-[#566348] max-w-2xl leading-relaxed">
                    You are starting with a completely blank canvas. Add your own university courses or connect Canvas LMS to forecast exam questions, monitor semester deadlines, and unlock daily practice drills.
                  </p>
                </div>
              </div>

              {/* 3 Action Paths Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Option 1: Connect Canvas LMS */}
                <div className="p-5 rounded-3xl bg-white border-2 border-[#E1DBCB] hover:border-[#3B4232] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#3B4232] text-[#C4F46C] flex items-center justify-center shadow-xs">
                      <Key className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#798A69]">Automatic Ingestion</span>
                      <h3 className="text-lg font-black text-[#1E2516]">Connect Canvas LMS</h3>
                      <p className="text-xs text-[#5C674E] leading-relaxed">
                        Import your active courses, syllabi, lecture modules, and deadlines using your Canvas Personal Access Token (PAT).
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setView('onboarding')}
                    className="mt-5 w-full py-2.5 px-4 rounded-full bg-[#C4F46C] hover:bg-[#b2e557] text-[#1B2213] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
                  >
                    <span>Open Canvas Wizard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Option 2: Create Custom Class */}
                <div className="p-5 rounded-3xl bg-white border-2 border-[#E1DBCB] hover:border-[#3B4232] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#3B4232] text-[#C4F46C] flex items-center justify-center shadow-xs">
                      <PlusCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#798A69]">Manual Setup</span>
                      <h3 className="text-lg font-black text-[#1E2516]">+ Create Custom Class</h3>
                      <p className="text-xs text-[#5C674E] leading-relaxed">
                        Don&apos;t have a Canvas token? Create a custom class in seconds with course code, professor name, and exam dates.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenCreateClass}
                    className="mt-5 w-full py-2.5 px-4 rounded-full bg-[#3B4232] hover:bg-[#2B3124] text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
                  >
                    <span>+ Add Your Class</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C4F46C]" />
                  </button>
                </div>

                {/* Option 3: Explore Sample Course */}
                <div className="p-5 rounded-3xl bg-[#F0ECE1] border-2 border-[#D8D0BC] hover:border-[#3B4232] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#E2DCBC] text-[#3B4232] flex items-center justify-center shadow-xs">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#798A69]">Preview Mode</span>
                      <h3 className="text-lg font-black text-[#1E2516]">Load Sample Course</h3>
                      <p className="text-xs text-[#5C674E] leading-relaxed">
                        Want to see how the exam predictor and mastery study game work first? Load pre-configured sample classes (MGT 301 &amp; CS 189).
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLoadDemoData}
                    className="mt-5 w-full py-2.5 px-4 rounded-full bg-[#E3DCB8] hover:bg-[#D5CEAA] text-[#242C19] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95 border border-[#CCC1A0]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#6D8337]" />
                    <span>Load Sample Data</span>
                  </button>
                </div>
              </div>

              {/* Feature Preview Pill Strip */}
              <div className="pt-4 border-t border-[#E1DBCB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#627052]">
                <div className="flex items-center gap-2 font-bold text-[#3E4C2E]">
                  <StarryMascot mood="focused" size={24} />
                  <span>Private &amp; secure: All your courses and study records are stored directly in your browser.</span>
                </div>
                <button
                  onClick={() => setIsWelcomeModalOpen(true)}
                  className="underline hover:text-[#1E2516] font-bold cursor-pointer"
                >
                  Read Feature Walkthrough &amp; Guide →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              {/* SEMESTER SCOPE TRACKER (OVERALL PROGRESS DASHBOARD) */}
              <SemesterScopeTracker
                course={activeCourse}
                milestoneMode={milestoneMode}
                onToggleMilestoneMode={(mode) => setMilestoneMode(mode)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onEditCourse={() => handleOpenEditClass(activeCourse)}
                onStudyMilestone={handleStudyMilestone}
              />

            {/* NAV BAR OF COURSES TO PICK ("WHAT CLASS WILL WE BE STUDYING FOR?") & FLOW TO INTERACTIVE GAME WORK */}
            <CoursePickerNavBar
              courses={enrolledCourses}
              activeCourse={activeCourse}
              onSelectCourse={(course) => setActiveCourse(course)}
              onAddCourse={handleOpenCreateClass}
              onEditCourse={handleOpenEditClass}
              onStartGame={() => {
                setSelectedMilestoneForGame(null);
                setView('game');
              }}
              milestoneMode={milestoneMode}
              onToggleMilestoneMode={(mode) => setMilestoneMode(mode)}
            />

            {/* STARRY FEEDING SANCTUARY: GAIN POINTS TO FEED YOUR STAR */}
            <div id="star-feeding-section">
              <StarFeedingSanctuary
                feedingState={starFeedingState}
                onFeedStar={handleFeedStar}
                onEarnTreats={handleEarnTreats}
                onStartQuiz={() => {
                  setSelectedMilestoneForGame(null);
                  setView('game');
                }}
              />
            </div>

            {/* RECHARTS VISUAL REPRESENTATION OF STUDY PROGRESS OVER TIME */}
            <StudyProgressAnalytics
              course={activeCourse}
              totalXp={totalXp}
              currentStreak={currentStreak}
              studyHistory={studyHistory}
              onStartGame={() => {
                setSelectedMilestoneForGame(null);
                setView('game');
              }}
              onSimulateSession={handleLogSessionXp}
            />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[#4F5943] pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('forecasts')}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'forecasts'
                    ? 'bg-[#C4F46C] text-[#1B2213] shadow-sm'
                    : 'bg-[#292F22] text-[#A6B695] hover:text-white border border-[#444E39]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Exam Forecaster ({forecasts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('mastery')}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'mastery'
                    ? 'bg-[#C4F46C] text-[#1B2213] shadow-sm'
                    : 'bg-[#292F22] text-[#A6B695] hover:text-white border border-[#444E39]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Mastery Dashboard ({activeCourse.modules.length} Modules)</span>
              </button>

              <button
                onClick={() => setActiveTab('professor_archives')}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'professor_archives'
                    ? 'bg-[#C4F46C] text-[#1B2213] shadow-sm'
                    : 'bg-[#292F22] text-[#A6B695] hover:text-white border border-[#444E39]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Scraped Notes & Rubrics ({activeCourse.lectureNotes.length})</span>
              </button>
            </div>

            {/* TAB CONTENT 1: AI EXAM FORECASTING ENGINE */}
            {activeTab === 'forecasts' && (
              <ForecastEngineView
                course={activeCourse}
                milestoneMode={milestoneMode}
                forecasts={forecasts}
                onRefreshForecasts={handleRefreshForecasts}
                isGenerating={isGeneratingForecasts}
                onLaunchQuestionPractice={() => {
                  setSelectedMilestoneForGame(null);
                  setView('game');
                }}
              />
            )}

            {/* TAB CONTENT 2: MASTERY DASHBOARD */}
            {activeTab === 'mastery' && (
              <MasteryDashboard
                course={activeCourse}
                milestoneMode={milestoneMode}
                onDrillModule={() => {
                  setSelectedMilestoneForGame(null);
                  setView('game');
                }}
                onStartDailySession={() => {
                  setSelectedMilestoneForGame(null);
                  setView('game');
                }}
                onUpdateMastery={handleUpdateMastery}
              />
            )}

            {/* TAB CONTENT 3: SCRAPED PROFESSOR ARCHIVES & NOTES */}
            {activeTab === 'professor_archives' && (
              <div className="w-full bg-[#F7F4EB] border-4 border-[#3B4232] rounded-[2.5rem] p-6 sm:p-8 shadow-xl text-[#1E2516]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1DBCB]">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#3B4232] text-[#C4F46C] flex items-center justify-center shrink-0 shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#3B4232] text-[#C4F46C] text-[11px] font-black uppercase tracking-wider mb-1">
                        Professor Ground Truth Data
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#1F2617] tracking-tight">
                        Canvas Scraped Notes & Past Exams for {activeCourse.code}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#5C6750] mt-0.5">
                        These official archives power our "Professor Notes Only" correction rule.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setView('onboarding')}
                    className="px-4 py-2 rounded-full bg-[#3B4232] text-white hover:bg-[#2B3124] text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#C4F46C]" /> Scrape More Classes
                  </button>
                </div>

                {/* Manually Embed Files for this Course */}
                <div className="mt-5">
                  <FileEmbedSection
                    courseCode={activeCourse.code}
                    files={activeCourse.embeddedFiles || []}
                    onAddFile={(newFile, extractedQuestions) => {
                      if (!activeCourse) return;
                      setActiveCourse((prev) => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          embeddedFiles: [newFile, ...(prev.embeddedFiles || [])],
                          questions:
                            extractedQuestions && extractedQuestions.length > 0
                              ? [...extractedQuestions, ...prev.questions]
                              : prev.questions,
                        };
                      });
                      setEnrolledCourses((prevCourses) =>
                        prevCourses.map((c) =>
                          c.code === activeCourse.code
                            ? {
                                ...c,
                                embeddedFiles: [newFile, ...(c.embeddedFiles || [])],
                                questions:
                                  extractedQuestions && extractedQuestions.length > 0
                                    ? [...extractedQuestions, ...c.questions]
                                    : c.questions,
                              }
                            : c
                        )
                      );
                    }}
                    onRemoveFile={(fileId) => {
                      if (!activeCourse) return;
                      setActiveCourse((prev) => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          embeddedFiles: (prev.embeddedFiles || []).filter((f) => f.id !== fileId),
                        };
                      });
                      setEnrolledCourses((prevCourses) =>
                        prevCourses.map((c) =>
                          c.code === activeCourse.code
                            ? {
                                ...c,
                                embeddedFiles: (c.embeddedFiles || []).filter((f) => f.id !== fileId),
                              }
                            : c
                        )
                      );
                    }}
                  />
                </div>

                {/* Sub-section: Daily Lecture Notes */}
                <div className="mt-8">
                  <h3 className="text-lg font-black text-[#1F2517] mb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C4F46C]" />
                    Daily Scraped Lecture Transcripts & Key Framing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCourse.lectureNotes.map((ln) => (
                      <div
                        key={ln.id}
                        className="p-5 rounded-2xl bg-white border-2 border-[#E1DBCA] space-y-2 text-xs shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[#3B4232] px-2.5 py-0.5 rounded-full bg-[#EAE3D0] text-[10px]">
                            {ln.slideReference}
                          </span>
                          <span className="font-bold text-[#6D7B61] text-[11px]">
                            Lecture {ln.lectureNumber}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-[#1D2416]">{ln.title}</h4>
                        <div className="p-2.5 rounded-xl bg-[#F7F4EB] border border-[#E5DEC7] italic font-semibold text-[#323D29]">
                          {ln.professorQuote}
                        </div>
                        <p className="text-[#5E6C52] text-[11px] leading-relaxed">
                          <strong>Prof Mental Model:</strong> {ln.professorFraming}
                        </p>
                        <div className="pt-2 border-t border-[#EFE8D6] text-[10px] text-[#A84523] font-bold">
                          ⚠️ {ln.genericTextbookContrast}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-section: Past Exam Archives */}
                {activeCourse.pastExams.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-[#E1DBCB]">
                    <h3 className="text-lg font-black text-[#1F2517] mb-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D96B43]" />
                      Professor-Uploaded Past Exam Archives
                    </h3>
                    <div className="space-y-3">
                      {activeCourse.pastExams.map((pe) => (
                        <div
                          key={pe.id}
                          className="p-4 rounded-2xl bg-white border-2 border-[#E1DBCA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-md bg-[#3B4232] text-[#C4F46C] text-[10px] font-black">
                                {pe.semester}
                              </span>
                              <span className="text-xs font-black text-[#1D2416]">
                                {pe.examName} • {pe.questionNumber}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[#2C3524] mb-1">
                              {pe.questionText}
                            </p>
                            <p className="text-[11px] text-[#637256] italic">
                              Rubric Rule: {pe.professorRubricNote}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-[10px] font-bold text-[#717E66] uppercase">
                              Historical Miss Rate
                            </div>
                            <div className="text-lg font-black text-[#D96B43]">
                              {pe.historicalMissRate}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      )}
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-[#4B553E] py-6 text-center text-xs text-[#95A583]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C4F46C]" />
            <span>Lock In Study System • Canvas Ingestion & Gemini AI Forecaster</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Active Class: {activeCourse ? activeCourse.code : 'None (Blank Canvas)'}</span>
            <span>•</span>
            <button
              onClick={() => setIsWelcomeModalOpen(true)}
              className="text-[#CAD7B9] hover:text-[#C4F46C] hover:underline cursor-pointer"
            >
              App Guide & Overview
            </button>
            <span>•</span>
            <button
              onClick={() => setView('onboarding')}
              className="text-[#C4F46C] hover:underline cursor-pointer"
            >
              Canvas Class Onboarding Wizard
            </button>
          </div>
        </div>
      </footer>

      {/* CANVAS SETTINGS MODAL */}
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
        onAddEmbeddedFile={(newFile, extractedQuestions) => {
          if (!activeCourse) return;
          setActiveCourse((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              embeddedFiles: [newFile, ...(prev.embeddedFiles || [])],
              questions:
                extractedQuestions && extractedQuestions.length > 0
                  ? [...extractedQuestions, ...prev.questions]
                  : prev.questions,
            };
          });
          setEnrolledCourses((prevCourses) =>
            prevCourses.map((c) =>
              c.code === activeCourse.code
                ? {
                    ...c,
                    embeddedFiles: [newFile, ...(c.embeddedFiles || [])],
                    questions:
                      extractedQuestions && extractedQuestions.length > 0
                        ? [...extractedQuestions, ...c.questions]
                        : c.questions,
                  }
                : c
            )
          );
        }}
        onRemoveEmbeddedFile={(fileId) => {
          if (!activeCourse) return;
          setActiveCourse((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              embeddedFiles: (prev.embeddedFiles || []).filter((f) => f.id !== fileId),
            };
          });
          setEnrolledCourses((prevCourses) =>
            prevCourses.map((c) =>
              c.code === activeCourse.code
                ? {
                    ...c,
                    embeddedFiles: (c.embeddedFiles || []).filter((f) => f.id !== fileId),
                  }
                : c
            )
          );
        }}
        onLoadPreset={handleLoadDemoData}
      />

      {/* CLASS CREATION & EDITING MODAL */}
      <ClassEditModal
        isOpen={isClassEditModalOpen}
        onClose={() => setIsClassEditModalOpen(false)}
        courseToEdit={courseToEdit}
        onSaveCourse={handleSaveCourse}
        onDeleteCourse={handleDeleteCourse}
        canDelete={enrolledCourses.length > 1}
      />

      {/* FIRST-TIME USER WELCOME & APP GUIDE MODAL */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onStartGame={() => {
          setIsWelcomeModalOpen(false);
          setView('game');
        }}
        onGoToDashboard={() => {
          setIsWelcomeModalOpen(false);
          setView('home');
        }}
      />
    </div>
  );
}
