import { Canvas } from '@react-three/fiber';
import { lazy, Suspense, useCallback, useState } from 'react';
import { CameraController } from './components/CameraController';
import { FloatingParticles } from './components/FloatingParticles';
import { Lighting } from './components/Lighting';
import { MemoryBloom } from './components/MemoryBloom';
import { Navigation } from './components/Navigation';
import { girls } from './data/girls';
import { GalleryExperience } from './components/GalleryExperience';
import { usePrivateArchive } from './hooks/usePrivateArchive';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useStoryTransition } from './hooks/useStoryTransition';
import { Journey } from './scenes/Journey';
import { Landing } from './scenes/Landing';
import { useLocale } from './locales.jsx';

// Editorial sheets are loaded only when a visitor chooses to enter a memory.
const StoryOverlay = lazy(() => import('./components/StoryOverlay').then((module) => ({ default: module.StoryOverlay })));
const FriendshipInterview = lazy(() => import('./components/FriendshipInterview').then((module) => ({ default: module.FriendshipInterview })));
const PrivateRoom = lazy(() => import('./components/PrivateRoom').then((module) => ({ default: module.PrivateRoom })));

export default function App() {
  const { t } = useLocale();
  const { progress, reducedMotion, scrollToProgress } = useScrollProgress();
  const { activeId, openStory, closeStory } = useStoryTransition();
  const [activeHall, setActiveHall] = useState(null);
  const [interviewOpen, setInterviewOpen] = useState(false);
  // Retain the former deep link while rendering the current Private Girlie,
  // rather than sending visitors to a second, competing private-room UI.
  const [privateRoomOpen, setPrivateRoomOpen] = useState(() => window.location.hash === '#private-house');
  const [interviewSeed, setInterviewSeed] = useState([]);
  const privateArchive = usePrivateArchive();
  const activeGirl = girls.find((girl) => girl.id === activeId) || null;
  const copy = progress < .1 ? { eyebrow: t('landingEyebrow'), title: t('landingTitle'), body: t('landingBody'), action: t('exploreMuseum'), target: .12 } : { eyebrow: t('archiveEyebrow'), title: t('archiveTitle'), body: t('archiveBody'), action: t('beginVisiting'), target: .35 };
  // The entrance copy clears before the first exhibit becomes interactive.
  // This keeps the opening invitation editorial without sitting over a flower label.
  const copyOpacity = progress < .052 ? 1 : progress < .097 ? 1 - ((progress - .052) / .045) : 0;
  const beginInterview = (seed = []) => { setInterviewSeed(seed); setPrivateRoomOpen(false); setInterviewOpen(true); };
  // A first story can begin immediately. Until an account is connected it stays
  // in this browser; it is never made public or added to the museum.
  const requestInterview = (seed = []) => {
    beginInterview(seed);
  };
  const archiveInterview = async (archive) => { await privateArchive.save(archive); setInterviewOpen(false); setPrivateRoomOpen(true); };
  const openHall = (hall) => {
    if (hall === 'archive') {
      scrollToProgress(.35);
      return;
    }
    setActiveHall(hall);
  };
  const openNextStory = useCallback(() => {
    const index = activeGirl ? girls.findIndex((girl) => girl.id === activeGirl.id) : -1;
    const next = girls[(index + 1) % girls.length];
    scrollToProgress(Math.min(.72, .12 + ((index + 2) / girls.length) * .58));
    window.setTimeout(() => openStory(next.id), reducedMotion ? 0 : 550);
  }, [activeGirl, openStory, reducedMotion]);

  return <div className="app-shell">
    <Canvas className="world-canvas" dpr={[1, 1.5]} shadows={!reducedMotion} camera={{ fov: 42, position: [0, 2.1, 14] }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#f8e5e8']} />
      <fog attach="fog" args={['#f8e5e8', 8, 47]} />
      <Suspense fallback={null}>
        <Lighting reducedMotion={reducedMotion} />
        <Landing />
        <Journey girls={girls} activeId={activeId} onOpen={openStory} reducedMotion={reducedMotion} progress={progress} />
        <FloatingParticles reducedMotion={reducedMotion} />
        {progress > .62 && <MemoryBloom reducedMotion={reducedMotion} />}
        <CameraController progress={progress} activeGirl={activeGirl} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>

    <Navigation onJump={scrollToProgress} onOpenHall={openHall} onCreate={() => requestInterview()} onOpenPrivateRoom={() => setPrivateRoomOpen(true)} />

    <main className="scroll-track" aria-label={t('storyJourney')}>
      <section className="journey-copy" style={{ opacity: copyOpacity, pointerEvents: copyOpacity > .04 ? 'auto' : 'none' }}>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <div className="hero-actions">
          <button className="journey-button hero-museum-button" style={{ pointerEvents: copyOpacity > .04 ? 'auto' : 'none' }} onClick={() => scrollToProgress(copy.target)}><strong>{copy.action} <span>↓</span></strong>{progress < .1 && <small>{t('exploreMuseumDesc')}</small>}</button>
          <button className="journey-button create-archive-button" style={{ pointerEvents: copyOpacity > .04 ? 'auto' : 'none' }} onClick={() => requestInterview()}><i>{t('tellStory')}</i><strong>{t('tellFriendship')} <span>↗</span></strong>{progress < .1 && <small>{t('tellFriendshipDesc')}</small>}</button>
        </div>
      </section>
      <section className="how-girlie-works" aria-label={t('howWorksTitle')}>
        <div className="how-girlie-heading"><p>{t('storyBridge')}</p><h2>{t('howWorksTitle')}</h2></div>
        <div className="how-girlie-steps">
          <article><p>{t('howExploreNumber')}</p><h3>{t('howExploreTitle')}</h3><span>{t('howExploreBody')}</span><button onClick={() => scrollToProgress(.12)}>{t('exploreMuseum')} <b>↓</b></button></article>
          <article><p>{t('howTalkNumber')}</p><h3>{t('howTalkTitle')}</h3><span>{t('howTalkBody')}</span><button onClick={() => requestInterview()}>{t('startInterview')} <b>↗</b></button></article>
          <article><p>{t('howRememberNumber')}</p><h3>{t('howRememberTitle')}</h3><span>{t('howRememberBody')}</span><button onClick={() => setPrivateRoomOpen(true)}>{t('enterPrivateGirlie')} <b>→</b></button></article>
        </div>
        <div className="public-private-clarity">
          <article><i>🌎</i><p>{t('publicGirlie')}</p><h3>{t('publicMuseumTitle')}</h3><span>{t('publicMuseumBody')}</span></article>
          <b aria-hidden="true">→</b>
          <article><i>🏠</i><p>{t('privateGirlieLabel')}</p><h3>{t('privateHomeTitle')}</h3><span>{t('privateHomeBody')}</span></article>
        </div>
      </section>
      <section className="path-instruction" style={{ opacity: progress > .1 && progress < .76 ? 1 : 0 }}>
        <span>{t('scrollArchive')}</span><b>{t('scrollPrompt')}</b>
      </section>
      <section className="ending-copy" style={{ opacity: progress > .76 ? 1 : 0, pointerEvents: progress > .76 ? 'auto' : 'none' }}>
        <p>{t('endingEyebrow')}</p><h2>{t('endingTitle')}</h2>
        <p className="ending-body">{t('endingBody')}</p>
        <div className="gallery-doors">
          <button onClick={() => openHall('language')}>{t('languageGallery')}</button>
          <button onClick={() => openHall('stars')}>{t('starObservatory')}</button>
          <button onClick={() => openHall('listening')}>{t('listeningRoom')}</button>
          <button className="studio-door" onClick={() => requestInterview()}>{t('tellStory')} ↗</button>
        </div>
      </section>
    </main>

    <Suspense fallback={null}>
      <StoryOverlay girl={activeGirl} onClose={closeStory} onContinue={openNextStory} onStartInterview={() => requestInterview()} />
      <GalleryExperience hall={activeHall} girls={girls} onClose={() => setActiveHall(null)} />
      <FriendshipInterview open={interviewOpen} onClose={() => setInterviewOpen(false)} onArchived={archiveInterview} seed={interviewSeed} />
      <PrivateRoom open={privateRoomOpen} onClose={() => { setPrivateRoomOpen(false); if (window.location.hash === '#private-house') window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`); }} store={privateArchive} onStartInterview={requestInterview} />
    </Suspense>
  </div>;
}
