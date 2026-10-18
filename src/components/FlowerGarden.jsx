import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Flower } from './Flower';
import { GenerativeFlowerSea } from './GenerativeFlowerSea';
import { MuseumCanvasBoundary } from './MuseumCanvasBoundary';
import { girls } from '../data/girls';
import { useLocale } from '../locales.jsx';

const centralScale = { lily: .7, soo: .82, emma: 1.28, anna: 1.16, yuki: 1.14 };

function GardenCamera({ progress, reducedMotion }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 1.05, 0));
  const desired = useMemo(() => {
    const sweep = reducedMotion ? 0 : Math.sin(progress * Math.PI * 1.35) * 1.4;
    return new THREE.Vector3(sweep, 4.25 + progress * 1.05, 9.75 - progress * 1.05);
  }, [progress, reducedMotion]);

  useFrame((_, delta) => {
    const easing = reducedMotion ? 1 : 1 - Math.exp(-delta * 2.1);
    camera.position.lerp(desired, easing);
    camera.lookAt(target.current);
  });
  return null;
}

function CentralStoryFlower({ girl, visible, reducedMotion, onOpen }) {
  const group = useRef();
  const displayPosition = useMemo(() => [0, -.08, 0], []);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const destination = visible ? 1 : .001;
    const easing = reducedMotion ? 1 : 1 - Math.exp(-delta * (visible ? 2.4 : 4.8));
    const next = THREE.MathUtils.lerp(group.current.scale.x, destination, easing);
    group.current.scale.setScalar(next);
    group.current.rotation.y = reducedMotion ? 0 : Math.sin(clock.elapsedTime * .18) * .055;
  });

  return <group ref={group} scale={.001}>
    <Flower
      girl={girl}
      opened={false}
      onOpen={onOpen}
      reducedMotion={reducedMotion}
      position={displayPosition}
      displayScale={centralScale[girl.id] || 1.08}
    />
  </group>;
}

function GardenScene({ activeGirl, visible, reducedMotion, progress, onOpen }) {
  return <>
    <hemisphereLight intensity={1.15} color="#ffeaf1" groundColor="#182039" />
    <ambientLight intensity={.52} color="#d8cced" />
    <directionalLight position={[-7, 12, 8]} intensity={2.2} color="#ffd4df" />
    <pointLight position={[0, 4.5, 2]} intensity={3.2} distance={13} color="#f6b7ca" />
    <pointLight position={[7, 2, -10]} intensity={1.6} distance={18} color="#ffe071" />
    <GenerativeFlowerSea reducedMotion={reducedMotion} />
    <CentralStoryFlower key={activeGirl.id} girl={activeGirl} visible={visible} reducedMotion={reducedMotion} onOpen={onOpen} />
    <GardenCamera progress={progress} reducedMotion={reducedMotion} />
  </>;
}

export function FlowerGarden({ paused, reducedMotion, progress, activeId, onOpen }) {
  const { t } = useLocale();
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, girls.findIndex((girl) => girl.id === activeId)));
  const [visible, setVisible] = useState(true);
  const transitionTimer = useRef(0);
  const activeGirl = girls[activeIndex];

  const rotate = useCallback((direction = 1) => {
    window.clearTimeout(transitionTimer.current);
    if (reducedMotion) {
      setActiveIndex((index) => (index + direction + girls.length) % girls.length);
      return;
    }
    setVisible(false);
    transitionTimer.current = window.setTimeout(() => {
      setActiveIndex((index) => (index + direction + girls.length) % girls.length);
      setVisible(true);
    }, 760);
  }, [reducedMotion]);

  useEffect(() => {
    if (paused || reducedMotion) return undefined;
    const interval = window.setInterval(() => rotate(1), 6500);
    return () => window.clearInterval(interval);
  }, [paused, reducedMotion, rotate]);

  useEffect(() => () => window.clearTimeout(transitionTimer.current), []);

  useEffect(() => {
    if (!reducedMotion) return;
    setActiveIndex(Math.round(progress * (girls.length - 1)));
  }, [progress, reducedMotion]);

  return <div className="generative-garden" data-active-story={activeGirl.id} data-story-index={activeIndex + 1}>
    <MuseumCanvasBoundary><Canvas
      className="world-canvas"
      frameloop={paused ? 'never' : 'always'}
      dpr={[1, 1.5]}
      shadows={false}
      camera={{ fov: 43, position: [0, 4.25, 9.75] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#171b2c']} />
      <fog attach="fog" args={['#171b2c', 13, 43]} />
      <Suspense fallback={null}>
        <GardenScene activeGirl={activeGirl} visible={visible} reducedMotion={reducedMotion} progress={progress} onOpen={onOpen} />
      </Suspense>
    </Canvas></MuseumCanvasBoundary>
    <p className="sr-only" aria-live="polite">{t('gardenRepresentative', { number: activeIndex + 1, name: activeGirl.n, city: activeGirl.city })}</p>
    <button className="sr-only garden-story-access" onClick={() => onOpen(activeGirl.id)} onKeyDown={(event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); rotate(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); rotate(-1); }
    }}>{t('gardenReadRepresentative', { name: activeGirl.n })}</button>
  </div>;
}
