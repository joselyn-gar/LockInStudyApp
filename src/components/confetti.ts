import confetti from 'canvas-confetti';

// Celebrates a topic crossing into "Mastered". Black, white and star tan only.
const COLORS = ['#111111', '#E3C8A2', '#FFFFFF', '#B5B5B5'];

export const triggerLockedInConfetti = () => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: COLORS,
    shapes: ['square', 'circle'],
  });
};
