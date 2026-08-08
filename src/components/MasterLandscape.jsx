import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

function cloneForMuseum(scene) {
  const clone = scene.clone(true);
  clone.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = false;
    node.receiveShadow = true;
  });
  return clone;
}

/**
 * The supplied meadow is the fixed ground plan of the museum. The non-uniform
 * scale only places the asset at a walkable architectural size; no mesh or
 * material is redrawn in the application.
 */
export function MasterLandscape() {
  const { scene } = useGLTF(asset('models/environment/dreamy-pink-landscape.glb'), true, true);
  const landscape = useMemo(() => cloneForMuseum(scene), [scene]);

  return <primitive object={landscape} position={[0, -.71, -12]} scale={[22, 4.35, 44]} />;
}

/** Quiet stone thresholds frame the final turn of the path without becoming scenery to collect. */
export function DistantRocks() {
  const { scene } = useGLTF(asset('models/environment/rock-formation.glb'), true, true);
  const left = useMemo(() => cloneForMuseum(scene), [scene]);
  const right = useMemo(() => cloneForMuseum(scene), [scene]);
  return <group>
    <primitive object={left} position={[-8.75, -.18, -19.2]} rotation={[0, -.45, 0]} scale={2.1} />
    <primitive object={right} position={[8.85, -.12, -26.8]} rotation={[0, .55, 0]} scale={1.6} />
  </group>;
}
