import { Float } from '@react-three/drei';

/** Soft distant forms establish the entrance without making it feel game-like. */
export function Landing() {
  return <group>
    <mesh position={[0, .4, 3]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[8, 64]} /><meshStandardMaterial color="#7c9b76" roughness={1} /></mesh>
    <mesh position={[0, 3.5, -4]}><sphereGeometry args={[2.1, 32, 24]} /><meshBasicMaterial color="#fff2d8" transparent opacity={.45} /></mesh>
    {[-4, -2.2, 2.4, 4.2].map((x, index) => <Float key={x} speed={.22 + index * .05} floatIntensity={.24}>
      <mesh position={[x, 1 + index * .3, 1 - index * 2]}><sphereGeometry args={[.38 + index * .08, 18, 15]} /><meshStandardMaterial color={index % 2 ? '#d3b9ee' : '#ffd7dd'} transparent opacity={.66} /></mesh>
    </Float>)}
  </group>;
}
