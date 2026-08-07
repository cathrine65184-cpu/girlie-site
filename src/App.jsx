import { Canvas } from '@react-three/fiber';
import { lazy, Suspense, useCallback, useState } from 'react';
import { CameraController } from './components/CameraController';
import { FloatingParticles } from './components/FloatingParticles';
import { Lighting } from './components/Lighting';
import { MemoryBloom } from './components/MemoryBloom';
import { Navigation } from './components/Navigation';
import { girls } from './data/girls';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useStoryTransition } from './hooks/useStoryTransition';
import { Ending } from './scenes/Ending';
import { Journey } from './scenes/Journey';
import { Landing } from './scenes/Landing';

// Editorial sheets are loaded only when a visitor chooses to enter a memory.
const StoryOverlay = lazy(() => import('./components/StoryOverlay').then((module) => ({ default: module.StoryOverlay })));
const RoomOverlay = lazy(() => import('./components/RoomOverlay').then((module) => ({ default: module.RoomOverlay })));

function copyFor(progress, memories) {
  if (progress < .1) return { eyebrow: 'GIRLIE PROJECT', title: 'Every friendship begins somewhere.', body: 'Move slowly. The path is made from the moments girls keep for one another.', action: 'Begin the journey', target: .12 };
  if (progress < .72) return { eyebrow: 'FOLLOW THE FLOWERS', title: 'A path through girls’ memories.', body: 'Each flower holds a city, a word for best friend, and a story waiting to be met.', action: 'Meet a girl', target: .35 };
  return { eyebrow: 'MEMORY FIELD', title: memories ? `${memories} memory flowers are blooming.` : 'The first memory flower is waiting.', body: 'Every story you meet leaves a little more light in the world.', action: 'Return to the path', target: .1 };
}

export default function App() {
  const { progress, reducedMotion, scrollToProgress } = useScrollProgress();
  const { activeId, visited, openStory, closeStory } = useStoryTransition();
  const [roomOpen, setRoomOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const activeGirl = girls.find((girl) => girl.id === activeId) || null;
  const copy = copyFor(progress, visited.size);
  const copyOpacity = progress < .08 ? 1 : progress < .2 ? 1 - ((progress - .08) / .12) : 0;
  const openNextStory = useCallback(() => {
    const index = activeGirl ? girls.findIndex((girl) => girl.id === activeGirl.id) : -1;
    const next = girls[(index + 1) % girls.length];
    scrollToProgress(Math.min(.72, .12 + ((index + 2) / girls.length) * .58));
    window.setTimeout(() => openStory(next.id), reducedMotion ? 0 : 550);
  }, [activeGirl, openStory, reducedMotion]);

  return <div className="app-shell">
    <Canvas className="world-canvas" dpr={[1, 1.5]} shadows={!reducedMotion} camera={{ fov: 42, position: [0, 2.1, 14] }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#17172a']} />
      <fog attach="fog" args={['#17172a', 8, 47]} />
      <Suspense fallback={null}>
        <Lighting reducedMotion={reducedMotion} />
        <Landing />
        <Journey girls={girls} activeId={activeId} onOpen={openStory} reducedMotion={reducedMotion} progress={progress} />
        <FloatingParticles reducedMotion={reducedMotion} />
        {progress > .62 && <MemoryBloom count={visited.size} reducedMotion={reducedMotion} />}
        {progress > .70 && <Ending count={visited.size} />}
        <CameraController progress={progress} activeGirl={activeGirl} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>

    <Navigation onJump={scrollToProgress} onRoom={() => setRoomOpen(true)} onArchive={() => setArchiveOpen(true)} memories={visited.size} />

    <main className="scroll-track" aria-label="Girlie Project memory journey">
      <section className="journey-copy" style={{ opacity: copyOpacity, pointerEvents: copyOpacity > .04 ? 'auto' : 'none' }}>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <button className="journey-button" style={{ pointerEvents: copyOpacity > .04 ? 'auto' : 'none' }} onClick={() => scrollToProgress(copy.target)}>{copy.action} <span>↓</span></button>
      </section>
      <section className="path-instruction" style={{ opacity: progress > .1 && progress < .76 ? 1 : 0 }}>
        <span>Scroll to travel</span><b>Click a flower to enter her world</b>
      </section>
      <section className="ending-copy" style={{ opacity: progress > .76 ? 1 : 0, pointerEvents: progress > .76 ? 'auto' : 'none' }}>
        <p>THE WORLD GROWS WITH EVERY STORY</p><h2>{visited.size ? `${visited.size} memory flowers are blooming.` : 'There is always another flower ahead.'}</h2>
        <button className="journey-button" style={{ pointerEvents: progress > .76 ? 'auto' : 'none' }} onClick={() => scrollToProgress(.12)}>Walk the path again <span>↑</span></button>
      </section>
    </main>

    <Suspense fallback={null}>
      <StoryOverlay girl={activeGirl} onClose={closeStory} onContinue={openNextStory} />
      <RoomOverlay
        open={roomOpen}
        onClose={() => setRoomOpen(false)}
        source={`${import.meta.env.BASE_URL}legacy.html#room`}
        note="Private photos and video are intentionally not bundled into the public cinematic build."
      />
      <RoomOverlay
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title="Original Girlie Project collection"
        source={`${import.meta.env.BASE_URL}legacy.html#archive`}
        note="The full original collection remains available while its interactions are being woven into the new journey."
      />
    </Suspense>
  </div>;
}
