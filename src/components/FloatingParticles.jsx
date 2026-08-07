import { Sparkles } from '@react-three/drei';

/** One small particle field keeps the world alive without a heavy simulation. */
export function FloatingParticles({ reducedMotion }) {
  return <Sparkles count={reducedMotion ? 24 : 80} scale={[12, 5, 44]} size={2.1} speed={reducedMotion ? .1 : .32} color="#ffe9d8" opacity={.52} />;
}
