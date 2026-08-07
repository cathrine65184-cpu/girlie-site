import { Canvas } from '@react-three/fiber';
import { lazy, Suspense, useCallback, useState } from 'react';
import { CameraController } from './components/CameraController';
import { FloatingParticles } from './components/FloatingParticles';
import { Lighting } from './components/Lighting';
import { MemoryBloom } from './components/MemoryBloom';
import { Navigation } from './components/Navigation';
import { girls } from './data/girls';
import { GalleryExperience } from './components/GalleryExperience';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useStoryTransition } from './hooks/useStoryTransition';
import { Ending } from './scenes/Ending';
import { Journey } from './scenes/Journey';
import { Landing } from './scenes/Landing';

// Editorial sheets are loaded only when a visitor chooses to enter a memory.
const StoryOverlay = lazy(() => import('./components/StoryOverlay').then((module) => ({ default: module.StoryOverlay })));
const RoomOverlay = lazy(() => import('./components/RoomOverlay').then((module) => ({ default: module.RoomOverlay })));

const museumHalls = {
  studio: {
    title: 'Friendship Studio · Secret House',
    source: 'legacy.html#room',
    note: 'Private photos and video are intentionally not bundled into the public cinematic build.',
  },
};

function copyFor(progress) {
  if (progress < .1) return { eyebrow: 'A LIVING COLLECTION', title: 'Girlie Friendship Museum.', body: 'A garden museum keeping girls’ friendship stories from around the world — and making room for the next one.', action: 'Enter the collection', target: .12 };
  return { eyebrow: 'FIRST GALLERY · FRIENDSHIP ARCHIVE', title: 'Every friendship leaves a trace.', body: 'Walk slowly. Each flower is an entry in the collection, holding a city, a word, and a story.', action: 'Begin visiting', target: .35 };
}

export default function App() {
  const { progress, reducedMotion, scrollToProgress } = useScrollProgress();
  const { activeId, openStory, closeStory } = useStoryTransition();
  const [activeHall, setActiveHall] = useState(null);
  const activeGirl = girls.find((girl) => girl.id === activeId) || null;
  const copy = copyFor(progress);
  const copyOpacity = progress < .08 ? 1 : progress < .2 ? 1 - ((progress - .08) / .12) : 0;
  const myRoomUrl = `${import.meta.env.BASE_URL}legacy.html#room`;
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
        {progress > .70 && <Ending />}
        <CameraController progress={progress} activeGirl={activeGirl} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>

    <Navigation onJump={scrollToProgress} onOpenHall={openHall} studioHref={myRoomUrl} />

    <main className="scroll-track" aria-label="Girlie Project memory journey">
      <section className="journey-copy" style={{ opacity: copyOpacity, pointerEvents: copyOpacity > .04 ? 'auto' : 'none' }}>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <div className="hero-actions">
          <button className="journey-button" style={{ pointerEvents: copyOpacity > .04 ? 'auto' : 'none' }} onClick={() => scrollToProgress(copy.target)}>{copy.action} <span>↓</span></button>
          <a className="journey-button secondary" style={{ pointerEvents: copyOpacity > .04 ? 'auto' : 'none' }} href={myRoomUrl}>Build a Secret House <span>↗</span></a>
        </div>
      </section>
      <section className="path-instruction" style={{ opacity: progress > .1 && progress < .76 ? 1 : 0 }}>
        <span>Friendship Archive · Gallery one</span><b>Pause by a flower to enter a story</b>
      </section>
      <section className="ending-copy" style={{ opacity: progress > .76 ? 1 : 0, pointerEvents: progress > .76 ? 'auto' : 'none' }}>
        <p>A LIVING MUSEUM</p><h2>More friendship stories are always finding their way here.</h2>
        <p className="ending-body">Step into another gallery, or begin a room of your own with someone you love.</p>
        <div className="gallery-doors">
          <button onClick={() => openHall('language')}>Language Gallery</button>
          <button onClick={() => openHall('stars')}>Star Observatory</button>
          <button onClick={() => openHall('listening')}>Listening Room</button>
          <a className="studio-door" href={myRoomUrl}>Build a Secret House ↗</a>
        </div>
      </section>
    </main>

    <Suspense fallback={null}>
      <StoryOverlay girl={activeGirl} onClose={closeStory} onContinue={openNextStory} studioHref={myRoomUrl} />
      <GalleryExperience hall={activeHall} girls={girls} onClose={() => setActiveHall(null)} />
      {Object.entries(museumHalls).map(([id, hall]) => <RoomOverlay
        key={id}
        open={activeHall === id}
        onClose={() => setActiveHall(null)}
        title={hall.title}
        source={`${import.meta.env.BASE_URL}${hall.source}`}
        note={hall.note}
      />)}
    </Suspense>
  </div>;
}
