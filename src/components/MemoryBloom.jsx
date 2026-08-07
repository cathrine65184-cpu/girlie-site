import { Float } from '@react-three/drei';

/** The field becomes denser as the visitor encounters more stories. */
export function MemoryBloom({ count, reducedMotion }) {
  const blooms = Array.from({ length: Math.max(3, count * 4) }, (_, index) => ({
    x: ((index * 1.71) % 7) - 3.5,
    z: -31 - ((index * .83) % 5),
    tint: index % 2 ? '#ffd7e7' : '#d8c4ff',
  }));
  return <group>{blooms.map((bloom, index) => <Float key={index} speed={reducedMotion ? .1 : .42} floatIntensity={.16} rotationIntensity={.08}>
    <mesh position={[bloom.x, .24 + (index % 3) * .08, bloom.z]}><sphereGeometry args={[.13 + (index % 3) * .028, 10, 10]} /><meshStandardMaterial color={bloom.tint} emissive={bloom.tint} emissiveIntensity={.5} /></mesh>
  </Float>)}</group>;
}
