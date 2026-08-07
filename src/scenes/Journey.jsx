import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GirlPortal } from '../components/GirlPortal';

function Path() {
  const material = useRef();
  useFrame(({ clock }) => { if (material.current) material.current.emissiveIntensity = .12 + Math.sin(clock.elapsedTime * .25) * .04; });
  return <>
    <mesh position={[0, -.56, -14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[14, 52, 1, 1]} /><meshStandardMaterial color="#476047" roughness={1} /></mesh>
    <mesh position={[0, -.535, -14]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2.6, 52, 1, 1]} /><meshStandardMaterial ref={material} color="#c9af8d" emissive="#d89f87" roughness={1} /></mesh>
  </>;
}

function FogRibbons() {
  const ribbons = useMemo(() => Array.from({ length: 9 }, (_, index) => ({ x: ((index * 3.7) % 12) - 6, z: -index * 4, s: 2 + (index % 3) })), []);
  return <>{ribbons.map((ribbon, index) => <mesh key={index} position={[ribbon.x, .95, ribbon.z]} rotation={[0, .25, 0]}>
    <sphereGeometry args={[ribbon.s, .16, 18]} /><meshBasicMaterial color="#eee5f0" transparent opacity={.09} depthWrite={false} />
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
