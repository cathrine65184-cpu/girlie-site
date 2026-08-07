import { Float } from '@react-three/drei';
import { useMemo } from 'react';

function RollingHills() {
  const hills = useMemo(() => [
    [-6.8, -.38, -17.5, 6.1, 1.3, 2.1, '#c9969d'], [-2.9, -.32, -19.5, 6.9, 1.58, 2.1, '#dfb3ac'],
    [2.7, -.38, -18.1, 6.4, 1.34, 2.25, '#c78f98'], [7.1, -.3, -21.4, 6.5, 1.65, 2.25, '#dfb5aa'],
    [0, -.5, -24, 9.2, 1.08, 2.6, '#e3c4b8'],
  ], []);
  return <group>{hills.map(([x, y, z, sx, sy, sz, color], index) => <mesh key={index} position={[x, y, z]} scale={[sx, sy, sz]} receiveShadow>
    <sphereGeometry args={[1, 32, 18]} /><meshStandardMaterial color={color} roughness={1} transparent opacity={.9} />
  </mesh>)}</group>;
}

function PetalDrift() {
  const petals = useMemo(() => Array.from({ length: 30 }, (_, index) => ({
    x: -6 + ((index * 1.73) % 12), y: .25 + ((index * .83) % 4.1), z: 3 - ((index * 1.29) % 16),
    s: .04 + (index % 4) * .017, tint: index % 3 === 0 ? '#f5a2bd' : index % 3 === 1 ? '#ffe5b6' : '#e7b6db',
  })), []);
  return <>{petals.map((petal, index) => <Float key={index} speed={.22 + (index % 5) * .05} floatIntensity={.3} rotationIntensity={.36}>
    <mesh position={[petal.x, petal.y, petal.z]} rotation={[.1 * index, .25, index]} scale={[1.35, .72, 1]}><circleGeometry args={[petal.s, 7]} /><meshBasicMaterial color={petal.tint} transparent opacity={.62} depthWrite={false} /></mesh>
  </Float>)}</>;
}

/** Soft distant forms establish the entrance without making it feel game-like. */
export function Landing() {
  return <group>
    <RollingHills />
    {/* A quiet base under the continuous Journey terrain — it must stay below the stone path. */}
    <mesh position={[0, -.72, 3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[8, 64]} /><meshStandardMaterial color="#d7a5aa" roughness={1} /></mesh>
    <mesh position={[0, 3.5, -4]}><sphereGeometry args={[2.1, 32, 24]} /><meshBasicMaterial color="#fffaf0" transparent opacity={.72} /></mesh>
    <PetalDrift />
    {[-4, -2.2, 2.4, 4.2].map((x, index) => <Float key={x} speed={.22 + index * .05} floatIntensity={.24}>
      <mesh position={[x, 1 + index * .3, 1 - index * 2]} rotation={[.3, .1, index]} scale={[1.6, .35, 1]}><sphereGeometry args={[.22 + index * .04, 14, 10]} /><meshStandardMaterial color={index % 2 ? '#dcbce5' : '#f7abc2'} transparent opacity={.7} /></mesh>
    </Float>)}
  </group>;
}
