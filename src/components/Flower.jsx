import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { isAwake } from '../data/girls';
import { tripoFlowerAssets } from '../data/tripoFlowerAssets';

// Names describe the real supplied models. The friendship meanings stay in the archive order.
const botanicalCollection = {
  emma: { number: '01', name: 'Lily of the Valley', meaning: 'Gentle Protection', glow: '#fff0d3' },
  anna: { number: '02', name: 'Hydrangea', meaning: 'Understanding', glow: '#c8d4ff' },
  elise: { number: '03', name: 'White Clematis', meaning: 'Loyalty', glow: '#fff1e8' },
  mei: { number: '04', name: 'Daisy', meaning: 'New Beginning', glow: '#fff0b0' },
  yuki: { number: '05', name: 'Lavender', meaning: 'Memories', glow: '#c5adf0' },
  grace: { number: '06', name: 'Iris', meaning: 'Courage', glow: '#a99be8' },
  sofia: { number: '07', name: 'Pink Lotus', meaning: 'Growth', glow: '#ffd0dc' },
  diya: { number: '08', name: 'Yellow Lily', meaning: 'Support', glow: '#ffd36c' },
  lily: { number: '09', name: 'Cherry Blossom Tree', meaning: 'Youth', glow: '#ffd1e3' },
  mia: { number: '10', name: 'Pink Rose', meaning: 'Trust', glow: '#fff0c8' },
  soo: { number: '11', name: 'Bonsai Tree', meaning: 'Grace', glow: '#fff2dd' },
};

function rotationProfile(id) {
  // A deterministic offset keeps the collection from moving in mechanical unison.
  const seed = [...id].reduce((total, character) => total * 31 + character.charCodeAt(0), 7) >>> 0;
  return { offset: (seed % 360) * THREE.MathUtils.DEG2RAD, duration: 20 + (seed % 11) };
}

function MuseumSpecimen({ specimen, flowerId }) {
  const { scene } = useGLTF(specimen.url, true, true);
  const { model, pivot } = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
    });
    // GLB roots are inconsistent: some pivots are at a stem, others are offset.
    // We keep the asset untouched and derive only the horizontal visual centre.
    clone.updateWorldMatrix(true, true);
    const centre = new THREE.Box3().setFromObject(clone).getCenter(new THREE.Vector3());
    return { model: clone, pivot: centre };
  }, [scene]);
  const rotor = useRef();
  const { offset, duration } = useMemo(() => rotationProfile(flowerId), [flowerId]);

  // One R3F render loop drives every mounted exhibit — no per-flower timers.
  // The parent sits on the model's own horizontal centre; Y rotation therefore
  // reveals the full specimen in place while its base stays at the same height.
  useFrame(({ clock }) => {
    if (rotor.current) rotor.current.rotation.y = offset + clock.elapsedTime * (Math.PI * 2 / duration);
  });

  return <group ref={rotor} position={[pivot.x * specimen.scale, specimen.lift, pivot.z * specimen.scale]}>
    <primitive object={model} scale={specimen.scale} position={[-pivot.x, 0, -pivot.z]} />
  </group>;
}

/** A physical botanical exhibit. Its bloom, label, and story-opening interaction remain unchanged. */
export function Flower({ girl, opened, onOpen, reducedMotion }) {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  const flower = botanicalCollection[girl.id] || botanicalCollection.mei;
  const specimen = tripoFlowerAssets[girl.id];
  const awake = isAwake(girl);

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * .34 + girl.position[2]) * .026;
    group.current.position.y = girl.position[1] + Math.sin(clock.elapsedTime * .46 + girl.position[0]) * .032;
  });

  if (!specimen) return null;

  return <group
    ref={group}
    position={girl.position}
    scale={hovered || opened ? 1.07 : 1}
    userData={{ flower: flower.name, meaning: flower.meaning, catalogue: flower.number }}
  >
    <MuseumSpecimen specimen={specimen} flowerId={girl.id} />
    <mesh
      position={[0, specimen.hitY, .08]}
      onClick={(event) => { event.stopPropagation(); onOpen(girl.id); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[specimen.radius, 18, 16]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
    <pointLight color={flower.glow} intensity={opened ? 2.0 : hovered ? 1.05 : awake ? .42 : .08} distance={3.8} />
  </group>;
}

export function flowerCatalogue(id) {
  return botanicalCollection[id] || botanicalCollection.mei;
}
