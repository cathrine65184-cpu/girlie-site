import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

/** Slow light drift mimics a daydream rather than a game-light rig. */
export function Lighting({ reducedMotion }) {
  const light = useRef();
  useFrame(({ clock }) => {
    if (light.current && !reducedMotion) light.current.position.x = Math.sin(clock.elapsedTime * .07) * 4;
  });
  return <>
    <hemisphereLight intensity={1.48} color="#fff7ef" groundColor="#bd7686" />
    <ambientLight intensity={.38} color="#fbe9ef" />
    <directionalLight ref={light} position={[-7, 11, 7]} intensity={2.35} color="#ffe0ba" />
    <pointLight position={[0, 5.2, -12]} intensity={1.8} distance={28} color="#fff0d2" />
    <pointLight position={[-7, 2.5, -10]} intensity={.9} distance={14} color="#eeb0d0" />
  </>;
}
