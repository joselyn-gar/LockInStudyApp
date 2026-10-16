import React, { useState, useMemo } from 'react';
import { CourseData, DailyProgressPoint } from '../types';
import { StarryMascot } from './StarryMascot';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  BarChart,
  LineChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Flame,
  Award,
  Zap,
  CheckCircle2,
  Calendar,
  Gamepad2,
  Sparkles,
  ArrowUpRight,
  Layers,
  Info,
} from 'lucide-react';

interface StudyProgressAnalyticsProps {
  course: CourseData | null;
  totalXp: number;
  currentStreak: number;
  studyHistory?: DailyProgressPoint[];
  onStartGame?: () => void;
  onSimulateSession?: (points: number) => void;
}

export const StudyProgressAnalytics: React.FC<StudyProgressAnalyticsProps> = ({
  course,
  totalXp,
  currentStreak,
  studyHistory = [],
  onStartGame,
  onSimulateSession,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d'>('7d');
  const [viewMode, setViewMode] = useState<'combined' | 'xp' | 'mastery'>('combined');

  // Compute current average mastery for active course
  const currentMastery = useMemo(() => {
    if (!course || !course.modules || course.modules.length === 0) return 0;
    const sum = course.modules.reduce((acc, m) => acc + m.masteryPercentage, 0);
    return Math.round(sum / course.modules.length);
  }, [course]);

  // Generate or align data points with current course & live XP
  const chartData = useMemo(() => {
    // If user has recorded history, adapt it
    if (studyHistory.length > 0) {
      const data = timeRange === '7d' ? studyHistory.slice(-7) : studyHistory.slice(-14);
      // Sync the last entry with current live XP and current course mastery
      if (data.length > 0) {
        const lastIdx = data.length - 1;
        const lastItem = { ...data[lastIdx] };
        if (currentMastery > 0) {
          lastItem.masteryPercentage = currentMastery;
        }
        if (totalXp > 0) {
          lastItem.cumulativeXp = totalXp;
        }
        return [...data.slice(0, lastIdx), lastItem];
      }
      return data;
    }

    // Default dates for the current week anchor
    const days = [
      { label: 'Mon Oct 5', fullDate: '2026-10-05', xp: 20, mastery: 65, qs: 8, focus: 'Foundations & Principles' },
      { label: 'Tue Oct 6', fullDate: '2026-10-06', xp: 35, mastery: 71, qs: 14, focus: 'Module 2 Applied Frameworks' },
      { label: 'Wed Oct 7', fullDate: '2026-10-07', xp: 25, mastery: 75, qs: 10, focus: 'Strategy Nuances & Rubrics' },
      { label: 'Thu Oct 8', fullDate: '2026-10-08', xp: 40, mastery: 82, qs: 16, focus: 'Midterm 1 Review Drill' },
      { label: 'Fri Oct 9', fullDate: '2026-10-09', xp: 15, mastery: 84, qs: 6, focus: 'Post-Exam Frontiers' },
      { label: 'Sat Oct 10', fullDate: '2026-10-10', xp: 30, mastery: 87, qs: 12, focus: 'Network Effects Case Study' },
      { label: 'Today (Sun)', fullDate: '2026-10-11', xp: Math.max(15, totalXp > 100 ? 45 : totalXp), mastery: currentMastery || 91, qs: 18, focus: 'Comprehensive Integration' },
    ];

    const isBlank = totalXp === 0 && studyHistory.length === 0;
    let runningXp = 0;
    return days.map((d, i) => {
      runningXp += isBlank ? 0 : d.xp;
      return {
        date: d.label,
        fullDate: d.fullDate,
        xpEarned: isBlank ? 0 : d.xp,
        cumulativeXp: isBlank ? 0 : runningXp,
        masteryPercentage: isBlank ? (currentMastery || 0) : d.mastery,
        questionsAnswered: isBlank ? 0 : d.qs,
        focusArea: isBlank ? (i === 6 ? 'Ready for First Practice Session' : 'No recorded activity yet') : d.focus,
      };
    });
  }, [studyHistory, timeRange, totalXp, currentMastery]);

  // Aggregate Stats
  const totalPeriodXp = useMemo(
    () => chartData.reduce((sum, d) => sum + d.xpEarned, 0),
    [chartData]
  );
  const avgDailyXp = useMemo(
    () => (chartData.length > 0 ? Math.round(totalPeriodXp / chartData.length) : 0),
    [totalPeriodXp, chartData.length]
  );
  const masteryDelta = useMemo(() => {
    if (chartData.length < 2) return 0;
    const first = chartData[0].masteryPercentage;
    const last = chartData[chartData.length - 1].masteryPercentage;
    return Math.max(0, last - first);
  }, [chartData]);

  const peakDay = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((max, d) => (d.xpEarned > max.xpEarned ? d : max), chartData[0]);
  }, [chartData]);

  return (
    <div className="w-full bg-[#F7F4EB] border-4 border-[#3B4232] rounded-[2.5rem] p-6 sm:p-8 shadow-xl text-[#1E2516] mb-8 space-y-6 animate-in fade-in">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E1DBCB]">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#3B4232] text-[#C4F46C] flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#3B4232] text-[#C4F46C] text-[11px] font-black uppercase tracking-wider mb-1">
              <Zap className="w-3 h-3" /> Study Intelligence & Trends
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1F2617] tracking-tight">
              Study Progress & XP Velocity
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6750] mt-0.5">
              Visualizing daily XP acquired and module mastery growth for{' '}
              <span className="font-black text-[#1E2516]">{course?.code || 'Active Course'}</span>
            </p>
          </div>
        </div>

        {/* View Controls & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Time range toggle */}
          <div className="inline-flex p-1 rounded-full bg-[#EAE2CE] border border-[#D5CBBA] text-xs font-bold">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                timeRange === '7d'
                  ? 'bg-[#3B4232] text-[#C4F46C] font-black shadow-xs'
                  : 'text-[#566447] hover:text-[#1E2516]'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                timeRange === '14d'
                  ? 'bg-[#3B4232] text-[#C4F46C] font-black shadow-xs'
                  : 'text-[#566447] hover:text-[#1E2516]'
              }`}
            >
              14 Days
            </button>
          </div>

          {/* View mode toggle */}
          <div className="inline-flex p-1 rounded-full bg-[#EAE2CE] border border-[#D5CBBA] text-xs font-bold">
            <button
              onClick={() => setViewMode('combined')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === 'combined'
                  ? 'bg-[#3B4232] text-[#C4F46C] font-black shadow-xs'
                  : 'text-[#566447] hover:text-[#1E2516]'
              }`}
            >
              Dual Axis
            </button>
            <button
              onClick={() => setViewMode('xp')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === 'xp'
                  ? 'bg-[#3B4232] text-[#C4F46C] font-black shadow-xs'
                  : 'text-[#566447] hover:text-[#1E2516]'
              }`}
            >
              XP Gain
            </button>
            <button
              onClick={() => setViewMode('mastery')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === 'mastery'
                  ? 'bg-[#3B4232] text-[#C4F46C] font-black shadow-xs'
                  : 'text-[#566447] hover:text-[#1E2516]'
              }`}
            >
              Mastery Lift
            </button>
          </div>

          {/* Direct game session drill button */}
          {onStartGame && (
            <button
              onClick={onStartGame}
              className="px-4 py-2 rounded-full bg-[#C4F46C] hover:bg-[#b2e557] text-[#1B2213] text-xs font-black shadow-sm border border-[#1E2516] flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Practice Now</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Daily XP Velocity */}
        <div className="p-4 rounded-2xl bg-white border-2 border-[#E1DBCA] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#68765A] text-[11px] font-bold uppercase tracking-wider">
            <span>Avg Daily Velocity</span>
            <Flame className="w-4 h-4 text-[#D96B43] fill-current" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1F2616] flex items-baseline gap-1">
            <span>+{avgDailyXp}</span>
            <span className="text-xs font-bold text-[#6D7D5E]">XP/day</span>
          </div>
          <div className="text-[11px] text-[#556346] flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-[#2E7D32]" />
            <span>Consistency: <strong>{currentStreak} Days</strong> active</span>
          </div>
        </div>

        {/* Stat 2: Total Scope XP */}
        <div className="p-4 rounded-2xl bg-white border-2 border-[#E1DBCA] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#68765A] text-[11px] font-bold uppercase tracking-wider">
            <span>Period Total XP</span>
            <Award className="w-4 h-4 text-[#C4F46C] fill-[#3B4232]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1F2616] flex items-baseline gap-1">
            <span>{totalPeriodXp}</span>
            <span className="text-xs font-bold text-[#6D7D5E]">XP earned</span>
          </div>
          <div className="text-[11px] text-[#556346] truncate">
            Cumulative total: <strong>{totalXp} XP</strong>
          </div>
        </div>

        {/* Stat 3: Mastery Lift */}
        <div className="p-4 rounded-2xl bg-white border-2 border-[#E1DBCA] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#68765A] text-[11px] font-bold uppercase tracking-wider">
            <span>Course Mastery Lift</span>
            <Layers className="w-4 h-4 text-[#3B4232]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1F2616] flex items-baseline gap-1">
            <span className="text-[#2B771A]">+{masteryDelta}%</span>
            <span className="text-xs font-bold text-[#6D7D5E]">trajectory</span>
          </div>
          <div className="text-[11px] text-[#556346]">
            Current standing: <strong>{currentMastery}%</strong>
          </div>
        </div>

        {/* Stat 4: Peak Study Day */}
        <div className="p-4 rounded-2xl bg-white border-2 border-[#E1DBCA] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#68765A] text-[11px] font-bold uppercase tracking-wider">
            <span>Peak Study Session</span>
            <Sparkles className="w-4 h-4 text-[#7B9F36]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1F2616] truncate">
            {peakDay ? peakDay.date.split(' ')[0] : 'None'}
          </div>
          <div className="text-[11px] text-[#556346] truncate">
            {peakDay ? `Record: +${peakDay.xpEarned} XP (${peakDay.questionsAnswered} Qs)` : 'No activity yet'}
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border-2 border-[#E1DBCA] shadow-inner space-y-4">
        {/* Chart Sub-header and Legend indicators */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#323D26]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C4F46C] border border-[#83AB33]" />
            <span>Daily XP Gain (Bars)</span>
            <span className="text-[#C1B79F]">•</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#D96B43]" />
            <span>Mastery Improvement % (Orange Curve)</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#697858]">
            <span className="inline-block w-4 border-b-2 border-dashed border-[#82AF34]" />
            <span>Exam Locked-In Target: <strong>85%</strong></span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-[320px] sm:h-[360px] relative">
          {totalPeriodXp === 0 && currentMastery === 0 && (
            <div className="absolute inset-0 bg-[#F7F4EB]/80 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center p-4 text-center z-20 pointer-events-none">
              <div className="w-10 h-10 rounded-2xl bg-[#3B4232] text-[#C4F46C] flex items-center justify-center mb-2 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-sm font-black text-[#1E2516]">Blank Canvas • Study Velocity Chart</div>
              <div className="text-xs text-[#5C6750] max-w-sm mt-1">
                Start a practice game or click <span className="font-bold text-[#1E2516]">+ Log Quick Session</span> below to chart your daily XP and mastery growth!
              </div>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
            >
              <defs>
                {/* XP Bar Gradient */}
                <linearGradient id="xpBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C4F46C" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#82AF34" stopOpacity={0.8} />
                </linearGradient>

                {/* Mastery Area Glow Gradient */}
                <linearGradient id="masteryAreaGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFA88A" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FFA88A" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#E6E0CF" strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="date"
                tick={{ fill: '#627054', fontSize: 11, fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#D7CEBA' }}
              />

              {/* Left Y-Axis: Daily XP */}
              {(viewMode === 'combined' || viewMode === 'xp') && (
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fill: '#4E5B3E', fontSize: 11, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={{ stroke: '#D7CEBA' }}
                  tickFormatter={(val) => `${val} XP`}
                  domain={[0, 'dataMax + 15']}
                />
              )}

              {/* Right Y-Axis: Mastery % */}
              {(viewMode === 'combined' || viewMode === 'mastery') && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#C05934', fontSize: 11, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={{ stroke: '#D7CEBA' }}
                  tickFormatter={(val) => `${val}%`}
                  domain={[0, 100]}
                />
              )}

              {/* Target 85% Mastery Reference Line */}
              {(viewMode === 'combined' || viewMode === 'mastery') && (
                <ReferenceLine
                  yAxisId="right"
                  y={85}
                  stroke="#83AF35"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: 'Target: 85% Mastery',
                    position: 'insideTopRight',
                    fill: '#496024',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              )}

              {/* Custom Tooltip */}
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const data = payload[0].payload as DailyProgressPoint;

                  return (
                    <div className="bg-[#242B1B] text-white p-3.5 rounded-2xl border-2 border-[#4E5C3B] shadow-2xl text-xs space-y-2 min-w-[200px]">
                      <div className="flex items-center justify-between border-b border-[#3D492F] pb-1.5 font-black">
                        <span className="text-[#C4F46C]">{data.date}</span>
                        <span className="text-[10px] text-[#A6B695]">{data.fullDate}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[#9DB188]">Daily XP Gain:</span>
                          <span className="font-black text-[#C4F46C]">+{data.xpEarned} XP</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#9DB188]">Scope Mastery:</span>
                          <span className="font-black text-[#FFA88A]">{data.masteryPercentage}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#9DB188]">Questions Drill:</span>
                          <span className="font-bold text-white">{data.questionsAnswered} Qs</span>
                        </div>
                      </div>

                      {data.focusArea && (
                        <div className="pt-1.5 border-t border-[#3D492F] text-[10px] text-[#CEDDC0]">
                          <span className="text-[#849B6C] font-bold">Focus: </span>
                          <span>{data.focusArea}</span>
                        </div>
                      )}
                    </div>
                  );
                }}
              />

              {/* XP Bars */}
              {(viewMode === 'combined' || viewMode === 'xp') && (
                <Bar
                  yAxisId="left"
                  dataKey="xpEarned"
                  name="Daily XP Gain"
                  fill="url(#xpBarGradient)"
                  radius={[8, 8, 0, 0]}
                  barSize={28}
                />
              )}

              {/* Mastery Area Glow */}
              {(viewMode === 'combined' || viewMode === 'mastery') && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="masteryPercentage"
                  fill="url(#masteryAreaGlow)"
                  stroke="none"
                />
              )}

              {/* Mastery Curve Line */}
              {(viewMode === 'combined' || viewMode === 'mastery') && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="masteryPercentage"
                  name="Module Mastery %"
                  stroke="#D96B43"
                  strokeWidth={3.5}
                  dot={{ fill: '#3B4232', stroke: '#FFA88A', strokeWidth: 2, r: 4 }}
                  activeDot={{ fill: '#C4F46C', stroke: '#212918', strokeWidth: 2, r: 7 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Motivational Bottom Bar with Starry */}
      <div className="p-4 rounded-2xl bg-[#ECE5D2] border border-[#DDD3BC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <StarryMascot mood={currentMastery >= 85 ? 'triumphant' : 'focused'} size={38} className="shrink-0" />
          <div className="text-[#2F3924]">
            <strong>Starry&apos;s Velocity Diagnosis: </strong>
            {currentMastery >= 85
              ? 'Outstanding momentum! You have breached the 85% Exam-Ready threshold on this course scope.'
              : `You are on pace! A 3-minute session today will raise your module retention by +5% and keep your ${currentStreak}-day streak active.`}
          </div>
        </div>

        {onSimulateSession && (
          <button
            type="button"
            onClick={() => onSimulateSession(20)}
            className="px-3.5 py-1.5 rounded-full bg-[#3B4232] hover:bg-[#2A3123] text-[#C4F46C] text-[11px] font-black cursor-pointer shadow-xs transition-transform active:scale-95 whitespace-nowrap shrink-0"
            title="Log a quick practice session to see the chart dynamically update"
          >
            + Log Quick Session (+20 XP)
          </button>
        )}
      </div>
    </div>
  );
};
