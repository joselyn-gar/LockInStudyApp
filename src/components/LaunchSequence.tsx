import React, { useState, useEffect, useRef } from 'react';
import { StarryMascot } from './StarryMascot';
import {
  RotateCcw,
  Sparkles,
  Home,
  Gamepad2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface LaunchSequenceProps {
  onComplete: () => void;
  onStartDailySession: () => void;
  semesterLabel?: string;
  daysRemaining?: number;
  courseCode?: string;
  courseName?: string;
}

export const LaunchSequence: React.FC<LaunchSequenceProps> = ({
  onComplete,
  onStartDailySession,
  semesterLabel = 'Fall 2026',
  courseCode = 'MGT 301',
}) => {
  // Continuous progress from 0.0 (Close-Up) to 1.0 (Home Reveal)
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const animationFrameRef = useRef<number | null>(null);

  // Exact color constants
  const beigeSkin = '#E0C399';
  const oliveGreen = '#4E5D37';
  const offWhite = '#F7F4EB';

  // Smooth cinematic 2.6s automatic camera animation that runs completely on its own
  useEffect(() => {
    if (!isPlaying) return;

    const duration = 2600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const rawProgress = Math.min(1, elapsed / duration);

      // Smooth cubic ease-in-out curve
      const eased =
        rawProgress < 0.5
          ? 4 * rawProgress * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

      setProgress(eased);

      if (rawProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        // Fully loaded on its own! Stop cleanly and present the two bubble options.
        // DO NOT automatically throw user into practice or anywhere else.
        setIsPlaying(false);
        setProgress(1);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handleReplay = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setProgress(0);
    setIsPlaying(true);
  };

  // Dynamic Camera scale from 3.2x close-up down to 1.0x
  const cameraScale = 3.2 - progress * 2.2;

  // Background color interpolation:
  // Starts solid beige (0 - 0.25), expands to olive green (0.35 - 0.7), dissolves to off-white (0.75 - 1.0)
  let bgColor = beigeSkin;
  if (progress > 0.3 && progress <= 0.72) {
    bgColor = oliveGreen;
  } else if (progress > 0.72) {
    bgColor = offWhite;
  }

  // Header "LOCK IN" visibility: emerges around 0.35, settles around 0.55, fades around 0.75
  const lockInOpacity =
    progress < 0.25
      ? 0
      : progress <= 0.55
      ? (progress - 0.25) / 0.3
      : Math.max(0, 1 - (progress - 0.55) / 0.2);

  // Home Screen Elements visibility (Scope bar, speech bubble, bubble options)
  const homeElementsOpacity = Math.max(0, Math.min(1, (progress - 0.68) / 0.25));
  const isFullyLoaded = progress >= 0.95;

  return (
    <div className="relative w-full min-h-[92vh] py-6 px-3 sm:px-6 bg-[#EBE4D5] rounded-3xl border-4 border-[#3B4232] shadow-2xl flex flex-col items-center justify-between select-none overflow-hidden transition-all duration-300">
      {/* Scattered background stars */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <g id="sparkle-star-alive">
              <path d="M 0,-8 Q 0,0 8,0 Q 0,0 0,8 Q 0,0 -8,0 Q 0,0 0,-8 Z" fill="#3B4232" />
            </g>
          </defs>
          <use href="#sparkle-star-alive" x="4%" y="12%" transform="scale(1.2)" />
          <use href="#sparkle-star-alive" x="96%" y="18%" transform="scale(1.4)" />
          <use href="#sparkle-star-alive" x="3%" y="54%" transform="scale(1.1)" />
          <use href="#sparkle-star-alive" x="97%" y="62%" transform="scale(1.3)" />
          <use href="#sparkle-star-alive" x="35%" y="6%" transform="scale(0.9)" />
          <use href="#sparkle-star-alive" x="68%" y="94%" transform="scale(1.2)" />
        </svg>
      </div>

      {/* Top Controller Bar */}
      <div className="relative z-30 w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#3B4232]/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-[#556047] text-white">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isPlaying ? 'bg-[#B4EE36] animate-pulse' : 'bg-[#C4F46C]'
            }`}
          />
          <span className="text-xs font-black uppercase tracking-wider text-[#DCE7CF]">
            {isPlaying
              ? 'Starry is Locking In on its own...'
              : 'Fully Loaded • Pick Your Destination'}
          </span>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReplay}
            title="Replay Zoom-out Animation"
            className="p-1.5 px-3 rounded-full bg-[#2C3325] hover:bg-[#3D4734] text-[#DCE7CF] border border-[#4F5B41] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#B4EE36]" />
            <span>Replay</span>
          </button>

          <button
            onClick={onComplete}
            className="px-3.5 py-1.5 rounded-full bg-[#B4EE36] hover:bg-[#a6e525] text-[#202B11] text-xs font-black shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home Dashboard</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. SEAMLESS LIVING ZOOM: AUTOPLAYING LIVING SEQUENCE      */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center animate-in fade-in">
          {/* Stage Label */}
          <div className="mb-3 text-center transition-all">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#5C6A4B] bg-white/85 px-3.5 py-1 rounded-full border border-[#D7CEBB] shadow-xs flex items-center gap-1.5">
              {progress < 0.35 ? (
                <span>01 / Zoomed In (Face Close-Up)</span>
              ) : progress < 0.7 ? (
                <span>02 / Zooming Out (LOCK IN)</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#85B72C]" />
                  <span>03 / Fully Loaded (Choose Session or Dashboard)</span>
                </>
              )}
            </span>
          </div>

          {/* iPhone Frame */}
          <div className="w-[285px] sm:w-[310px] h-[590px] bg-[#1E2519] rounded-[52px] p-[11px] shadow-[0_35px_70px_-15px_rgba(40,30,20,0.5)] border-4 border-[#3D4734] relative overflow-hidden flex flex-col">
            {/* Speaker Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#1E2519] rounded-b-2xl z-40 flex items-center justify-center">
              <div className="w-12 h-1.5 bg-[#3B4232] rounded-full" />
            </div>

            {/* SCREEN VIEWPORT with Smooth Dynamic Background */}
            <div
              className="w-full h-full rounded-[42px] overflow-hidden relative flex flex-col items-center justify-between transition-colors duration-500"
              style={{ backgroundColor: bgColor }}
            >
              {/* --- LAYER A: ARCHED 'LOCK IN' HEADER (Fades in during mid zoom) --- */}
              {lockInOpacity > 0.02 && (
                <div
                  className="absolute top-10 inset-x-0 z-20 pointer-events-none flex flex-col items-center justify-center transition-opacity"
                  style={{ opacity: lockInOpacity }}
                >
                  <div className="w-full h-20 relative flex items-center justify-center">
                    <svg viewBox="0 0 240 80" className="w-full h-full">
                      <path id="curve-live-lockin" d="M 20,70 Q 120,20 220,70" fill="transparent" />
                      <text
                        className="font-black text-[34px] tracking-widest uppercase fill-white drop-shadow-sm"
                        style={{ fontFamily: 'Plus Jakarta Sans, Fredoka, sans-serif' }}
                      >
                        <textPath href="#curve-live-lockin" startOffset="50%" textAnchor="middle">
                          LOCK IN
                        </textPath>
                      </text>
                    </svg>
                  </div>
                  {/* Cream cloud silhouette */}
                  <div className="w-56 h-68 bg-[#F7F4EB] rounded-t-[110px] rounded-b-[70px] absolute inset-x-0 mx-auto top-6 -z-10 shadow-sm" />
                </div>
              )}

              {/* --- LAYER B: THE LIVING, BREATHING, MORPHING STARRY --- */}
              {/* Scales seamlessly from close-up (3.2x) down to natural size (1.0x) */}
              <div
                className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `scale(${cameraScale}) translateY(${isFullyLoaded ? -24 : 0}px)`,
                  transformOrigin: '50% 50%',
                  transition: 'transform 0.08s linear',
                }}
              >
                <div className="relative">
                  <StarryMascot
                    morphProgress={progress}
                    size={isFullyLoaded ? 125 : 160}
                    className="transition-transform"
                  />
                </div>
              </div>

              {/* --- LAYER C: HOME SCREEN REVEAL (Scope bar, speech bubble, two bubble options) --- */}
              {homeElementsOpacity > 0.02 && (
                <div
                  className="relative z-30 w-full h-full flex flex-col items-center justify-between pt-8 pb-5 px-3.5 transition-opacity duration-300"
                  style={{ opacity: homeElementsOpacity }}
                >
                  {/* Top Banner: Course Code & Semester Scope */}
                  <div className="w-full bg-[#4E5D37] rounded-full py-1.5 px-3 text-center text-white text-[11px] font-black tracking-wide shadow-xs flex items-center justify-center gap-1.5">
                    <span className="text-[#C4F46C] font-black">{courseCode}</span>
                    <span className="text-white/60">•</span>
                    <span>Scope: Aug 28 - Dec 15</span>
                  </div>

                  {/* Speech Bubble: "Let's lock in today!" */}
                  <div className="w-full relative mt-2.5 mb-1">
                    <div className="bg-[#475531] text-[#F7F4EB] rounded-2xl py-2 px-3 text-center font-black text-xs sm:text-sm leading-tight shadow-md border border-[#5A6C40]">
                      {isFullyLoaded ? (
                        <span>Let&apos;s lock in! Choose your destination:</span>
                      ) : (
                        <span>
                          Let&apos;s lock
                          <br />
                          in today!
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-2 right-12 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-[#475531]" />
                  </div>

                  {/* Spacer for Starry in middle */}
                  <div className="my-auto h-24 pointer-events-none" />

                  {/* TWO BUBBLE OPTIONS ON SCREEN */}
                  <div className="w-full space-y-2 mt-auto z-40">
                    {/* Bubble Option 1: Daily Session */}
                    <button
                      type="button"
                      onClick={onStartDailySession}
                      className="w-full py-2.5 px-3 rounded-2xl bg-[#B4EE36] hover:bg-[#a6e525] active:scale-95 transition-all text-[#1F2C10] font-black text-xs shadow-md border-2 border-[#81C013] flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 text-left min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-[#1F2C10] text-[#B4EE36] flex items-center justify-center shrink-0 shadow-xs">
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black leading-tight text-[#17220B] truncate">
                            Daily Session
                          </div>
                          <div className="text-[10px] text-[#445628] font-bold truncate">
                            {courseCode} • 10 Practice Qs
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#1F2C10] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>

                    {/* Bubble Option 2: Home Dashboard */}
                    <button
                      type="button"
                      onClick={onComplete}
                      className="w-full py-2.5 px-3 rounded-2xl bg-[#3B4232] hover:bg-[#2B3124] active:scale-95 transition-all text-white font-black text-xs shadow-md border-2 border-[#546047] flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 text-left min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-[#546047] text-[#C4F46C] flex items-center justify-center shrink-0 shadow-xs">
                          <Home className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black leading-tight text-white truncate">
                            Home Dashboard
                          </div>
                          <div className="text-[10px] text-[#A6B694] font-bold truncate">
                            Progress & Courses
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#C4F46C] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BELOW THE PHONE: AUTONOMOUS PROGRESS OR TWO PROMINENT BUBBLES */}
          <div className="mt-5 w-full max-w-sm flex flex-col items-center">
            {isPlaying ? (
              /* Automatic smooth progress bar — runs on its own */
              <div className="w-full flex flex-col items-center gap-1.5 py-1">
                <div className="flex items-center justify-between w-full text-xs font-bold text-[#556346]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B4EE36] animate-pulse" />
                    <span>Locking in automatically...</span>
                  </span>
                  <span className="font-mono font-black text-[#2C3423]">
                    {Math.round(progress * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#D8CFBC] rounded-full overflow-hidden border border-[#C5BB9F]">
                  <div
                    className="h-full bg-gradient-to-r from-[#7BA934] to-[#B4EE36] transition-all duration-75 rounded-full"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              /* TWO BUBBLE OPTIONS OUTSIDE PHONE ONCE FULLY LOADED */
              <div className="w-full flex flex-col items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-[#D5CBBA] text-xs font-black text-[#38432C] shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#88B82B]" />
                  <span>Choose Your Destination:</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 w-full">
                  {/* Bubble 1: Daily Session */}
                  <button
                    type="button"
                    onClick={onStartDailySession}
                    className="p-3.5 rounded-2xl bg-[#B4EE36] hover:bg-[#a6e525] border-2 border-[#81C013] text-[#1E2712] font-black text-xs shadow-md flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#1E2712] text-[#B4EE36] flex items-center justify-center shrink-0 shadow-xs">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-black text-[#17220B] leading-tight">
                      Daily Session
                    </div>
                    <span className="text-[10px] font-bold text-[#445628]">
                      10 Qs • Practice Drill
                    </span>
                  </button>

                  {/* Bubble 2: Home Dashboard */}
                  <button
                    type="button"
                    onClick={onComplete}
                    className="p-3.5 rounded-2xl bg-[#3B4232] hover:bg-[#2B3124] border-2 border-[#4E5842] text-white font-black text-xs shadow-md flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-center group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#525E45] text-[#C4F46C] flex items-center justify-center shrink-0 shadow-xs">
                      <Home className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-black text-white leading-tight">
                      Home Dashboard
                    </div>
                    <span className="text-[10px] font-bold text-[#A6B694]">
                      Progress & Course Selector
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReplay}
                  className="mt-1 px-3 py-1 rounded-full text-[11px] font-bold text-[#5C6A4B] hover:text-[#2A3320] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-[#7FA935]" />
                  <span>Replay Zoom</span>
                </button>
              </div>
            )}
          </div>
        </div>

      {/* Bottom Footer Info */}
      <div className="relative z-20 mt-6 pt-4 border-t border-[#D9D0BE] w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5E6D4E]">
        <div className="flex items-center gap-2 font-bold text-[#3E4C2E]">
          <Sparkles className="w-4 h-4 text-[#89B929]" />
          <span>Living Zoom animation runs automatically with fluid camera & morphing facial expressions</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onComplete}
            className="hover:underline font-bold text-[#35431D] cursor-pointer"
          >
            Go to Dashboard
          </button>
          <span>•</span>
          <button
            onClick={onStartDailySession}
            className="px-4 py-1.5 rounded-full bg-[#3B4232] hover:bg-[#2A3123] text-[#B4EE36] font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Daily Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
