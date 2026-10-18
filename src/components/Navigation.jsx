import { useEffect, useRef, useState } from 'react';
import { LocaleMenu, useLocale } from '../locales.jsx';

/** One quiet header; the original collections remain in the menu. */
export function Navigation({ onHome, onStories, onGarden, onOpenHall, onCreate, onOpenPrivateRoom }) {
  const [expanded, setExpanded] = useState(false);
  const root = useRef(null);
  const toggle = useRef(null);
  const { t } = useLocale();
  useEffect(() => {
    if (!expanded) return undefined;
    const outside = (event) => { if (!root.current?.contains(event.target)) setExpanded(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [expanded]);
  const choose = (action) => { setExpanded(false); action(); };
  return <header ref={root} className="girlhood-nav" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false); }} onKeyDown={(event) => { if (event.key === 'Escape' && expanded) { event.stopPropagation(); setExpanded(false); toggle.current?.focus(); } }}>
    <button className="girlhood-brand-logo" aria-label="Girlie" onClick={() => choose(onHome)}><img src="images/brand/girlie-fairy-logo.jpg" alt="" width="1254" height="1254" /></button>
    <nav aria-label={t('museumCollections')}><button className="girlhood-nav-stories" onClick={() => choose(onStories)}>{t('photoNav')}</button><button className="girlhood-nav-garden" onClick={() => choose(onGarden)}><span aria-hidden="true">✿</span> {t('photoGarden')}</button><button className="girlhood-nav-private" onClick={() => choose(onOpenPrivateRoom)}>{t('privateGirlie')} <span aria-hidden="true">↗</span></button><LocaleMenu /><button ref={toggle} aria-expanded={expanded} aria-controls="girlhood-menu" onClick={() => setExpanded(!expanded)}>{t('halls')} <span aria-hidden="true">{expanded ? '−' : '+'}</span></button></nav>
    {expanded && <div className="girlhood-menu" id="girlhood-menu"><button onClick={() => choose(onGarden)}>{t('photoGarden')}</button><button onClick={() => choose(() => onOpenHall('archive'))}>{t('photoMeetGirls')}</button><button onClick={() => choose(onCreate)}>{t('tellStory')}</button><button onClick={() => choose(onOpenPrivateRoom)}>{t('privateGirlie')}</button>{[['language', 'languageGallery'], ['stars', 'starObservatory'], ['listening', 'listeningRoom']].map(([hall, label]) => <button key={hall} onClick={() => choose(() => onOpenHall(hall))}>{t(label)}</button>)}</div>}
  </header>;
}
