import { Sparkles } from '@react-three/drei';

/** One small particle field keeps the world alive without a heavy simulation. */
export function FloatingParticles({ reducedMotion }) {
  return <>
    <Sparkles count={reducedMotion ? 24 : 90} scale={[12, 5, 44]} size={2.4} speed={reducedMotion ? .1 : .28} color="#f39abd" opacity={.48} />
    <Sparkles count={reducedMotion ? 12 : 58} scale={[11, 4.2, 42]} position={[0, 1.3, -10]} size={1.15} speed={reducedMotion ? .06 : .16} color="#ffe2a0" opacity={.58} />
  </>;
}
