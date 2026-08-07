import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { isAwake } from '../data/girls';
import { tripoFlowerAssets } from '../data/tripoFlowerAssets';

// The botanical collection follows the archive order: each specimen carries its own friendship quality.
const botanicalCollection = {
  emma: { number: '01', name: 'Lily of the Valley', meaning: 'Gentle Protection', petal: '#fff6ed', accent: '#dce8c5', glow: '#fff0d3' },
  anna: { number: '02', name: 'Hydrangea', meaning: 'Understanding', petal: '#aab7ed', accent: '#d9dbff', glow: '#c8d4ff' },
  elise: { number: '03', name: 'Camellia', meaning: 'Loyalty', petal: '#efadbd', accent: '#ffe1e4', glow: '#ffd6e1' },
  mei: { number: '04', name: 'Daisy', meaning: 'New Beginning', petal: '#fff7dc', accent: '#e7bd59', glow: '#fff0b0' },
  yuki: { number: '05', name: 'Lavender', meaning: 'Memories', petal: '#a98cda', accent: '#dcccf4', glow: '#c5adf0' },
  grace: { number: '06', name: 'Iris', meaning: 'Courage', petal: '#7861bd', accent: '#f0d887', glow: '#a99be8' },
  sofia: { number: '07', name: 'Lotus', meaning: 'Growth', petal: '#ef91ad', accent: '#ffe1cd', glow: '#ffd0dc' },
  diya: { number: '08', name: 'Sunflower', meaning: 'Support', petal: '#efbf3e', accent: '#754933', glow: '#ffd36c' },
  lily: { number: '09', name: 'Cherry Blossom', meaning: 'Youth', petal: '#f3b1c9', accent: '#ffdce7', glow: '#ffd1e3' },
  mia: { number: '10', name: 'White Rose', meaning: 'Trust', petal: '#fff6e8', accent: '#eed4a5', glow: '#fff0c8' },
  soo: { number: '11', name: 'Magnolia', meaning: 'Grace', petal: '#f4eadc', accent: '#cba27d', glow: '#fff2dd' },
};

/** Generated Tripo flowers remain optional: procedural specimens are the safe fallback until their GLBs exist. */
function TripoSpecimen({ url }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={model} scale={.78} position={[0, -.55, 0]} rotation={[0, Math.PI * .08, 0]} />;
}

function Petal({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [.2, .28, .055], color, glow = 0, roughness = .62 }) {
  return <mesh position={position} rotation={rotation} scale={scale} castShadow>
    <circleGeometry args={[1, 14]} />
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={roughness} side={THREE.DoubleSide} />
  </mesh>;
}

function Stem({ position = [0, -.28, 0], rotation = [0, 0, 0], height = 1.08, color = '#607b62', radius = .035 }) {
  return <mesh position={position} rotation={rotation} castShadow>
    <cylinderGeometry args={[radius * .72, radius, height, 8]} />
    <meshStandardMaterial color={color} roughness={.85} />
  </mesh>;
}

function Leaf({ position, rotation = [0, 0, 0], scale = [.12, .26, .025], color = '#66815e' }) {
  return <mesh position={position} rotation={rotation} scale={scale} castShadow>
    <sphereGeometry args={[1, 12, 8]} />
    <meshStandardMaterial color={color} roughness={.8} />
  </mesh>;
}

function Centre({ color, radius = .14, glow = 0 }) {
  return <mesh castShadow><sphereGeometry args={[radius, 14, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow * 1.7} roughness={.52} /></mesh>;
}

function RadialPetals({ count, radius, scale, color, glow, y = 0, tilt = 0, start = 0 }) {
  return <>{Array.from({ length: count }, (_, index) => {
    const angle = start + (index / count) * Math.PI * 2;
    return <Petal key={index} position={[Math.cos(angle) * radius, y + Math.sin(angle) * radius, 0]} rotation={[tilt, 0, angle]} scale={scale} color={color} glow={glow} />;
  })}</>;
}

function LilyOfTheValley({ flower, glow }) {
  const bells = [[-.25, .29, -.45], [-.09, .15, -.25], [.10, .35, .42], [.28, .12, .3], [.06, .55, .08]];
  return <group>
    <Stem color="#63835f" height={1.22} />
    <Stem position={[-.18, .06, 0]} rotation={[0, 0, -.42]} height={.53} color="#6c8e66" radius={.022} />
    <Stem position={[.18, .07, 0]} rotation={[0, 0, .46]} height={.51} color="#6c8e66" radius={.022} />
    <Leaf position={[-.23, -.35, -.02]} rotation={[0, 0, -.48]} scale={[.11, .48, .028]} color="#61835e" />
    <Leaf position={[.23, -.27, .01]} rotation={[0, 0, .48]} scale={[.105, .43, .028]} color="#709265" />
    {bells.map(([x, y, lean], index) => <group key={index} position={[x, y, .02]} rotation={[0, 0, lean]}>
      <Stem position={[0, .075, 0]} rotation={[0, 0, Math.PI]} height={.22} color="#769a70" radius={.018} />
      <Petal position={[0, -.07, 0]} scale={[.12, .115, .11]} color={flower.petal} glow={glow} />
      <Petal position={[-.075, -.105, 0]} rotation={[0, 0, -.45]} scale={[.05, .045, .055]} color={flower.petal} glow={glow} />
      <Petal position={[.075, -.105, 0]} rotation={[0, 0, .45]} scale={[.05, .045, .055]} color={flower.petal} glow={glow} />
    </group>)}
  </group>;
}

function Hydrangea({ flower, glow }) {
  const florets = Array.from({ length: 15 }, (_, index) => {
    const ring = index < 5 ? .12 : index < 11 ? .29 : .42;
    const angle = index * 2.42;
    return [Math.cos(angle) * ring, .14 + Math.sin(angle) * ring * .75, (index % 3 - 1) * .05];
  });
  return <group>
    <Stem color="#69866c" height={1.1} /><Leaf position={[-.22, -.28, 0]} rotation={[0, 0, -.76]} scale={[.17, .29, .03]} color="#58765e" /><Leaf position={[.22, -.12, 0]} rotation={[0, 0, .82]} scale={[.15, .25, .03]} color="#58765e" />
    {florets.map(([x, y, z], index) => <group key={index} position={[x, y, z]} rotation={[0, 0, index * .25]}>
      <RadialPetals count={4} radius={.07} scale={[.09, .09, .035]} color={index % 4 === 0 ? flower.accent : flower.petal} glow={glow} start={Math.PI / 4} />
      <Centre color="#f7edbe" radius={.026} glow={glow} />
    </group>)}
  </group>;
}

function Camellia({ flower, glow }) {
  return <group>
    <Stem color="#6c7162" height={1.12} /><Leaf position={[-.22, -.32, .02]} rotation={[0, 0, -.86]} scale={[.15, .31, .036]} color="#4f735d" /><Leaf position={[.22, -.17, -.01]} rotation={[0, 0, .82]} scale={[.14, .28, .036]} color="#4f735d" />
    <RadialPetals count={8} radius={.2} scale={[.18, .27, .06]} color={flower.accent} glow={glow} start={.16} />
    <RadialPetals count={6} radius={.12} scale={[.15, .21, .07]} color={flower.petal} glow={glow} start={.5} />
    <RadialPetals count={5} radius={.055} scale={[.09, .13, .08]} color="#f08fa9" glow={glow} start={.2} />
    <Centre color="#e2a95c" radius={.06} glow={glow} />
  </group>;
}

function Daisy({ flower, glow }) {
  return <group>
    <Stem color="#72875a" height={1.18} /><Stem position={[-.14, -.07, 0]} rotation={[0, 0, -.35]} height={.46} color="#768d62" radius={.022} /><Leaf position={[-.24, -.34, 0]} rotation={[0, 0, -.76]} scale={[.09, .22, .02]} color="#557251" /><Leaf position={[.20, -.18, 0]} rotation={[0, 0, .68]} scale={[.08, .2, .02]} color="#557251" />
    <RadialPetals count={18} radius={.24} scale={[.065, .27, .035]} color={flower.petal} glow={glow} start={.1} />
    <Centre color={flower.accent} radius={.14} glow={glow} />
    <Centre color="#c88e38" radius={.075} glow={glow} />
  </group>;
}

function Lavender({ flower, glow }) {
  const florets = Array.from({ length: 22 }, (_, index) => {
    const y = -.08 + index * .037;
    const angle = index * 2.38;
    return [Math.cos(angle) * (.045 + (index % 3) * .014), y, Math.sin(angle) * .06];
  });
  return <group>
    <Stem color="#6e8963" height={1.2} radius={.027} /><Stem position={[-.17, -.2, 0]} rotation={[0, 0, -.18]} height={.7} color="#708b68" radius={.018} /><Stem position={[.16, -.24, 0]} rotation={[0, 0, .19]} height={.65} color="#708b68" radius={.018} />
    <Leaf position={[-.16, -.39, 0]} rotation={[0, 0, -.25]} scale={[.035, .29, .018]} color="#759068" /><Leaf position={[.17, -.35, 0]} rotation={[0, 0, .25]} scale={[.035, .28, .018]} color="#759068" />
    {florets.map(([x, y, z], index) => <Petal key={index} position={[x, y, z]} rotation={[0, 0, index * .44]} scale={[.052, .075, .04]} color={index % 4 ? flower.petal : flower.accent} glow={glow} />)}
  </group>;
}

function Iris({ flower, glow }) {
  return <group>
    <Stem color="#607f5a" height={1.18} /><Leaf position={[-.17, -.3, -.01]} rotation={[0, 0, -.31]} scale={[.045, .43, .02]} color="#567450" /><Leaf position={[.17, -.24, .01]} rotation={[0, 0, .31]} scale={[.045, .41, .02]} color="#567450" />
    {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, index) => <Petal key={`fall-${index}`} position={[Math.cos(angle) * .16, .1 + Math.sin(angle) * .13, .01]} rotation={[0, .34, angle]} scale={[.17, .29, .06]} color={flower.petal} glow={glow} />)}
    {[Math.PI / 6, Math.PI * 5 / 6, Math.PI * 9 / 6].map((angle, index) => <Petal key={`flag-${index}`} position={[Math.cos(angle) * .09, .25 + Math.sin(angle) * .08, -.02]} rotation={[.18, -.24, angle]} scale={[.12, .28, .055]} color="#b0a2e8" glow={glow} />)}
    <Centre color={flower.accent} radius={.065} glow={glow} />
  </group>;
}

function Lotus({ flower, glow }) {
  return <group>
    <Stem color="#648460" height={1.14} radius={.04} /><Leaf position={[-.24, -.29, .01]} rotation={[0, 0, -.94]} scale={[.2, .16, .024]} color="#6b9170" /><Leaf position={[.27, -.24, -.01]} rotation={[0, 0, .95]} scale={[.19, .15, .024]} color="#6b9170" />
    <RadialPetals count={9} radius={.24} scale={[.15, .32, .055]} color={flower.accent} glow={glow} start={.1} />
    <RadialPetals count={7} radius={.14} scale={[.13, .27, .06]} color={flower.petal} glow={glow} start={.38} />
    <RadialPetals count={5} radius={.065} scale={[.09, .19, .07]} color="#e76892" glow={glow} start={.2} />
    <Centre color="#f2c85d" radius={.065} glow={glow} />
  </group>;
}

function Sunflower({ flower, glow }) {
  return <group>
    <Stem color="#607a51" height={1.18} radius={.042} /><Leaf position={[-.25, -.28, .01]} rotation={[0, 0, -.82]} scale={[.16, .31, .032]} color="#55744d" /><Leaf position={[.24, -.1, -.01]} rotation={[0, 0, .76]} scale={[.14, .28, .032]} color="#55744d" />
    <RadialPetals count={20} radius={.3} scale={[.07, .31, .04]} color={flower.petal} glow={glow} start={.04} />
    <RadialPetals count={12} radius={.18} scale={[.065, .2, .05]} color="#ffd96b" glow={glow} start={.23} />
    <Centre color={flower.accent} radius={.19} glow={glow} />
    <Centre color="#5e3b2c" radius={.11} glow={glow} />
  </group>;
}

function CherryBlossom({ flower, glow }) {
  const blossoms = [[-.22, .29, -.44], [.08, .14, .08], [.23, .33, .48], [-.03, .51, -.08]];
  return <group>
    <Stem color="#76584f" height={1.12} radius={.035} /><Stem position={[-.15, .05, 0]} rotation={[0, 0, -.58]} height={.65} color="#805d55" radius={.021} /><Stem position={[.16, .14, 0]} rotation={[0, 0, .54]} height={.58} color="#805d55" radius={.021} />
    <Leaf position={[-.18, -.32, 0]} rotation={[0, 0, -.67]} scale={[.09, .18, .02]} color="#66825f" /><Leaf position={[.18, -.19, 0]} rotation={[0, 0, .68]} scale={[.08, .17, .02]} color="#66825f" />
    {blossoms.map(([x, y, r], index) => <group key={index} position={[x, y, .02]} rotation={[0, 0, r]}>
      <RadialPetals count={5} radius={.1} scale={[.1, .12, .042]} color={index % 2 ? flower.accent : flower.petal} glow={glow} start={Math.PI / 2} />
      <Centre color="#d77692" radius={.037} glow={glow} />
    </group>)}
  </group>;
}

function WhiteRose({ flower, glow }) {
  return <group>
    <Stem color="#637759" height={1.16} radius={.036} /><Leaf position={[-.22, -.28, 0]} rotation={[0, 0, -.78]} scale={[.12, .25, .027]} color="#536a50" /><Leaf position={[.22, -.1, 0]} rotation={[0, 0, .76]} scale={[.11, .23, .027]} color="#536a50" />
    <RadialPetals count={9} radius={.23} scale={[.16, .26, .06]} color="#fffaf0" glow={glow} start={.1} />
    <RadialPetals count={7} radius={.14} scale={[.13, .21, .065]} color={flower.petal} glow={glow} start={.48} />
    <RadialPetals count={5} radius={.072} scale={[.09, .15, .07]} color="#f2debd" glow={glow} start={.18} />
    <Centre color={flower.accent} radius={.045} glow={glow} />
  </group>;
}

function Magnolia({ flower, glow }) {
  return <group>
    <Stem color="#725e50" height={1.16} radius={.04} /><Stem position={[.16, .14, 0]} rotation={[0, 0, .5]} height={.48} color="#765f51" radius={.022} /><Leaf position={[-.22, -.3, 0]} rotation={[0, 0, -.77]} scale={[.15, .28, .035]} color="#4c6c62" /><Leaf position={[.23, -.13, 0]} rotation={[0, 0, .78]} scale={[.14, .26, .035]} color="#4c6c62" />
    <RadialPetals count={6} radius={.19} scale={[.17, .31, .075]} color={flower.petal} glow={glow} start={.08} />
    <RadialPetals count={3} radius={.09} scale={[.11, .23, .07]} color="#fff8eb" glow={glow} start={.55} />
    <Centre color={flower.accent} radius={.06} glow={glow} />
    <Petal position={[.25, .48, 0]} rotation={[0, 0, -.34]} scale={[.09, .18, .06]} color="#efe0cf" glow={glow} />
  </group>;
}

function BotanicalHead({ flower, id, glow }) {
  const specimens = {
    emma: LilyOfTheValley, anna: Hydrangea, elise: Camellia, mei: Daisy, yuki: Lavender, grace: Iris,
    sofia: Lotus, diya: Sunflower, lily: CherryBlossom, mia: WhiteRose, soo: Magnolia,
  };
  const Specimen = specimens[id] || Daisy;
  return <Specimen flower={flower} glow={glow} />;
}

/** A botanical collection of eleven unique friendship flowers; click behaviour and bloom motion stay unchanged. */
export function Flower({ girl, opened, onOpen, reducedMotion }) {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  const flower = botanicalCollection[girl.id] || botanicalCollection.mei;
  const tripoUrl = tripoFlowerAssets[girl.id];
  const awake = isAwake(girl);
  const glow = opened ? .33 : hovered ? .23 : awake ? .09 : .015;

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.z = Math.sin(clock.elapsedTime * .45 + girl.position[2]) * .07;
    group.current.position.y = girl.position[1] + .06 + Math.sin(clock.elapsedTime * .6 + girl.position[0]) * .08;
  });

  // The environmental cue sits just behind each specimen, so the flower comes slightly forward as the archive's focal object.
  return <group ref={group} position={[girl.position[0], girl.position[1] + .06, girl.position[2] + .16]} scale={hovered || opened ? 1.16 : 1} userData={{ flower: flower.name, meaning: flower.meaning, catalogue: flower.number }}>
    {tripoUrl ? <TripoSpecimen url={tripoUrl} /> : <BotanicalHead flower={flower} id={girl.id} glow={glow} />}
    <mesh
      position={[0, .12, .12]}
      onClick={(event) => { event.stopPropagation(); onOpen(girl.id); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[.66, 16, 14]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
    <pointLight color={flower.glow} intensity={opened ? 2.1 : hovered ? 1.2 : awake ? .62 : .12} distance={3.1} />
  </group>;
}
