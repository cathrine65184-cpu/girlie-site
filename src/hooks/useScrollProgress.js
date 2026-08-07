import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const lenisRef = useRef(null);

  const scrollToProgress = useCallback((nextProgress) => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const target = maxScroll * Math.max(0, Math.min(1, nextProgress));
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 1.25, force: true });
      return;
    }
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(motion.matches);
    updateMotion();
    motion.addEventListener('change', updateMotion);
    const lenis = new Lenis({ duration: 1.35, smoothWheel: !motion.matches, touchMultiplier: 1.15 });
    lenisRef.current = lenis;
    let frame = 0;
    const raf = (time) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);

    // ScrollTrigger controls the timeline lifecycle, while the browser's actual
    // scroll position is the source of truth. This avoids drift with Lenis on touch devices.
    let previousProgress = -1;
    const updateProgress = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const nextProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      if (Math.abs(nextProgress - previousProgress) > .001) {
        previousProgress = nextProgress;
        setProgress(nextProgress);
      }
    };
    const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: updateProgress, onRefresh: updateProgress });
    lenis.on('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    updateProgress();

    return () => {
      cancelAnimationFrame(frame);
      trigger.kill();
      lenis.off('scroll', updateProgress);
      lenis.destroy();
      lenisRef.current = null;
      window.removeEventListener('resize', updateProgress);
      motion.removeEventListener('change', updateMotion);
    };
  }, []);

  return { progress, reducedMotion, scrollToProgress };
}
