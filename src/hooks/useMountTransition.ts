import { useEffect, useRef, useState } from "react";

/**
 * Manages mount/unmount animations for modals, panels, and overlays.
 *
 * Usage:
 *   const { mounted, animatingIn } = useMountTransition(open, 200);
 *   if (!mounted) return null;
 *   // use animatingIn to toggle CSS classes
 */
export function useMountTransition(
  isOpen: boolean,
  animationDuration: number = 200,
) {
  const [mounted, setMounted] = useState(false);
  const [animatingIn, setAnimatingIn] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Trigger animation on next frame after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimatingIn(true);
        });
      });
    } else if (mounted) {
      setAnimatingIn(false);
      timerRef.current = setTimeout(() => {
        setMounted(false);
      }, animationDuration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, animationDuration]);

  return { mounted, animatingIn };
}
