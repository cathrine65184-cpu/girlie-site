import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

/** Slow light drift mimics a daydream rather than a game-light rig. */
export function Lighting({ reducedMotion }) {
  const light = useRef();
  useFrame(({ clock }) => {
    if (light.current && !reducedMotion) light.current.position.x = Math.sin(clock.elapsedTime * .07) * 4;
  });
  return <>
    <ambientLight intensity={1.05} color="#ffe8f1" />
    <directionalLight ref={light} position={[3, 6, 5]} intensity={1.45} color="#ffd4a8" />
    <pointLight position={[-4, 2.5, -12]} intensity={2.1} distance={15} color="#d7b7ff" />
  </>;
}
