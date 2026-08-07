import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

/** Slow light drift mimics a daydream rather than a game-light rig. */
export function Lighting({ reducedMotion }) {
  const light = useRef();
  useFrame(({ clock }) => {
    if (light.current && !reducedMotion) light.current.position.x = Math.sin(clock.elapsedTime * .07) * 4;
  });
  return <>
    <ambientLight intensity={1.22} color="#fff3f3" />
    <directionalLight ref={light} position={[3, 6, 5]} intensity={1.6} color="#ffd2c4" />
    <pointLight position={[-4, 2.5, -12]} intensity={2.4} distance={15} color="#f3b6d2" />
  </>;
}
