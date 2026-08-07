import { Float } from '@react-three/drei';
import { useMemo } from 'react';

function Meadow() {
  const sprigs = useMemo(() => Array.from({ length: 46 }, (_, index) => {
    const side = index % 2 ? -1 : 1;
    return {
      x: side * (2.15 + ((index * .57) % 3.65)),
      z: 5.8 - ((index * 1.13) % 13),
      h: .2 + (index % 4) * .06,
      bloom: index % 3 === 0 ? '#f19abb' : index % 3 === 1 ? '#fff0e8' : '#e8b2cf',
    };
  }), []);

  return <group>{sprigs.map((sprig, index) => <group key={index} position={[sprig.x, -.48, sprig.z]} rotation={[0, index * .5, 0]}>
    <mesh position={[0, sprig.h / 2, 0]}><cylinderGeometry args={[.012, .022, sprig.h, 5]} /><meshStandardMaterial color="#ad7a76" roughness={.94} /></mesh>
    <mesh position={[0, sprig.h + .035, 0]} scale={[1.3, .38, 1]}><sphereGeometry args={[.09, 10, 8]} /><meshStandardMaterial color={sprig.bloom} emissive={sprig.bloom} emissiveIntensity={.08} /></mesh>
  </group>)}</group>;
}

/** Soft distant forms establish the entrance without making it feel game-like. */
export function Landing() {
  return <group>
    <mesh position={[0, .4, 3]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[8, 64]} /><meshStandardMaterial color="#d7a5aa" roughness={1} /></mesh>
    <Meadow />
    <mesh position={[0, 3.5, -4]}><sphereGeometry args={[2.1, 32, 24]} /><meshBasicMaterial color="#fffaf0" transparent opacity={.72} /></mesh>
    {[-4, -2.2, 2.4, 4.2].map((x, index) => <Float key={x} speed={.22 + index * .05} floatIntensity={.24}>
      <mesh position={[x, 1 + index * .3, 1 - index * 2]} rotation={[.3, .1, index]} scale={[1.6, .35, 1]}><sphereGeometry args={[.22 + index * .04, 14, 10]} /><meshStandardMaterial color={index % 2 ? '#dcbce5' : '#f7abc2'} transparent opacity={.7} /></mesh>
    </Float>)}
  </group>;
}
