import { useRef, useState } from 'react';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { LocaleMenu, useLocale } from '../locales.jsx';
import { MemoryPhoto } from './GirlhoodGallery';

export function MemoryPackViewer({ pack, onClose, onFlower, onGirls, returnFocus }) {
  const { t, locale } = useLocale();
  const root = useRef(null);
  const [index, setIndex] = useState(0);
  const touchX = useRef(null);
  useDialogFocus(root, true, onClose, returnFocus);
  const go = (delta) => setIndex((value) => Math.max(0, Math.min(pack.photos.length - 1, value + delta)));
  const photo = pack.photos[index];
  return <section ref={root} className="memory-reader" role="dialog" aria-modal="true" aria-labelledby="pack-title" tabIndex={-1} data-lenis-prevent onKeyDown={(event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); go(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
  }}>
    <header className="memory-reader-nav"><button onClick={onClose}>← {t('photoBack')}</button><span className="memory-meta">GIRLIE / {pack.number}</span><LocaleMenu /></header>
    <div className="memory-reader-body">
      <div className="memory-sequence" onTouchStart={(event) => { touchX.current = event.touches[0].clientX; }} onTouchEnd={(event) => { if (touchX.current !== null) { const delta = touchX.current - event.changedTouches[0].clientX; if (Math.abs(delta) > 60) go(delta > 0 ? 1 : -1); } touchX.current = null; }}>
        <figure><MemoryPhoto key={photo.id} photo={photo} eager sizes="(max-width: 800px) 90vw, 62vw" /><figcaption aria-live="polite"><span>{String(index + 1).padStart(2, '0')} / {String(pack.photos.length).padStart(2, '0')}</span><span>{photo.description[locale]}</span></figcaption></figure>
        <div className="memory-sequence-controls"><button aria-label={t('photoPrevious')} disabled={index === 0} onClick={() => go(-1)}>←</button><div>{pack.photos.map((item, i) => <button key={item.id} aria-label={t('photoNumber', { number: i + 1 })} aria-current={i === index ? 'true' : undefined} onClick={() => setIndex(i)}>{String(i + 1).padStart(2, '0')}</button>)}</div><button aria-label={t('photoNext')} disabled={index === pack.photos.length - 1} onClick={() => go(1)}>→</button></div>
      </div>
      <article className="memory-pack-story"><p className="memory-meta">{t('photoChapter', { number: pack.number })}</p><h1 id="pack-title">{t(pack.titleKey)}</h1><h2>{t(pack.headingKey)}</h2><p>{t(pack.introKey)}</p><span className="memory-meta">{t(pack.moodKey)}</span><p className="memory-editorial-note">{t('photoEditorial')}</p><div className="memory-pack-next"><button className="memory-link" onClick={onGirls}>{t('photoMeetGirls')} ↗</button><button className="memory-link" onClick={onFlower}>{t('flowerCTA')} ↗</button></div></article>
    </div>
  </section>;
}
