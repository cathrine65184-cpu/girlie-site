import { Sparkles } from '@react-three/drei';

/** One small particle field keeps the world alive without a heavy simulation. */
export function FloatingParticles({ reducedMotion }) {
  return <Sparkles count={reducedMotion ? 24 : 90} scale={[12, 5, 44]} size={2.4} speed={reducedMotion ? .1 : .28} color="#f39abd" opacity={.48} />;
}
