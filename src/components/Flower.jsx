import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { colorByMood, isAwake } from '../data/girls';

/** A reusable, low-poly flower portal; all petals share the same lightweight geometry. */
export function Flower({ girl, opened, onOpen, reducedMotion }) {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  const [petal, heart] = colorByMood[girl.col];
  const awake = isAwake(girl);

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * .45 + girl.position[2]) * .07;
    group.current.position.y = girl.position[1] + Math.sin(clock.elapsedTime * .6 + girl.position[0]) * .08;
  });

  return <group ref={group} position={girl.position} scale={hovered || opened ? 1.16 : 1}>
    <mesh position={[0, -.58, 0]} castShadow><cylinderGeometry args={[.035, .055, 1.16, 8]} /><meshStandardMaterial color="#657e61" roughness={.9} /></mesh>
    {[0, 1, 2, 3, 4].map((index) => {
      const angle = (index / 5) * Math.PI * 2;
      return <mesh key={index} position={[Math.cos(angle) * .28, Math.sin(angle) * .28, 0]} rotation={[0, 0, angle]} castShadow>
        <sphereGeometry args={[.3, 15, 12]} /><meshStandardMaterial color={petal} emissive={petal} emissiveIntensity={opened ? .75 : awake ? .19 : .035} roughness={.68} />
      </mesh>;
    })}
    <mesh onClick={(event) => { event.stopPropagation(); onOpen(girl.id); }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} castShadow>
      <sphereGeometry args={[.19, 20, 20]} /><meshStandardMaterial color={heart} emissive={heart} emissiveIntensity={hovered ? 1.2 : .32} roughness={.52} />
    </mesh>
    <pointLight color={petal} intensity={opened ? 2.1 : hovered ? 1.2 : awake ? .62 : .12} distance={3.1} />
  </group>;
}
