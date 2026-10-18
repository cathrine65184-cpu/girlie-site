import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

// Shared by the earth and grass so every blade stays rooted to the same surface.
const terrainGLSL = `
  float terrainHeight(vec2 p) {
    return -.13 + sin(p.x * .32) * cos(p.y * .24) * .055;
  }
  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float fieldNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1, 0)), f.x),
      mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x), f.y);
  }
`;

const grassVertex = `
  uniform float uTime;
  uniform float uWind;
  uniform vec3 uTouch;
  attribute vec4 aRoot;
  attribute vec4 aShape;
  varying vec3 vWorld;
  varying vec3 vBlade;
  varying vec2 vBladeUv;
  varying float vShade;
  #include <fog_pars_vertex>
  ${terrainGLSL}
  void main() {
    float t = uv.y;
    float seed = aShape.z;
    float height = aRoot.w;
    float wave = sin(aRoot.x * .42 + aRoot.y * .24 - uTime * .8);
    float gust = .6 + .4 * sin(uTime * .37 + aRoot.x * .11);
    vec2 breeze = vec2(.66, .38) * (.2 + wave * .17) * gust * uWind;
    breeze += vec2(sin(uTime * 2.7 + seed * 19.0), cos(uTime * 2.2 + seed * 13.0)) * .025 * uWind;
    vec2 lean = vec2(cos(aRoot.z), sin(aRoot.z)) * aShape.y;
    vec2 p1 = lean * .08 + breeze * .08;
    vec2 p2 = lean * .4 + breeze * .4;
    vec2 p3 = lean + breeze;
    float s = 1.0 - t;
    vec2 bend = (3.0*s*s*t*p1 + 3.0*s*t*t*p2 + t*t*t*p3) * height;
    vec2 root = aRoot.xy;
    vec2 away = root - uTouch.xz;
    float touch = (1.0 - smoothstep(.0, 1.3, length(away))) * uWind;
    bend += normalize(away + vec2(.001)) * touch * t*t * .3;
    float width = aShape.x * pow(max(0.0, 1.0 - t), .65);
    vec2 side = vec2(cos(aRoot.z), sin(aRoot.z));
    vec2 xz = root + bend + side * position.x * width;
    float y = terrainHeight(root) + t * height * (1.0 - touch * .25 * t);
    // The raised midrib catches a different highlight from the thin edges.
    y += (1.0 - abs(position.x)) * width * .3;
    vWorld = vec3(xz.x, y, xz.y);
    vBlade = vec3(side.x, .3, side.y);
    vBladeUv = uv;
    vShade = aShape.w * .68 + seed * .32;
    vec4 mvPosition = modelViewMatrix * vec4(vWorld, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const grassFragment = `
  varying vec3 vWorld;
  varying vec3 vBlade;
  varying vec2 vBladeUv;
  varying float vShade;
  #include <fog_pars_fragment>
  void main() {
    float t = vBladeUv.y;
    vec3 dark = vec3(.025, .065, .039);
    vec3 sage = mix(vec3(.13, .24, .11), vec3(.28, .34, .16), vShade);
    vec3 color = mix(dark, sage, smoothstep(0.0, .85, t));
    vec3 normal = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    normal = gl_FrontFacing ? normal : -normal;
    vec3 lightDir = normalize(vec3(-.5, .9, .6));
    float diffuse = max(.0, dot(normal, lightDir));
    float transmission = pow(max(.0, dot(-normal, lightDir)), 2.0) * .36;
    float rib = pow(1.0 - abs(vBladeUv.x * 2.0 - 1.0), 8.0) * .1;
    color *= .76 + diffuse * .54 + transmission + rib;
    // A faint pink rim ties the green meadow to the surrounding flower light.
    color += vec3(.055, .022, .037) * t * pow(1.0 - abs(dot(normal, normalize(cameraPosition - vWorld))), 3.0);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

function makeGrassGeometry(count, segments, seed) {
  let state = seed;
  const random = () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
  const positions = [], uvs = [], indices = [];
  for (let row = 0; row <= segments; row += 1) {
    const t = row / segments;
    positions.push(-1, t, 0, 1, t, 0);
    uvs.push(0, t, 1, t);
    if (row < segments) {
      const n = row * 2;
      indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
    }
  }
  const roots = new Float32Array(count * 4);
  const shapes = new Float32Array(count * 4);
  for (let i = 0; i < count; i += 1) {
    let x, z, radius;
    do {
      x = (random() - .5) * 43;
      z = segments > 3 ? 8.5 - random() * 24 : -15.5 - random() * 23;
      radius = Math.hypot(x / 2.25, z / 1.9);
    } while (radius < 1.05);
    const clump = .5 + .5 * Math.sin(x * 1.8 + Math.sin(z * .6)) * Math.cos(z * 1.35);
    const path = Math.abs(x - Math.sin((z + 5) * .19) * 2.4);
    const verge = z < -3 && path < 1 ? .33 : 1;
    const edge = Math.min(1, (radius - 1.05) * 1.6 + .18);
    roots.set([x, z, random() * Math.PI * 2, (.17 + clump * .19 + random() * .23) * verge * edge], i * 4);
    shapes.set([.018 + random() * .024, .14 + random() * .57, random(), clump], i * 4);
  }
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.setAttribute('aRoot', new THREE.InstancedBufferAttribute(roots, 4));
  geometry.setAttribute('aShape', new THREE.InstancedBufferAttribute(shapes, 4));
  geometry.instanceCount = count;
  return geometry;
}

const noRaycast = () => {};

export function NaturalGrass({ reducedMotion }) {
  const { size, camera, pointer } = useThree();
  const mobile = size.width <= 768;
  const near = useMemo(() => makeGrassGeometry(mobile ? 18500 : 45000, 6, 65184), [mobile]);
  const far = useMemo(() => makeGrassGeometry(mobile ? 6500 : 15000, 3, 20181018), [mobile]);
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: grassVertex, fragmentShader: grassFragment,
    side: THREE.DoubleSide, fog: true,
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uTime: { value: 0 }, uWind: { value: 1 }, uTouch: { value: new THREE.Vector3(100, 0, 100) },
    },
  }), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), .13), []);
  const hit = useRef(new THREE.Vector3());

  useEffect(() => () => { near.dispose(); far.dispose(); }, [near, far]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime;
    material.uniforms.uWind.value = reducedMotion ? 0 : 1;
    ray.setFromCamera(pointer, camera);
    if (ray.ray.intersectPlane(plane, hit.current)) material.uniforms.uTouch.value.copy(hit.current);
  });

  return <group name="natural-grass-meadow">
    <mesh geometry={near} material={material} frustumCulled={false} raycast={noRaycast} />
    <mesh geometry={far} material={material} frustumCulled={false} raycast={noRaycast} />
  </group>;
}

const groundVertex = `
  varying vec3 vWorld;
  #include <fog_pars_vertex>
  ${terrainGLSL}
  void main() {
    vec3 p = position;
    // Geometry lies in XY and is turned into XZ by the model matrix.
    vec4 world = modelMatrix * vec4(p, 1.0);
    world.y = terrainHeight(world.xz);
    vWorld = world.xyz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const groundFragment = `
  varying vec3 vWorld;
  #include <fog_pars_fragment>
  ${terrainGLSL}
  void main() {
    float broad = fieldNoise(vWorld.xz * .45);
    float grain = fieldNoise(vWorld.xz * 18.0);
    float clearing = 1.0 - smoothstep(1.5, 3.5, length(vWorld.xz));
    vec3 moss = mix(vec3(.025, .043, .032), vec3(.055, .078, .047), broad);
    vec3 earth = vec3(.055, .043, .052);
    vec3 color = mix(moss, earth, clearing * .8) * (.8 + grain * .35);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export function MeadowGround() {
  const uniforms = useMemo(() => THREE.UniformsUtils.clone(THREE.UniformsLib.fog), []);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -12]} raycast={noRaycast}>
    <planeGeometry args={[48, 58, 48, 58]} />
    <shaderMaterial vertexShader={groundVertex} fragmentShader={groundFragment} uniforms={uniforms} fog />
  </mesh>;
}
