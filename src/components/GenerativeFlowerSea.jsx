import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { MeadowGround, NaturalGrass } from './NaturalGrass';

const palette = ['#f6a4bf', '#e975a3', '#f8cad8', '#fff0eb', '#eec84f', '#f4de83', '#d77ba5'];
const anchors = [
  [-11, -3, 7.8, 6.2], [10, -4, 8.5, 6.5], [-8, -16, 9.5, 7.4],
  [9, -18, 8.4, 7.8], [-14, -27, 8.5, 6.7], [3, -29, 11, 7.5],
];

function seededRandom(seed = 65184) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function densityAt(x, z) {
  let density = 0;
  for (const [ax, az, rx, rz] of anchors) {
    const dx = (x - ax) / rx;
    const dz = (z - az) / rz;
    density = Math.max(density, Math.exp(-(dx * dx + dz * dz) * 1.45));
  }
  // A winding band of exposed ground keeps the field composed like brushwork,
  // rather than reading as an evenly filled digital carpet.
  const river = Math.abs(x - Math.sin((z + 5) * .19) * 2.4);
  if (river < 1.15 && z < -3) density *= .12;
  const centre = Math.sqrt((x / 4.1) ** 2 + ((z + .25) / 3.5) ** 2);
  if (centre < 1) density *= Math.max(0, (centre - .58) / .42);
  return Math.min(1, density);
}

function buildField(count) {
  const random = seededRandom();
  const plants = [];
  let attempts = 0;
  while (plants.length < count && attempts < count * 32) {
    attempts += 1;
    const x = -19 + random() * 38;
    const z = 10 - random() * 45;
    const density = densityAt(x, z);
    if (random() > density * .91) continue;
    const height = .28 + random() * .72;
    plants.push({
      x, z, height,
      scale: .65 + random() * .82,
      lean: (random() - .5) * .18,
      angle: random() * Math.PI * 2,
      phase: random() * Math.PI * 2,
      color: new THREE.Color(palette[Math.floor(random() * palette.length)]),
    });
  }
  return plants;
}

function FlowerInstances({ reducedMotion }) {
  const plantCount = reducedMotion ? 480 : 1100;
  const plants = useMemo(() => buildField(plantCount), [plantCount]);
  const stems = useRef();
  const petals = useRef();
  const centres = useRef();
  const field = useRef();

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const euler = new THREE.Euler();
    const petalColor = new THREE.Color();

    if (!stems.current || !petals.current || !centres.current) return;
    plants.forEach((plant, index) => {
        position.set(plant.x, plant.height * .5 - .08, plant.z);
        euler.set(plant.lean, plant.angle, plant.lean * .45);
        quaternion.setFromEuler(euler);
        scale.set(.035 * plant.scale, plant.height, .035 * plant.scale);
        matrix.compose(position, quaternion, scale);
        stems.current.setMatrixAt(index, matrix);

        position.set(plant.x, plant.height, plant.z);
        quaternion.setFromEuler(new THREE.Euler(0, plant.angle, 0));
        scale.setScalar(.15 * plant.scale);
        matrix.compose(position, quaternion, scale);
        centres.current.setMatrixAt(index, matrix);
        centres.current.setColorAt(index, plant.color.clone().offsetHSL(0, -.08, -.08));

        for (let petal = 0; petal < 6; petal += 1) {
          const petalIndex = index * 6 + petal;
          const angle = plant.angle + petal * Math.PI / 3;
          const radius = .14 * plant.scale;
          position.set(plant.x + Math.cos(angle) * radius, plant.height + .015, plant.z + Math.sin(angle) * radius);
          quaternion.setFromEuler(new THREE.Euler(-.22, -angle, angle));
          scale.set(.13 * plant.scale, .035 * plant.scale, .24 * plant.scale);
          matrix.compose(position, quaternion, scale);
          petals.current.setMatrixAt(petalIndex, matrix);
          petalColor.copy(plant.color).offsetHSL((petal % 2) * .012, 0, (petal % 3) * .025);
          petals.current.setColorAt(petalIndex, petalColor);
        }
    });
    [stems.current, petals.current, centres.current].forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.material.needsUpdate = true;
    });
  }, [plants]);

  useFrame(({ clock }) => {
    if (!field.current || reducedMotion) return;
    field.current.rotation.y = Math.sin(clock.elapsedTime * .055) * .012;
    field.current.position.y = Math.sin(clock.elapsedTime * .18) * .018;
  });

  return <group ref={field}>
    <instancedMesh ref={stems} args={[null, null, plants.length]} frustumCulled={false}>
      <cylinderGeometry args={[1, 1, 1, 5]} />
      <meshBasicMaterial color="#416147" />
    </instancedMesh>
    <instancedMesh ref={petals} args={[null, null, plants.length * 6]} frustumCulled={false}>
      <sphereGeometry args={[1, 7, 5]} />
      <meshBasicMaterial color="#f4a4bf" side={THREE.DoubleSide} toneMapped={false} />
    </instancedMesh>
    <instancedMesh ref={centres} args={[null, null, plants.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 7, 5]} />
      <meshBasicMaterial color="#e9c84d" toneMapped={false} />
    </instancedMesh>
  </group>;
}

function FallingPetals({ reducedMotion }) {
  const points = useRef();
  const geometry = useMemo(() => {
    const random = seededRandom(20261018);
    const amount = reducedMotion ? 90 : 260;
    const positions = new Float32Array(amount * 3);
    for (let i = 0; i < amount; i += 1) {
      positions[i * 3] = -18 + random() * 36;
      positions[i * 3 + 1] = .5 + random() * 7;
      positions[i * 3 + 2] = 8 - random() * 42;
    }
    const value = new THREE.BufferGeometry();
    value.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return value;
  }, [reducedMotion]);

  useFrame(({ clock }) => {
    if (!points.current || reducedMotion) return;
    points.current.rotation.y = clock.elapsedTime * .018;
    points.current.position.y = Math.sin(clock.elapsedTime * .24) * .18;
  });

  return <points ref={points} geometry={geometry}>
    <pointsMaterial color="#ffc0d4" size={.095} sizeAttenuation transparent opacity={.72} depthWrite={false} />
  </points>;
}

export function GenerativeFlowerSea({ reducedMotion }) {
  return <group>
    <MeadowGround />
    <NaturalGrass reducedMotion={reducedMotion} />
    <FlowerInstances reducedMotion={reducedMotion} />
    <FallingPetals reducedMotion={reducedMotion} />
  </group>;
}
