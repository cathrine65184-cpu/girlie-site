import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useCameraPath } from '../hooks/useCameraPath';

/** Smoothly turns scroll position into a film-like camera dolly. */
export function CameraController({ progress, activeGirl, reducedMotion }) {
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3());
  const desired = useCameraPath(progress, activeGirl);

  useFrame((_, delta) => {
    const easing = reducedMotion ? 1 : 1 - Math.exp(-delta * 2.5);
    camera.position.lerp(desired.camera, easing);
    lookAt.current.lerp(desired.target, easing);
    camera.lookAt(lookAt.current);
  });

  return null;
}
