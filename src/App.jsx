import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { Navigation } from './components/Navigation';
import { DepthStoriesGallery } from './components/DepthStoriesGallery';
import { GirlhoodGallery } from './components/GirlhoodGallery';
import { MemoryPackViewer } from './components/MemoryPackViewer';
import { FriendshipFlower } from './components/FriendshipFlower';
import { girls } from './data/girls';
import { GalleryExperience } from './components/GalleryExperience';
import { RoomOverlay } from './components/RoomOverlay';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useStoryTransition } from './hooks/useStoryTransition';
import { useLocale } from './locales.jsx';

// Editorial sheets are loaded only when a visitor chooses to enter a memory.
const StoryOverlay = lazy(() => import('./components/StoryOverlay').then((module) => ({ default: module.StoryOverlay })));
const FriendshipInterview = lazy(() => import('./components/FriendshipInterview').then((module) => ({ default: module.FriendshipInterview })));
const FlowerGarden = lazy(() => import('./components/FlowerGarden').then((module) => ({ default: module.FlowerGarden })));

const museumHalls = {
  studio: { title: 'Private Girlie', source: 'legacy.html#private-house' },
};

export default function App() {
  const { t } = useLocale();
  const { activeId, openStory, closeStory } = useStoryTransition();
  const [activeHall, setActiveHall] = useState(() => window.location.hash === '#private-house' ? 'studio' : null);
  const galleryOpen = activeHall === 'archive';
  const [publicMode, setPublicMode] = useState('photos');
  const [activePack, setActivePack] = useState(null);
  const [flowerOpen, setFlowerOpen] = useState(false);
  const photoPosition = useRef(0);
  const packReturnFocus = useRef(null);
  const flowerReturnFocus = useRef(null);
  const openPack = (pack) => { packReturnFocus.current = document.activeElement; setActivePack(pack); };
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryDestination, setGalleryDestination] = useState(null);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [interviewIntent, setInterviewIntent] = useState(false);
  const [interviewSeed, setInterviewSeed] = useState([]);
  const [pendingArchive, setPendingArchive] = useState(null);
  const [pendingFriendshipDate, setPendingFriendshipDate] = useState(null);
  const overlayOpen = Boolean(activeHall || activeId || activePack || flowerOpen || interviewOpen);
  const { progress, reducedMotion, scrollToProgress } = useScrollProgress(overlayOpen);
  const activeGirl = girls.find((girl) => girl.id === activeId) || null;
  const beginInterview = (seed = []) => { setInterviewSeed(seed); setInterviewIntent(false); setInterviewOpen(true); };
  // A private room is the source of truth for an interview. Its existing
  // login and shared-room backend keep the resulting memories private.
  const requestInterview = (seed = []) => {
    setInterviewSeed(seed);
    setInterviewIntent(true);
    setActiveHall('studio');
  };
  const archiveInterview = async (archive) => {
    setPendingArchive(archive);
    setInterviewOpen(false);
    setActiveHall('studio');
  };
  const handleRoomMessage = (message) => {
    if (message?.type === 'girlie:open-interview') beginInterview(message.seed || []);
    if (message?.type === 'girlie:interview-synced' && message.archiveId === pendingArchive?.id) setPendingArchive(null);
    if (message?.type === 'girlie:friendship-date-saved' && message.date === pendingFriendshipDate) setPendingFriendshipDate(null);
  };
  const openHall = (hall) => {
    if (hall === 'archive') setGalleryDestination(null);
    setActiveHall(hall);
  };
  const showPhotos = (section) => {
    setPublicMode('photos');
    requestAnimationFrame(() => {
      if (section) document.getElementById(section)?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
      else window.scrollTo(0, photoPosition.current);
    });
  };
  const showGarden = () => {
    if (publicMode === 'photos') photoPosition.current = window.scrollY;
    setPublicMode('garden');
    requestAnimationFrame(() => window.scrollTo(0, 0));
  };
  const showFlower = () => {
    flowerReturnFocus.current = activePack ? packReturnFocus.current : activeHall ? document.querySelector('.girlhood-nav .girlhood-brand-logo') : document.activeElement;
    closeStory(); setActiveHall(null); setActivePack(null); setFlowerOpen(true);
  };
  const openNextStory = useCallback(() => {
    const index = activeGirl ? girls.findIndex((girl) => girl.id === activeGirl.id) : -1;
    if (galleryOpen) {
      setGalleryDestination({ index: (index + 1) % girls.length });
      return;
    }
    const next = girls[(index + 1) % girls.length];
    scrollToProgress(Math.min(.72, .12 + ((index + 2) / girls.length) * .58));
    window.setTimeout(() => openStory(next.id), reducedMotion ? 0 : 550);
  }, [activeGirl, galleryOpen, openStory, reducedMotion, scrollToProgress]);

  return <div className="app-shell">
    <div className="museum-surface" inert={overlayOpen ? '' : undefined} aria-hidden={overlayOpen || undefined}>
    <Navigation onHome={() => showPhotos('girlhood-home')} onStories={() => showPhotos('girlhood-moments')} onGarden={showGarden} onOpenHall={openHall} onCreate={() => requestInterview()} onOpenPrivateRoom={() => setActiveHall('studio')} />
    {publicMode === 'photos' ? <GirlhoodGallery reducedMotion={reducedMotion} onOpenPack={openPack} onGirls={() => openHall('archive')} onGarden={showGarden} onFlower={showFlower} /> : <>
    <Suspense fallback={null}><FlowerGarden paused={overlayOpen} reducedMotion={reducedMotion} progress={progress} activeId={activeId} activeGirl={activeGirl} onOpen={openStory} /></Suspense>
    <button className="garden-back-link" onClick={() => showPhotos()}>← {t('photoBack')}</button>
    <main className="scroll-track garden-scroll-track" aria-label={t('photoGarden')} /></>}
    </div>

    {activePack && <MemoryPackViewer key={activePack.id} pack={activePack} returnFocus={packReturnFocus.current} onClose={() => setActivePack(null)} onFlower={showFlower} onGirls={() => { setActivePack(null); openHall('archive'); }} />}
    <FriendshipFlower open={flowerOpen} returnFocus={flowerReturnFocus.current} onClose={() => setFlowerOpen(false)} onPrivate={() => { setFlowerOpen(false); setActiveHall('studio'); }} onInterview={() => { setFlowerOpen(false); requestInterview(); }} />
    {galleryOpen && <DepthStoriesGallery backLabel={t(publicMode === 'photos' ? 'photoBack' : 'depthBack')} girls={girls} initialIndex={galleryIndex} destination={galleryDestination} paused={Boolean(activeGirl)} reducedMotion={reducedMotion} onOpenStory={openStory} onActiveChange={setGalleryIndex} onClose={() => setActiveHall(null)} />}

    <Suspense fallback={null}>
      <StoryOverlay girl={activeGirl} onClose={closeStory} onContinue={openNextStory} onDiscoverFlower={showFlower} onStartInterview={() => { setActiveHall(null); requestInterview(); }} />
      <GalleryExperience hall={activeHall} girls={girls} onClose={() => setActiveHall(null)} />
      <FriendshipInterview open={interviewOpen} onClose={() => setInterviewOpen(false)} onArchived={archiveInterview} onConfirmFriendshipStart={setPendingFriendshipDate} seed={interviewSeed} />
      <RoomOverlay
        open={activeHall === 'studio'}
        title={museumHalls.studio.title}
        source={museumHalls.studio.source}
        startInterview={interviewIntent}
        incomingArchive={pendingArchive}
        incomingFriendshipDate={pendingFriendshipDate}
        onMessage={handleRoomMessage}
        onClose={() => { setActiveHall(null); if (window.location.hash === '#private-house') window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`); }}
      />
    </Suspense>
  </div>;
}
