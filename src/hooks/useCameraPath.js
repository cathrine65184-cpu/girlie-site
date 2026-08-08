import { useMemo } from 'react';
import * as THREE from 'three';

const path = [
  { p: 0, camera: [0, 2.9, 13.4], target: [0, 1.25, 1.2] },
  // The camera stays in the central path and only leans toward the exhibit: a visit, not a chase.
  { p: .1, camera: [-.45, 2.15, 7.15], target: [-4.7, .62, 4.2] },
  { p: .16, camera: [.45, 2.12, 3.85], target: [4.55, .63, 1.15] },
  { p: .22, camera: [-.45, 2.0, .55], target: [-4.8, .86, -2.05] },
  { p: .28, camera: [.45, 2.1, -2.65], target: [4.5, 1.16, -5.25] },
  { p: .34, camera: [-.45, 2.3, -6.05], target: [-4.75, 1.66, -8.65] },
  { p: .4, camera: [.45, 2.5, -9.35], target: [4.6, 1.9, -11.95] },
  { p: .46, camera: [-.45, 2.8, -12.7], target: [-4.7, 2.07, -15.3] },
  { p: .52, camera: [.45, 3.15, -16.05], target: [4.62, 2.42, -18.65] },
  { p: .58, camera: [-.5, 3.6, -19.4], target: [-4.75, 3.54, -22.05] },
  { p: .64, camera: [.45, 3.5, -22.85], target: [4.45, 2.71, -25.55] },
  { p: .7, camera: [0, 3.9, -26.2], target: [0, 3.22, -29.15] },
  { p: .86, camera: [0, 4.15, -35], target: [0, 2.75, -32] },
  { p: 1, camera: [0, 4.15, -35], target: [0, 2.75, -32] },
];

export function useCameraPath(progress, activeGirl) {
  return useMemo(() => {
    if (activeGirl) {
      const [x, y, z] = activeGirl.position;
      return { camera: new THREE.Vector3(x * .58, y + 1.2, z + 3.3), target: new THREE.Vector3(x, y + .2, z) };
    }
    const next = path.find((point) => point.p >= progress) || path.at(-1);
    const previous = [...path].reverse().find((point) => point.p <= progress) || path[0];
    const mix = previous === next ? 0 : (progress - previous.p) / (next.p - previous.p);
    return {
      camera: new THREE.Vector3(...previous.camera).lerp(new THREE.Vector3(...next.camera), mix),
      target: new THREE.Vector3(...previous.target).lerp(new THREE.Vector3(...next.target), mix),
    };
  }, [activeGirl, progress]);
}
