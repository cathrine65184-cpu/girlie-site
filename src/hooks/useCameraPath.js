import { useMemo } from 'react';
import * as THREE from 'three';

const path = [
  { p: 0, camera: [0, 2.1, 14], target: [0, 1, 2] },
  // A gentle side-to-side look creates the feeling of meeting each flower in turn.
  { p: .1, camera: [0, 1.6, 5.5], target: [-1.45, .35, 1] },
  { p: .16, camera: [0, 1.55, 2.5], target: [1.45, .4, -2] },
  { p: .22, camera: [0, 1.55, -.5], target: [-1.45, .35, -5] },
  { p: .28, camera: [0, 1.55, -3.5], target: [1.45, .4, -8] },
  { p: .34, camera: [0, 1.55, -6.5], target: [-1.45, .35, -11] },
  { p: .4, camera: [0, 1.55, -9.5], target: [1.45, .35, -14] },
  { p: .46, camera: [0, 1.55, -12.5], target: [-1.45, .4, -17] },
  { p: .52, camera: [0, 1.55, -15.5], target: [1.45, .35, -20] },
  { p: .58, camera: [0, 1.55, -18.5], target: [-1.45, .35, -23] },
  { p: .64, camera: [0, 1.55, -21.5], target: [1.45, .35, -26] },
  { p: .7, camera: [0, 1.55, -24.5], target: [0, .4, -29] },
  { p: .86, camera: [0, 2.1, -34], target: [0, .5, -32] },
  { p: 1, camera: [0, 2.1, -34], target: [0, .5, -32] },
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
