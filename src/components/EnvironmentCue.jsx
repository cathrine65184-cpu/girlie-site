import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

const worlds = {
  'Bamboo path': { color: '#638d66', glow: '#d7efba', type: 'bamboo' },
  'Sunflower field': { color: '#e4ad3e', glow: '#fff0a1', type: 'sunflower' },
  'Paris café': { color: '#b96e51', glow: '#ffd49b', type: 'cafe' },
  'Tropical rain': { color: '#3e8d72', glow: '#a8e9b3', type: 'tropical' },
  'Cherry blossom garden': { color: '#dc91af', glow: '#ffe1ec', type: 'blossom' },
  'Rooftop garden': { color: '#718b79', glow: '#ffe2a9', type: 'rooftop' },
  'Jacaranda dusk': { color: '#7e73c7', glow: '#d8d0ff', type: 'jacaranda' },
  'Lotus water': { color: '#547e91', glow: '#ccebf0', type: 'lotus' },
  'Rainy conservatory': { color: '#5b8b77', glow: '#d7f2db', type: 'conservatory' },
  'Coastal wildflowers': { color: '#5991a4', glow: '#d5f0ee', type: 'coast' },
  'Lantern courtyard': { color: '#bd7568', glow: '#ffd2a3', type: 'lantern' },
};

function PlantCluster({ type, color, glow }) {
  if (type === 'cafe') return <group>
    <mesh position={[-.5, .38, .3]}><boxGeometry args={[1.35, .9, .12]} /><meshStandardMaterial color="#7c4e46" roughness={.82} /></mesh>
    <mesh position={[-.5, .45, .22]}><planeGeometry args={[.78, .53]} /><meshBasicMaterial color={glow} transparent opacity={.75} /></mesh>
    <mesh position={[.58, -.08, .05]}><cylinderGeometry args={[.22, .25, .35, 12]} /><meshStandardMaterial color="#bd9172" /></mesh>
    <mesh position={[.58, .18, .05]}><sphereGeometry args={[.3, 14, 12]} /><meshStandardMaterial color="#557b55" roughness={.9} /></mesh>
  </group>;
  if (type === 'lantern') return <group>{[-.6, .6].map((x) => <group key={x} position={[x, .22, 0]}>
    <mesh position={[0, -.3, 0]}><cylinderGeometry args={[.025, .04, .8, 8]} /><meshStandardMaterial color="#6a5540" /></mesh>
    <mesh><sphereGeometry args={[.17, 16, 12]} /><meshStandardMaterial color={color} emissive={glow} emissiveIntensity={.65} /></mesh>
  </group>)}</group>;
  if (type === 'lotus') return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.46, 0]}><circleGeometry args={[1.1, 32]} /><meshStandardMaterial color={color} transparent opacity={.68} roughness={.25} /></mesh>
    {[-.45, .08, .5].map((x, index) => <mesh key={x} position={[x, -.38, index % 2 ? -.2 : .2]} rotation={[-Math.PI / 2, 0, index]}><circleGeometry args={[.25, 18]} /><meshStandardMaterial color="#8aa66c" /></mesh>)}
  </group>;
  if (type === 'coast') return <group>
    {[0, .26, .52].map((z) => <mesh key={z} position={[0, -.42, z]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[.8 - z * .35, .022, 6, 28, Math.PI]} /><meshBasicMaterial color={glow} transparent opacity={.62} /></mesh>)}
    <PlantCluster type="blossom" color="#e7bd83" glow={glow} />
  </group>;
  if (type === 'conservatory') return <group>
    {[-.55, 0, .55].map((x) => <mesh key={x} position={[x, .2, .25]} rotation={[0, 0, 0]}><torusGeometry args={[.42, .026, 8, 20, Math.PI]} /><meshStandardMaterial color={glow} transparent opacity={.58} /></mesh>)}
    <PlantCluster type="tropical" color={color} glow={glow} />
  </group>;
  if (type === 'rooftop') return <group>
    {[-.62, -.2, .23, .64].map((x, index) => <mesh key={x} position={[x, -.13 + index * .03, .22]}><boxGeometry args={[.27, .55 + index * .18, .22]} /><meshStandardMaterial color="#79808a" roughness={.92} /></mesh>)}
    <PlantCluster type="bamboo" color={color} glow={glow} />
  </group>;
  if (type === 'sunflower') return <group>{[-.55, -.18, .3, .62].map((x, index) => <group key={x} position={[x, index % 2 ? -.08 : -.2, .12]}>
    <mesh position={[0, -.27, 0]}><cylinderGeometry args={[.018, .028, .62, 7]} /><meshStandardMaterial color="#54784a" /></mesh>
    <mesh><sphereGeometry args={[.18, 13, 10]} /><meshStandardMaterial color={color} emissive={glow} emissiveIntensity={.18} /></mesh>
  </group>)}</group>;

  const isTall = type === 'bamboo';
  const blossomTint = type === 'jacaranda' ? '#a99ee6' : type === 'blossom' ? '#f2b6cd' : color;
  return <group>{[-.7, -.35, .1, .47, .76].map((x, index) => <group key={x} position={[x, -.28 + (index % 2) * .09, (index % 3) * .16]}>
    <mesh position={[0, isTall ? .35 : .16, 0]}><cylinderGeometry args={[isTall ? .04 : .025, isTall ? .07 : .045, isTall ? 1.45 : .72, 7]} /><meshStandardMaterial color={isTall ? '#4f7657' : '#677a4f'} roughness={.9} /></mesh>
    <mesh position={[0, isTall ? 1.03 : .55, 0]}><sphereGeometry args={[isTall ? .25 : .36, 14, 12]} /><meshStandardMaterial color={blossomTint} emissive={blossomTint} emissiveIntensity={.09} roughness={.82} /></mesh>
  </group>)}</group>;
}

/** Small, real-world landscape cues appear around each flower instead of a repeated card treatment. */
export function EnvironmentCue({ girl, reveal, reducedMotion }) {
  const group = useRef();
  const world = worlds[girl.world];

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y = Math.sin(clock.elapsedTime * .12 + girl.position[2]) * .035;
  });

  if (reveal < .015) return null;
  return <group ref={group} position={[girl.position[0] * 1.09, girl.position[1] - .18, girl.position[2] + .42]} scale={.45 + reveal * .55}>
    <PlantCluster type={world.type} color={world.color} glow={world.glow} />
    <pointLight position={[0, .65, .1]} color={world.glow} intensity={.38 * reveal} distance={2.6} />
  </group>;
}
