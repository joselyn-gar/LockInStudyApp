import React, { useState } from 'react';
import { StarFeedingState } from '../types';
import { StarryMascot } from './StarryMascot';
import { triggerLockedInConfetti } from './MasteryDashboard';
import {
  Sparkles,
  Cookie,
  Flame,
  Award,
  Zap,
  Heart,
  ChevronDown,
  ChevronUp,
  Gift,
  PartyPopper,
} from 'lucide-react';

interface StarFeedingSanctuaryProps {
  feedingState: StarFeedingState;
  onFeedStar: (treatsToFeed: number, snackName: string) => void;
  onEarnTreats?: (points: number) => void;
  onStartQuiz?: () => void;
}

const SNACKS = [
  {
    id: 'biscuit',
    name: 'Starlight Biscuit',
    cost: 5,
    fullnessGain: 8,
    icon: '🌟',
    description: 'Crispy stardust biscuit baked with foundational concepts.',
  },
  {
    id: 'croissant',
    name: 'Module Croissant',
    cost: 15,
    fullnessGain: 22,
    icon: '🥐',
    description: 'Flaky golden pastry filled with professor lecture quotes.',
  },
  {
    id: 'cake',
    name: 'Cosmic Star-Cake',
    cost: 30,
    fullnessGain: 45,
    icon: '🎂',
    description: 'Decadent multi-layered exam feast with sparklers & confetti!',
  },
];

const QUOTES_HUNGRY = [
  'I am running low on starlight! Complete a practice quiz to earn star snacks for me! 🥺',
  'Study points smell so good... Let us drill some exam questions! ✨',
  'Feed me stardust so I can help you lock in for exam day! 🌟',
];

const QUOTES_EATING = [
  'Nom nom nom! Delicious study points! My cheeks are glowing! 😋✨',
  'Mmm! That concept tasted amazing! Synapses sparkling! 🥐🌟',
  'Crunch crunch! Starlight energy rising! Keep feeding me! 💖',
];

const QUOTES_FULL = [
  'I am completely FULL and RADIANT! We are 100% Locked In for exams! 🌟👑',
  'Maximum starlight reached! You and I are unstoppable! ✨🚀',
  'Purring with cosmic knowledge! Ready to ace this semester! 💖🎉',
];

export const StarFeedingSanctuary: React.FC<StarFeedingSanctuaryProps> = ({
  feedingState,
  onFeedStar,
  onEarnTreats,
  onStartQuiz,
}) => {
  const [isEatingAnimation, setIsEatingAnimation] = useState<boolean>(false);
  const [currentSpeech, setCurrentSpeech] = useState<string>('');
  const [floatingTreatText, setFloatingTreatText] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const { fullness, availableTreats, totalTreatsFed, level, stageTitle, hungerState } = feedingState;

  // Handle feeding a specific snack
  const handleFeed = (snack: (typeof SNACKS)[0]) => {
    if (availableTreats < snack.cost) return;

    onFeedStar(snack.cost, snack.name);
    setIsEatingAnimation(true);
    setFloatingTreatText(`-${snack.cost} ⭐ ${snack.icon} Nom nom nom!`);

    const randomEatingQuote = QUOTES_EATING[Math.floor(Math.random() * QUOTES_EATING.length)];
    setCurrentSpeech(randomEatingQuote);

    // If feeding cake or hitting 100% fullness, celebrate with confetti!
    if (snack.id === 'cake' || fullness + snack.fullnessGain >= 100) {
      triggerLockedInConfetti();
    }

    setTimeout(() => {
      setIsEatingAnimation(false);
      setFloatingTreatText(null);
    }, 2200);
  };

  // Feed all available treats
  const handleFeedAll = () => {
    if (availableTreats <= 0) return;
    const amount = availableTreats;
    onFeedStar(amount, 'All Starlight Treats');
    setIsEatingAnimation(true);
    setFloatingTreatText(`-${amount} ⭐ Mega Feast! Nom nom nom!`);
    setCurrentSpeech('WHOA! A whole feast of study points! Starry is glowing bright! ✨🌟');
    triggerLockedInConfetti();

    setTimeout(() => {
      setIsEatingAnimation(false);
      setFloatingTreatText(null);
    }, 2600);
  };

  // Determine current active mood
  const currentMood = isEatingAnimation
    ? 'eating'
    : fullness >= 90
    ? 'supercharged'
    : fullness >= 60
    ? 'triumphant'
    : hungerState === 'starving'
    ? 'stressed'
    : 'waving';

  // Active dialogue line
  const activeSpeechText =
    currentSpeech ||
    (isEatingAnimation
      ? 'Nom nom nom! ✨'
      : fullness >= 90
      ? QUOTES_FULL[Math.floor(Math.random() * QUOTES_FULL.length)]
      : availableTreats > 0
      ? `You have ${availableTreats} star treats ready for me! Click a snack below to feed me!`
      : QUOTES_HUNGRY[Math.floor(Math.random() * QUOTES_HUNGRY.length)]);

  // Fullness bar color gradient
  const getFullnessColor = () => {
    if (fullness >= 85) return 'from-[#9ED945] to-[#C4F46C]';
    if (fullness >= 55) return 'from-[#EAB308] to-[#FACC15]';
    if (fullness >= 25) return 'from-[#F97316] to-[#FB923C]';
    return 'from-[#EF4444] to-[#F87171]';
  };

  return (
    <div className="w-full bg-[#272E1E] border-4 border-[#4D583F] rounded-[2.5rem] p-5 sm:p-7 shadow-2xl text-white mb-8 animate-in fade-in transition-all">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3D4732]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C4F46C] text-[#1B2213] flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
            ⭐
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#3D4832] text-[#C4F46C] text-[11px] font-black uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3 h-3" /> Virtual Companion Care • Study To Feed
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Feed Starry Your Study Points</span>
              <span className="text-xs font-bold text-[#A2B68E] px-2.5 py-0.5 rounded-full bg-[#1A2014] border border-[#3E4A32]">
                {stageTitle}
              </span>
            </h2>
          </div>
        </div>

        {/* Available Treats Pouch Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3.5 py-2 rounded-2xl bg-[#1C2216] border border-[#485639] flex items-center gap-2.5 shadow-inner">
            <span className="text-xl">🌟</span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#A1B38F]">
                Treats in Pouch
              </div>
              <div className="text-base font-black text-[#C4F46C] leading-none">
                {availableTreats} <span className="text-xs text-[#E5EAD9]">Snacks</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-[#36402B] hover:bg-[#434E37] text-[#CEDBC0] cursor-pointer transition-colors"
            title={isExpanded ? 'Collapse Feeding Sanctuary' : 'Expand Feeding Sanctuary'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Main Stage: Starry in center with interactive speech bubble & floating crumbs */}
          <div className="p-6 rounded-3xl bg-[#1D2316] border-2 border-[#38432C] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Ambient starlight glow backdrop */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C4F46C]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left: Starry Mascot with live feeding reaction */}
            <div className="relative flex flex-col items-center shrink-0">
              {/* Floating treat text notification */}
              {floatingTreatText && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#C4F46C] text-[#1B2213] text-xs font-black px-3 py-1 rounded-full shadow-lg z-30 animate-bounce whitespace-nowrap">
                  {floatingTreatText}
                </div>
              )}

              {/* Starry */}
              <div
                onClick={() => {
                  if (availableTreats >= 5) {
                    handleFeed(SNACKS[0]);
                  }
                }}
                className="cursor-pointer group"
                title="Click Starry to feed a quick Star Biscuit!"
              >
                <StarryMascot mood={currentMood} size={150} className="drop-shadow-xl" />
              </div>

              {/* Companion Status Chip */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2E3723] text-xs font-bold text-[#CEDDC0] border border-[#4B593A]">
                <Heart className="w-3.5 h-3.5 text-[#FF7A70] fill-current animate-pulse" />
                <span>
                  {fullness >= 90
                    ? 'Radiantly Full & Supercharged!'
                    : fullness >= 60
                    ? 'Energized & Happy'
                    : fullness >= 30
                    ? 'A Bit Peckish'
                    : 'Starving for Study Points!'}
                </span>
              </div>
            </div>

            {/* Center & Right: Dialogue Bubble & Fullness Progression */}
            <div className="flex-1 space-y-4 z-10 w-full">
              {/* Starry's Speech Bubble */}
              <div className="p-4 rounded-2xl bg-[#2D3622] border-2 border-[#4C583B] text-white shadow-md relative">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#C4F46C] flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3" /> Starry Says:
                </div>
                <p className="text-sm sm:text-base font-extrabold text-[#F7F4EB] leading-relaxed">
                  &ldquo;{activeSpeechText}&rdquo;
                </p>
                {/* Bubble caret pointing left to Starry */}
                <div className="hidden md:block absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-[#2D3622]" />
              </div>

              {/* Fullness / Hunger Progress Bar */}
              <div className="p-4 rounded-2xl bg-[#171D12] border border-[#353F2B] space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="flex items-center gap-1.5 text-[#B6C9A2]">
                    <Cookie className="w-3.5 h-3.5 text-[#C4F46C]" />
                    <span>Star Fullness &amp; Energy</span>
                  </span>
                  <span className="text-[#C4F46C] text-sm font-black">{fullness}% Full</span>
                </div>

                <div className="w-full h-4 bg-[#232A1B] rounded-full overflow-hidden p-0.5 border border-[#3E4A31]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getFullnessColor()} transition-all duration-700 shadow-sm`}
                    style={{ width: `${Math.min(100, fullness)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8EA27A]">
                  <span>Total Snacks Fed: <strong>{totalTreatsFed} ⭐</strong></span>
                  <span>Companion Tier: <strong>Level {level}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Feeding Pantry / Snack Buttons */}
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-black text-[#A1B48E]">
              <span className="uppercase tracking-wider">Select a Study Snack to Feed Starry</span>
              {availableTreats > 0 && (
                <button
                  onClick={handleFeedAll}
                  className="px-3 py-1 rounded-full bg-[#C4F46C] hover:bg-[#b0e550] text-[#1B2213] text-[11px] font-black cursor-pointer shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                >
                  <Gift className="w-3 h-3" />
                  <span>Feed All Snacks ({availableTreats} ⭐)</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {SNACKS.map((snack) => {
                const canAfford = availableTreats >= snack.cost;

                return (
                  <div
                    key={snack.id}
                    className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                      canAfford
                        ? 'bg-[#2E3723] hover:bg-[#38432C] border-[#536342] hover:border-[#C4F46C] shadow-sm'
                        : 'bg-[#1F2518] border-[#37402D] opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="text-2xl p-2 rounded-2xl bg-[#1C2216] border border-[#445036] flex items-center justify-center">
                          {snack.icon}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#1C2216] text-[#C4F46C] text-[11px] font-black border border-[#485639]">
                          Cost: {snack.cost} ⭐
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-white">{snack.name}</h4>
                      <p className="text-[11px] text-[#A6BA93] mt-1 leading-relaxed">
                        {snack.description}
                      </p>
                      <div className="mt-2 text-[10px] font-extrabold text-[#C4F46C]">
                        +{snack.fullnessGain}% Star Energy
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => handleFeed(snack)}
                      className={`mt-4 w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-[#C4F46C] hover:bg-[#b2e556] text-[#192211] shadow-xs active:scale-95'
                          : 'bg-[#293020] text-[#718063] cursor-not-allowed border border-[#3E4732]'
                      }`}
                    >
                      <span>Feed {snack.name}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom helper actions to earn more treats */}
          <div className="p-3.5 rounded-2xl bg-[#1F2618] border border-[#38432C] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A1B48E]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C4F46C]" />
              <span>
                Earn <strong>+5 to +20 Star Snacks</strong> every time you answer diagnostic &amp; adaptive questions or lock in syllabus modules!
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {onEarnTreats && (
                <button
                  onClick={() => onEarnTreats(15)}
                  className="px-3 py-1.5 rounded-full bg-[#39452C] hover:bg-[#485738] text-[#C4F46C] text-[11px] font-bold cursor-pointer transition-colors border border-[#52623F]"
                  title="Simulate earning 15 study snacks"
                >
                  + Study Quiz (+15 Treats)
                </button>
              )}

              {onStartQuiz && (
                <button
                  onClick={onStartQuiz}
                  className="px-3.5 py-1.5 rounded-full bg-[#C4F46C] hover:bg-[#b2e556] text-[#192211] text-[11px] font-black cursor-pointer shadow-xs transition-transform active:scale-95"
                >
                  Start Practice Game →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
