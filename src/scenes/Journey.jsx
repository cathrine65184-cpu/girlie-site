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

/** Low, hand-cut hills and a quiet treeline keep the archive garden connected to the sky. */
function HorizonTransitions() {
  const ridges = useMemo(() => [-3.5, -11.5, -19.5, -27.5].map((z, index) => ({
    z,
    tint: index % 2 ? '#be939b' : '#d1a8aa',
    trees: index % 2 ? '#77917b' : '#85957c',
  })), []);
  const trees = useMemo(() => Array.from({ length: 44 }, (_, index) => ({
    ridge: Math.floor(index / 11),
    side: index % 2 ? -1 : 1,
    x: 2.3 + ((index * .61) % 3.5),
    h: .3 + (index % 4) * .11,
  })), []);

  return <group>
    {ridges.map((ridge, index) => <group key={ridge.z} position={[0, -.32, ridge.z]}>
      <mesh position={[-2.7, .36, -.2]} scale={[3.5, .88 + (index % 2) * .18, 1.15]}><dodecahedronGeometry args={[1, 1]} /><meshStandardMaterial color={ridge.tint} roughness={1} /></mesh>
      <mesh position={[2.8, .28, .25]} scale={[3.8, .72 + ((index + 1) % 2) * .18, 1.1]}><dodecahedronGeometry args={[1, 1]} /><meshStandardMaterial color={index % 2 ? '#d9b2ad' : '#bc919c'} roughness={1} /></mesh>
      <mesh position={[0, .05, .75]} scale={[4.2, .4, .7]}><sphereGeometry args={[1, 16, 8]} /><meshStandardMaterial color="#d8b9b4" roughness={1} /></mesh>
    </group>)}
    {trees.map((tree, index) => {
      const ridge = ridges[tree.ridge];
      return <group key={index} position={[tree.side * tree.x, -.42, ridge.z + .55 + (index % 3) * .14]}>
        <mesh position={[0, tree.h / 2, 0]}><cylinderGeometry args={[.012, .018, tree.h, 5]} /><meshStandardMaterial color="#73695d" roughness={.95} /></mesh>
        <mesh position={[0, tree.h + .11, 0]} scale={[.15, .28 + (index % 3) * .045, .15]}><coneGeometry args={[1, 1.55, 7]} /><meshStandardMaterial color={ridge.trees} roughness={.92} /></mesh>
      </group>;
    })}
  </group>;
}

/** The continuous flower path is the archive: every story is physically embedded in the world. */
export function Journey({ girls, activeId, onOpen, reducedMotion, progress }) {
  return <group>
    <Path />
    <HorizonTransitions />
    <FogRibbons />
    {girls.map((girl, index) => {
      // Each city reveals just ahead of the camera, keeping the archive a discovery path.
      const start = .065 + index * .058;
      const reveal = Math.max(0, Math.min(1, (progress - start) / .11));
      return <GirlPortal key={girl.id} girl={girl} opened={girl.id === activeId} onOpen={onOpen} reducedMotion={reducedMotion} reveal={reveal} />;
    })}
  </group>;
}
