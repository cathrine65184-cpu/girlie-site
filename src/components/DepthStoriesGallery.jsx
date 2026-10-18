import { useCallback, useEffect, useRef, useState } from 'react';
import { LocaleMenu, useLocale } from '../locales.jsx';
import { getStoryExhibit } from '../data/storyExhibits';
import { getStoryExhibitZh } from '../data/storyExhibitsZh';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { clamp, depthAtmospheres, galleryStep, mixColor, portraitPose } from '../lib/depthGallery';
import './DepthStoriesGallery.css';

/** A native-scroll, CSS-perspective gallery: no extra canvas or WebGL loop. */
export function DepthStoriesGallery({ girls, initialIndex = 0, destination, paused, reducedMotion, onOpenStory, onActiveChange, onClose, backLabel }) {
  const { locale, t } = useLocale();
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const planes = useRef([]);
  const current = useRef(initialIndex);
  const suspendedPosition = useRef(null);
  const activeRef = useRef(initialIndex);
  const reportRef = useRef(onActiveChange);
  reportRef.current = onActiveChange;
  const [active, setActive] = useState(initialIndex);
  const [failedImages, setFailedImages] = useState({});
  useDialogFocus(rootRef, !paused, onClose);

  const goTo = useCallback((index) => {
    const scroller = scrollRef.current;
    suspendedPosition.current = null;
    scroller.scrollTo({ top: clamp(index, 0, girls.length - 1) * galleryStep(scroller.clientHeight), behavior: 'instant' });
  }, [girls.length]);

  useEffect(() => { goTo(initialIndex); }, []);
  useEffect(() => { if (destination) goTo(destination.index); }, [destination, goTo]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (paused) {
      suspendedPosition.current ??= scroller.scrollTop / galleryStep(scroller.clientHeight);
      return undefined;
    }
    // Rotation/resizing while reading must not change the girl's position.
    if (suspendedPosition.current !== null) {
      scroller.scrollTop = suspendedPosition.current * galleryStep(scroller.clientHeight);
      suspendedPosition.current = null;
    }
    const root = rootRef.current;
    let height = scroller.clientHeight;
    let frame = 0;
    let lastTime = 0;
    let velocity = 0;
    const draw = (time) => {
      frame = 0;
      const elapsed = Math.min(50, time - (lastTime || time - 16.67));
      lastTime = time;
      const target = clamp(scroller.scrollTop / galleryStep(height), 0, girls.length - 1);
      const previous = current.current;
      current.current = reducedMotion ? target : previous + (target - previous) * (1 - Math.exp(-elapsed / 135));
      if (Math.abs(target - current.current) < .0005) current.current = target;
      velocity += (clamp((current.current - previous) * 1000 / Math.max(1, elapsed), -3, 3) - velocity) * .16;
      const position = current.current;
      planes.current.forEach((plane, index) => {
        if (!plane) return;
        const pose = portraitPose(index, position, velocity, reducedMotion);
        plane.style.transform = pose.transform;
        plane.style.opacity = pose.opacity;
        plane.style.visibility = pose.opacity > 0 ? 'visible' : 'hidden';
      });
      const lower = Math.floor(position);
      const upper = Math.min(girls.length - 1, lower + 1);
      const from = depthAtmospheres[girls[lower].id];
      const to = depthAtmospheres[girls[upper].id];
      root.style.setProperty('--depth-bg', mixColor(from[0], to[0], position - lower));
      root.style.setProperty('--depth-accent', mixColor(from[1], to[1], position - lower));
      root.style.setProperty('--depth-progress', position / (girls.length - 1));
      const nextActive = Math.round(position);
      if (activeRef.current !== nextActive) {
        activeRef.current = nextActive;
        setActive(nextActive);
        reportRef.current?.(nextActive);
      }
      // Sleep when settled; no permanent animation loop behind the story.
      if (current.current !== target || Math.abs(velocity) > .005) frame = requestAnimationFrame(draw);
      else lastTime = 0;
    };
    const wake = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const resize = new ResizeObserver(() => {
      const position = scroller.scrollTop / galleryStep(height);
      height = scroller.clientHeight;
      scroller.scrollTop = position * galleryStep(height);
      wake();
    });
    resize.observe(scroller);
    scroller.addEventListener('scroll', wake, { passive: true });
    wake();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); scroller.removeEventListener('scroll', wake); };
  }, [girls, paused, reducedMotion]);

  const onKeyDown = (event) => {
    if (paused || event.target.closest('select, input, textarea')) return;
    const direction = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1 }[event.key];
    if (direction || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const target = Math.round(scrollRef.current.scrollTop / galleryStep(scrollRef.current.clientHeight));
      goTo(event.key === 'Home' ? 0 : event.key === 'End' ? girls.length - 1 : target + direction);
    }
  };
  const girl = girls[active];
  const exhibit = locale === 'zh' ? getStoryExhibitZh(girl) : getStoryExhibit(girl);
  const number = String(active + 1).padStart(2, '0');

  const parallax = (event) => {
    if (reducedMotion || paused || event.pointerType !== 'mouse') return;
    rootRef.current.style.setProperty('--depth-pointer-x', `${(event.clientX / window.innerWidth - .5) * 10}px`);
    rootRef.current.style.setProperty('--depth-pointer-y', `${(event.clientY / window.innerHeight - .5) * 6}px`);
  };
  return <section ref={rootRef} className={`depth-gallery${reducedMotion ? ' depth-gallery--still' : ''}`} role="dialog" aria-modal={!paused || undefined} aria-labelledby="depth-title" aria-hidden={paused || undefined} inert={paused ? '' : undefined} tabIndex={-1} data-lenis-prevent onKeyDown={onKeyDown} onPointerMove={parallax}>
    <header className="depth-header">
      <button className="depth-back" onClick={onClose}>← {backLabel || t('depthBack')}</button>
      <h1 id="depth-title">{t('friendshipArchive')}</h1>
      <LocaleMenu />
    </header>
    <div ref={scrollRef} className="depth-scroll" tabIndex={-1}>
      <div className="depth-runway" style={{ height: `${100 + (girls.length - 1) * 85}%` }}>
        <div className="depth-stage">
          <div className="depth-perspective" aria-hidden="true">
            {girls.map((item, index) => <figure key={item.id} ref={(node) => { planes.current[index] = node; }} className="depth-portrait" data-girl={item.id}>
              {failedImages[item.id] ? <div className="depth-image-fallback">{item.e}<span>{item.n}</span></div> : <img src={item.img} alt="" draggable="false" loading={Math.abs(index - active) <= 2 ? 'eager' : 'lazy'} onError={() => setFailedImages((old) => ({ ...old, [item.id]: true }))} />}
              <figcaption><span>{String(index + 1).padStart(2, '0')} / {String(girls.length).padStart(2, '0')}</span><span>{item.n} · {item.city}</span></figcaption>
            </figure>)}
          </div>
          <div className="depth-editorial">
            <p className="depth-kicker">{t('depthCollection')}</p>
            <div className="depth-caption" key={`${girl.id}-${locale}`}>
              <p className="depth-catalogue">{t('depthArchive', { number })} <span>— {girl.city}</span></p>
              <h2>{girl.n}</h2>
              <blockquote>{exhibit.quote}</blockquote>
            </div>
            <button className="depth-read" onClick={() => onOpenStory(girl.id)}>{t('depthRead')} <span aria-hidden="true">↗</span></button>
          </div>
        </div>
      </div>
    </div>
    <footer className="depth-footer">
      <p className="depth-hint">{t(reducedMotion ? 'depthStillHint' : 'depthHint')}</p>
      <div className="depth-controls">
        <button disabled={active === 0} onClick={() => goTo(active - 1)} aria-label={t('depthPrevious')}>←</button>
        <p aria-live="polite" aria-atomic="true"><span className="sr-only">{girl.n} · </span>{number}<span> / {String(girls.length).padStart(2, '0')}</span></p>
        <button disabled={active === girls.length - 1} onClick={() => goTo(active + 1)} aria-label={t('depthNext')}>→</button>
      </div>
    </footer>
    <div className="depth-progress" aria-hidden="true" />
  </section>;
}
