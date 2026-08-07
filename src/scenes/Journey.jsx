import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GirlPortal } from '../components/GirlPortal';

function Path() {
  const material = useRef();
  const stones = useMemo(() => Array.from({ length: 34 }, (_, index) => ({
    x: Math.sin(index * .86) * .31,
    z: 8.5 - index * 1.27,
    r: (index % 3 - 1) * .14,
    s: .72 + (index % 4) * .08,
    color: index % 3 === 0 ? '#f39ab8' : index % 3 === 1 ? '#fff1e8' : '#f8c5d5',
  })), []);
  useFrame(({ clock }) => { if (material.current) material.current.emissiveIntensity = .09 + Math.sin(clock.elapsedTime * .25) * .035; });
  return <>
    <mesh position={[0, -.56, -14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[14, 52, 1, 1]} /><meshStandardMaterial color="#c7959c" roughness={1} /></mesh>
    <mesh position={[0, -.535, -14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2.8, 52, 1, 1]} /><meshStandardMaterial ref={material} color="#edc6b6" emissive="#f8c8c7" roughness={1} /></mesh>
    {stones.map((stone, index) => <mesh key={index} position={[stone.x, -.48, stone.z]} rotation={[0, stone.r, 0]} scale={[stone.s, 1, .72 + (index % 2) * .1]} castShadow receiveShadow>
      <cylinderGeometry args={[.42, .46, .09, 9]} /><meshStandardMaterial color={stone.color} roughness={.78} />
    </mesh>)}
  </>;
}

function FogRibbons() {
  const ribbons = useMemo(() => Array.from({ length: 9 }, (_, index) => ({ x: ((index * 3.7) % 12) - 6, z: -index * 4, s: 2 + (index % 3) })), []);
  return <>{ribbons.map((ribbon, index) => <mesh key={index} position={[ribbon.x, .95, ribbon.z]} rotation={[0, .25, 0]}>
    <sphereGeometry args={[ribbon.s, .16, 18]} /><meshBasicMaterial color="#fff9f4" transparent opacity={.22} depthWrite={false} />
  </mesh>)}</>;
}

/** The continuous flower path is the archive: every story is physically embedded in the world. */
export function Journey({ girls, activeId, onOpen, reducedMotion, progress }) {
  return <group>
    <Path />
    <FogRibbons />
    {girls.map((girl, index) => {
      // Each city reveals just ahead of the camera, keeping the archive a discovery path.
      const start = .065 + index * .058;
      const reveal = Math.max(0, Math.min(1, (progress - start) / .11));
      return <GirlPortal key={girl.id} girl={girl} opened={girl.id === activeId} onOpen={onOpen} reducedMotion={reducedMotion} reveal={reveal} />;
    })}
  </group>;
}
