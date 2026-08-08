import { Float } from '@react-three/drei';
import { useMemo } from 'react';

function PetalDrift() {
  const petals = useMemo(() => Array.from({ length: 30 }, (_, index) => ({
    x: -6 + ((index * 1.73) % 12), y: .25 + ((index * .83) % 4.1), z: 3 - ((index * 1.29) % 16),
    s: .04 + (index % 4) * .017, tint: index % 3 === 0 ? '#f5a2bd' : index % 3 === 1 ? '#ffe5b6' : '#e7b6db',
  })), []);
  return <>{petals.map((petal, index) => <Float key={index} speed={.22 + (index % 5) * .05} floatIntensity={.3} rotationIntensity={.36}>
    <mesh position={[petal.x, petal.y, petal.z]} rotation={[.1 * index, .25, index]} scale={[1.35, .72, 1]}><circleGeometry args={[petal.s, 7]} /><meshBasicMaterial color={petal.tint} transparent opacity={.62} depthWrite={false} /></mesh>
  </Float>)}</>;
}

/** The master landscape provides all terrain; this layer only supplies air, light and drifting petals. */
export function Landing() {
  return <group>
    <PetalDrift />
  </group>;
}
