/**
 * Shared easing curves for premium, calm motion.
 * Inspired by Linear, Notion, and Arc Browser.
 */

export const easings = {
  /** Smooth deceleration — use for entrances, reveals */
  outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  /** Smooth acceleration + deceleration — use for panels, drawers */
  inOutExpo: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Quick exit — use for dismissals */
  inExpo: "cubic-bezier(0.7, 0, 0.84, 0)",
  /** Bouncy but controlled — use for small emphasis */
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const durations = {
  instant: "100ms",
  fast: "150ms",
  normal: "200ms",
  slow: "300ms",
} as const;

/** Shared Tailwind transition class fragments for common patterns */
export const motion = {
  /** For buttons and clickables */
  btn: `transition duration-[150ms] ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]`,
  /** For cards and panels that lift on hover */
  card: `transition duration-[200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]`,
  /** For icon buttons */
  icon: `transition duration-[150ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.08]`,
  /** For fade-in elements */
  fadeIn: `animate-fade-in`,
  /** For slide-in panels */
  panel: `transition-transform duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)]`,
} as const;
