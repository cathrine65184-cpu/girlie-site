import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { memoryPacks } from '../data/memoryPacks';
import { useLocale } from '../locales.jsx';
import '../girlhood.css';

export function MemoryPhoto({ photo, eager = false, sizes = '(max-width: 700px) 92vw, 60vw' }) {
  const { locale, t } = useLocale();
  const [failed, setFailed] = useState(false);
  return failed ? <div className="memory-image-fallback" role="img" aria-label={photo.alt[locale]} style={{ aspectRatio: photo.ratio }}><p>{t('photoUnavailable')}</p><small>{photo.alt[locale]}</small></div>
    : <img className="memory-photo" src={photo.image} srcSet={`${photo.smallImage} 640w, ${photo.image} 1280w`} sizes={sizes} alt={photo.alt[locale]} width={1280} height={Math.round(1280 / photo.ratio)} loading={eager ? 'eager' : 'lazy'} fetchpriority={eager ? 'high' : 'auto'} decoding="async" onError={() => setFailed(true)} />;
}

function MemoryChapter({ pack, onOpen, reducedMotion }) {
  const { t } = useLocale();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [25, -25]);
  const secondY = useTransform(scrollYProgress, [0, 1], [45, -30]);
  return <section ref={ref} className={`memory-chapter memory-chapter-${pack.number}`} style={{ '--chapter-tone': pack.color }} aria-labelledby={`chapter-${pack.id}`}>
    <div className="memory-chapter-heading"><span className="memory-meta">{t('photoChapter', { number: pack.number })}</span><h2 id={`chapter-${pack.id}`}>{t(pack.titleKey)}</h2><span className="memory-meta">{t(pack.moodKey)}</span></div>
    <div className="memory-composition">
      <motion.figure className="memory-print memory-print-main" style={{ y: reducedMotion ? 0 : y }}>
        <button className="memory-photo-button" onClick={() => onOpen(pack)} aria-label={`${t('photoPack')} — ${t(pack.titleKey)}`}><MemoryPhoto photo={pack.photos[0]} /></button>
        <figcaption><span>{pack.number} / 01</span><span>{t(pack.headingKey)}</span></figcaption>
      </motion.figure>
      <motion.figure className="memory-print memory-print-small" style={{ y: reducedMotion ? 0 : secondY }}>
        <MemoryPhoto photo={pack.photos[1]} sizes="(max-width: 700px) 48vw, 26vw" />
        <figcaption>{pack.number} / 02</figcaption>
      </motion.figure>
    </div>
    <div className="memory-chapter-after"><p>{t(pack.introKey)}</p><button className="memory-link" onClick={() => onOpen(pack)}>{t('photoPack')} <span aria-hidden="true">↗</span></button><small className="memory-meta">{t('photoCount', { count: pack.photos.length })}</small></div>
  </section>;
}

export function GirlhoodGallery({ onOpenPack, onGirls, onGarden, onFlower, reducedMotion }) {
  const { t } = useLocale();
  return <main className="girlhood-world" id="girlhood-home">
    <section className="girlhood-hero" aria-labelledby="girlhood-title">
      <div className="girlhood-hero-copy"><p className="memory-meta">{t('photoEyebrow')}</p><h1 id="girlhood-title">{t('photoTitle')}</h1><p className="girlhood-intro">{t('photoIntro')}</p><div className="girlhood-hero-actions"><a className="memory-link" href="#girlhood-moments">{t('photoEnter')} <span aria-hidden="true">↓</span></a><button className="garden-text-link" onClick={onGarden}>{t('photoGardenEnter')} <span aria-hidden="true">↗</span></button></div></div>
      <figure className="girlhood-hero-print"><MemoryPhoto photo={memoryPacks[0].photos[0]} eager sizes="(max-width: 700px) 90vw, 44vw" /><figcaption><span>GIRLIE / 001</span><span>{t('photoHome')}</span></figcaption></figure>
      <div className="girlhood-hero-bottom"><span className="memory-meta">{t('photoScroll')}</span><span aria-hidden="true">↓</span></div>
    </section>
    <section className="girlhood-exhibition-intro" id="girlhood-moments"><p className="memory-meta">{t('photoCollection')}</p><h2>{t('photoWorldTitle')}</h2><p>{t('photoWorldBody')}</p></section>
    {memoryPacks.map((pack) => <MemoryChapter key={pack.id} pack={pack} onOpen={onOpenPack} reducedMotion={reducedMotion} />)}
    <section className="girlhood-originals" id="the-girls"><div className="original-archive-mark" aria-hidden="true">100+<span>11 SELECTED · GIRLIE</span></div><div><p className="memory-meta">{t('photoGirlsLabel')}</p><h2>{t('photoGirlsTitle')}</h2><p>{t('photoGirlsBody')}</p><button className="memory-link" onClick={onGirls}>{t('photoMeetGirls')} <span aria-hidden="true">↗</span></button><p className="garden-invitation">{t('photoGardenHint')} <button onClick={onGarden}>{t('photoGarden')} ↗</button></p></div></section>
    <section className="girlhood-flower-invitation"><img className="girlie-fairy-logo" src="images/brand/girlie-fairy-logo.jpg" alt="Girlie" width="1254" height="1254" loading="lazy" decoding="async" /><p className="memory-meta">GIRLIE / {t('you')}</p><h2>{t('flowerTitle')}</h2><p>{t('flowerIntro')}</p><button className="memory-link" onClick={onFlower}>{t('flowerCTA')} <span aria-hidden="true">↗</span></button></section>
    <footer className="girlhood-footer"><a href="#girlhood-home" className="girlhood-wordmark">Girlie</a><span>{t('photoFooter')}</span><small>{t('photoPublic')}</small></footer>
  </main>;
}
