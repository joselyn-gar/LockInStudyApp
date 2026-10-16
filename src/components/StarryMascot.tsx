import React from 'react';
import { StarryMood } from '../types';

interface StarryMascotProps {
  mood?: StarryMood;
  size?: number | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'zoomed';
  className?: string;
  speechText?: string;
  onClick?: () => void;
  // If morphProgress is supplied (0 to 1), animates facial features continuously
  morphProgress?: number;
}

export const StarryMascot: React.FC<StarryMascotProps> = ({
  mood = 'waving',
  size = 'md',
  className = '',
  speechText,
  onClick,
  morphProgress,
}) => {
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm': return 56;
      case 'md': return 96;
      case 'lg': return 160;
      case 'xl': return 220;
      case 'hero': return 300;
      case 'zoomed': return 420;
      default: return 96;
    }
  };

  const dim = getDimension();

  // Colors calibrated to mockup
  const starSkin = '#E0C399'; // Warm golden-beige star color
  const eyeDark = '#422918'; // Dark rich brown for pupils and mouth
  const cheekPink = '#D98A7A'; // Warm rosy pink cheeks
  const armColor = '#3B291B'; // Thin stick figure arms/legs
  const tonguePink = '#E18A7A'; // Cute pink tongue

  // =========================================================================
  // DYNAMIC MORPHING STARRY (Smoothly animates facial features from 0.0 to 1.0)
  // =========================================================================
  if (morphProgress !== undefined) {
    const p = Math.max(0, Math.min(1, morphProgress));

    // Morph interpolation factor (0 = full shock face, 1 = full happy face)
    // Starts morphing at 0.15, completes morphing at 0.65
    let m = 0;
    if (p > 0.15 && p < 0.65) {
      m = (p - 0.15) / 0.5;
    } else if (p >= 0.65) {
      m = 1;
    }
    // Eased morph
    const easeM = m < 0.5 ? 2 * m * m : 1 - Math.pow(-2 * m + 2, 2) / 2;

    // Cheeks pop in and glow
    const cheekScale = Math.max(0, (p - 0.25) / 0.4);
    const cheekOpacity = Math.min(1, cheekScale * 1.2);

    // Arms stretch out
    const armGrowth = Math.max(0, Math.min(1, (p - 0.35) / 0.35));

    // Mouth dimensions
    // At m=0: wide open scream (height 60px, width 140px)
    // At m=1: happy open smile (height 16px, width 32px)
    const mouthW = (1 - easeM) * 140 + easeM * 28;
    const mouthH = (1 - easeM) * 64 + easeM * 16;
    const mouthY = (1 - easeM) * 160 + easeM * 140;

    // Right Eye: giant white eye shrinks and moves to standard position
    const rightEyeScale = (1 - easeM) * 1.8 + easeM * 1.0;
    const rightEyeX = (1 - easeM) * 155 + easeM * 138;
    const rightEyeY = (1 - easeM) * 115 + easeM * 120;
    const rightPupilR = (1 - easeM) * 18 + easeM * 7.5;

    // Left Eye: small dot expands white sclera and centers
    const leftEyeScleraR = easeM * 13;
    const leftPupilR = (1 - easeM) * 11 + easeM * 7.5;
    const leftEyeX = (1 - easeM) * 85 + easeM * 102;
    const leftEyeY = (1 - easeM) * 125 + easeM * 120;

    return (
      <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full animate-breathe"
          style={{ width: dim, height: dim }}
        >
          {/* Ground drop shadow when zoomed out */}
          <ellipse
            cx="120"
            cy="222"
            rx={46 * armGrowth}
            ry={7 * armGrowth}
            fill="#DDD4C2"
            opacity={armGrowth}
          />

          {/* Thin Stick Legs */}
          {armGrowth > 0.05 && (
            <g
              stroke={armColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity={armGrowth}
              transform={`translate(0, ${(1 - armGrowth) * 10})`}
            >
              <line x1="104" y1="184" x2="102" y2="218" />
              <line x1="102" y1="218" x2="94" y2="218" />
              <line x1="136" y1="184" x2="138" y2="218" />
              <line x1="138" y1="218" x2="146" y2="218" />
            </g>
          )}

          {/* Thin Stick Arms with Living Natural Waving */}
          {armGrowth > 0.1 && (
            <g stroke={armColor} strokeWidth="3.5" strokeLinecap="round" opacity={armGrowth}>
              {/* Left waving arm with organic sway */}
              <g className="animate-wave-left">
                <path d="M 64 140 L 36 120" />
                <path d="M 36 120 L 30 114" />
                <path d="M 36 120 L 32 126" />
              </g>

              {/* Right waving arm with organic sway */}
              <g className="animate-wave-right">
                <path d="M 176 140 L 204 120" />
                <path d="M 204 120 L 210 114" />
                <path d="M 204 120 L 208 126" />
              </g>
            </g>
          )}

          {/* Chubby 5-point beige star body */}
          <path
            d="
              M 120 34
              C 126 52, 136 78, 154 88
              C 172 98, 202 102, 210 116
              C 218 130, 196 150, 186 166
              C 176 182, 180 208, 166 218
              C 152 228, 128 212, 120 212
              C 112 212, 88 228, 74 218
              C 60 208, 64 182, 54 166
              C 44 150, 22 130, 30 116
              C 38 102, 68 98, 86 88
              C 104 78, 114 52, 120 34 Z
            "
            fill={starSkin}
          />

          {/* Rosy Pink Cheeks (Pulsing & Alive) */}
          {cheekOpacity > 0.02 && (
            <g opacity={cheekOpacity} className="animate-cheek-pulse">
              <circle cx="78" cy="138" r={16 * Math.min(1, cheekScale)} fill={cheekPink} />
              <circle cx="162" cy="138" r={16 * Math.min(1, cheekScale)} fill={cheekPink} />
            </g>
          )}

          {/* EYES (Fluidly morphing and naturally blinking!) */}
          <g className={easeM > 0.8 ? 'animate-blink' : ''}>
            {/* Left Eye */}
            <g>
              {leftEyeScleraR > 1 && (
                <circle cx={leftEyeX} cy={leftEyeY} r={leftEyeScleraR} fill="#FFFFFF" />
              )}
              <circle cx={leftEyeX + easeM * 2} cy={leftEyeY} r={leftPupilR} fill={eyeDark} />
            </g>

            {/* Right Eye */}
            <g>
              <ellipse
                cx={rightEyeX}
                cy={rightEyeY}
                rx={13 * rightEyeScale}
                ry={13 * rightEyeScale}
                fill="#FFFFFF"
              />
              <circle
                cx={rightEyeX + easeM * 2}
                cy={rightEyeY}
                r={rightPupilR}
                fill={eyeDark}
              />
            </g>
          </g>

          {/* MOUTH (Smoothly morphing from shock scream to happy open smile!) */}
          <g>
            {easeM < 0.6 ? (
              // Screaming / startled mouth morphing into smaller oval
              <g>
                <ellipse
                  cx="120"
                  cy={mouthY}
                  rx={mouthW * 0.5}
                  ry={mouthH * 0.5}
                  fill={eyeDark}
                />
                <ellipse
                  cx="120"
                  cy={mouthY + mouthH * 0.2}
                  rx={mouthW * 0.35}
                  ry={mouthH * 0.3}
                  fill={tonguePink}
                />
              </g>
            ) : (
              // Happy open smile with pink tongue
              <g>
                <path
                  d="M 112 140 C 112 140, 113 154, 120 154 C 127 154, 128 140, 128 140 Z"
                  fill={eyeDark}
                />
                <path
                  d="M 116 148 C 117 152, 123 152, 124 148 Z"
                  fill={tonguePink}
                />
              </g>
            )}
          </g>
        </svg>
      </div>
    );
  }

  // =========================================================================
  // STANDARD STARRY (Static moods: waving, stressed, focused) WITH LIVING MOTION
  // =========================================================================
  if (mood === 'zoomed_face') {
    return (
      <div className={`relative flex items-center justify-center w-full h-full overflow-hidden ${className}`}>
        <svg
          viewBox="0 0 300 480"
          className="w-full h-full object-cover animate-breathe"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="300" height="480" fill={starSkin} />
          <circle cx="95" cy="235" r="14" fill={eyeDark} />
          <g>
            <path
              d="M 185 145 C 255 145, 305 185, 305 270 C 305 320, 260 325, 205 325 C 170 325, 160 270, 160 230 C 160 175, 172 145, 185 145 Z"
              fill="#FFFFFF"
            />
            <circle cx="218" cy="238" r="30" fill={eyeDark} />
          </g>
          <g>
            <path
              d="M 75 355 C 65 375, 80 405, 105 408 C 115 410, 125 390, 140 380 C 160 368, 185 365, 210 380 C 235 395, 255 400, 265 375 C 275 350, 260 340, 230 335 C 190 330, 180 345, 155 348 C 130 350, 115 325, 95 330 C 80 335, 78 345, 75 355 Z"
              fill={eyeDark}
            />
            <path
              d="M 105 408 C 120 380, 155 375, 185 378 C 215 380, 240 395, 235 410 C 205 435, 140 435, 105 408 Z"
              fill={tonguePink}
            />
          </g>
        </svg>
      </div>
    );
  }

  // STRESSED STARRY FOR TERRACOTTA ORANGE ERROR CARD
  if (mood === 'stressed') {
    return (
      <div className={`relative inline-flex flex-col items-center ${className}`}>
        <svg viewBox="0 0 240 240" style={{ width: dim, height: dim }}>
          <ellipse cx="120" cy="225" rx="45" ry="8" fill="#B3522E" opacity="0.4" />
          <g stroke="#26160C" strokeWidth="4" strokeLinecap="round">
            <path d="M 104 185 L 100 218 L 92 219" />
            <path d="M 136 185 L 140 218 L 148 219" />
          </g>
          <g stroke="#26160C" strokeWidth="4" strokeLinecap="round">
            <path d="M 68 135 L 50 115 L 75 110" />
            <path d="M 172 135 L 190 115 L 165 110" />
          </g>
          <path
            d="
              M 120 32
              C 126 50, 136 76, 152 86
              C 168 96, 198 100, 206 114
              C 214 128, 192 148, 182 164
              C 172 180, 178 206, 164 216
              C 150 226, 128 210, 120 210
              C 112 210, 90 226, 76 216
              C 62 206, 68 180, 58 164
              C 48 148, 26 128, 34 114
              C 42 100, 72 96, 88 86
              C 104 76, 114 50, 120 32 Z
            "
            fill={starSkin}
          />
          <circle cx="78" cy="138" r="16" fill={cheekPink} />
          <circle cx="162" cy="138" r="16" fill={cheekPink} />
          <ellipse cx="102" cy="120" rx="14" ry="17" fill="#FFFFFF" />
          <circle cx="102" cy="120" r="7" fill={eyeDark} />
          <ellipse cx="138" cy="120" rx="14" ry="17" fill="#FFFFFF" />
          <circle cx="138" cy="120" r="7" fill={eyeDark} />
          <g className="animate-sweat">
            <path
              d="M 178 78 C 178 72, 184 66, 184 66 C 184 66, 190 72, 190 78 C 190 82, 187 85, 184 85 C 181 85, 178 82, 178 78 Z"
              fill="#75D1FF"
            />
          </g>
          <path
            d="M 108 152 Q 114 158 120 152 Q 126 146 132 152"
            fill="none"
            stroke={eyeDark}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // LIVING WAVING STARRY (For Home & Results with breathing, blinking & organic arm wave)
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {speechText && (
        <div className="mb-3 relative px-5 py-3 bg-[#475531] text-[#F7F4EB] text-sm sm:text-base font-black rounded-3xl shadow-md text-center animate-bounce">
          {speechText}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-[#475531]" />
        </div>
      )}

      <svg
        viewBox="0 0 240 240"
        className="w-full h-full animate-breathe"
        style={{ width: dim, height: dim }}
      >
        <ellipse cx="120" cy="222" rx="46" ry="7" fill="#DDD4C2" />

        <g stroke={armColor} strokeWidth="3.5" strokeLinecap="round">
          <line x1="104" y1="184" x2="102" y2="218" />
          <line x1="102" y1="218" x2="94" y2="218" />
          <line x1="136" y1="184" x2="138" y2="218" />
          <line x1="138" y1="218" x2="146" y2="218" />
        </g>

        {/* Supercharged golden starlight aura */}
        {mood === 'supercharged' && (
          <circle
            cx="120"
            cy="130"
            r="88"
            fill="none"
            stroke="#C4F46C"
            strokeWidth="4"
            strokeDasharray="6 6"
            className="animate-spin opacity-80"
            style={{ animationDuration: '8s' }}
          />
        )}

        {mood === 'focused' ? (
          <g stroke={armColor} strokeWidth="3.5" strokeLinecap="round">
            <path d="M 66 140 L 46 155 L 70 162" />
            <path d="M 174 140 L 194 155 L 170 162" />
          </g>
        ) : mood === 'eating' ? (
          /* Arms holding a golden stardust snack biscuit */
          <g>
            <g stroke={armColor} strokeWidth="3.5" strokeLinecap="round">
              <path d="M 64 140 L 98 152" />
              <path d="M 176 140 L 142 152" />
            </g>
            {/* Star biscuit snack being eaten */}
            <g transform="translate(120, 154) scale(0.85)">
              <polygon
                points="0,-12 3.5,-3.5 12,-3.5 5,2 8,11 0,6 -8,11 -5,2 -12,-3.5 -3.5,-3.5"
                fill="#FFD700"
                stroke="#C4A000"
                strokeWidth="1.5"
              />
              {/* Little crumbs / sparkles */}
              <circle cx="-14" cy="-6" r="1.5" fill="#FFD700" opacity="0.9" />
              <circle cx="15" cy="-4" r="1.5" fill="#C4F46C" opacity="0.9" />
              <circle cx="0" cy="14" r="1.2" fill="#FFA88A" opacity="0.8" />
            </g>
          </g>
        ) : (
          <g stroke={armColor} strokeWidth="3.5" strokeLinecap="round">
            <g className="animate-wave-left">
              <path d="M 64 140 L 36 120" />
              <path d="M 36 120 L 30 114" />
              <path d="M 36 120 L 32 126" />
            </g>
            <g className="animate-wave-right">
              <path d="M 176 140 L 204 120" />
              <path d="M 204 120 L 210 114" />
              <path d="M 204 120 L 208 126" />
            </g>
          </g>
        )}

        <path
          d="
            M 120 34
            C 126 52, 136 78, 154 88
            C 172 98, 202 102, 210 116
            C 218 130, 196 150, 186 166
            C 176 182, 180 208, 166 218
            C 152 228, 128 212, 120 212
            C 112 212, 88 228, 74 218
            C 60 208, 64 182, 54 166
            C 44 150, 22 130, 30 116
            C 38 102, 68 98, 86 88
            C 104 78, 114 52, 120 34 Z
          "
          fill={mood === 'supercharged' ? '#F6DCB3' : starSkin}
        />

        <g className="animate-cheek-pulse">
          <circle cx="78" cy="138" r={mood === 'eating' ? 19 : 16} fill={cheekPink} />
          <circle cx="162" cy="138" r={mood === 'eating' ? 19 : 16} fill={cheekPink} />
        </g>

        {/* Naturally blinking eyes */}
        <g className="animate-blink">
          <circle cx="102" cy="120" r="13" fill="#FFFFFF" />
          <circle cx="104" cy="120" r="7.5" fill={eyeDark} />
          <circle cx="138" cy="120" r="13" fill="#FFFFFF" />
          <circle cx="140" cy="120" r="7.5" fill={eyeDark} />
        </g>

        {/* MOUTH: chewing animation when eating, open joyful smile when triumphant/supercharged */}
        {mood === 'eating' ? (
          <g>
            <ellipse cx="120" cy="142" rx="11" ry="8" fill={eyeDark} className="animate-pulse" />
            <ellipse cx="120" cy="145" rx="7" ry="4" fill={tonguePink} />
          </g>
        ) : mood === 'triumphant' || mood === 'waving' || mood === 'supercharged' ? (
          <g>
            <path
              d="M 112 140 C 112 140, 113 154, 120 154 C 127 154, 128 140, 128 140 Z"
              fill={eyeDark}
            />
            <path
              d="M 116 148 C 117 152, 123 152, 124 148 Z"
              fill={tonguePink}
            />
          </g>
        ) : (
          <path
            d="M 114 140 Q 120 146 126 140"
            fill="none"
            stroke={eyeDark}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};
