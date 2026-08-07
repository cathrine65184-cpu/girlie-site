import { Html } from '@react-three/drei';
import { Flower } from './Flower';
import { EnvironmentCue } from './EnvironmentCue';
import { isAwake, localTime } from '../data/girls';

/** Couples the 3D flower with an editorial caption, avoiding a card-grid archive. */
export function GirlPortal({ girl, opened, onOpen, reducedMotion, reveal }) {
  if (reveal < .015) return null;
  return <group>
    <EnvironmentCue girl={girl} reveal={reveal} reducedMotion={reducedMotion} />
    <Flower girl={girl} opened={opened} onOpen={onOpen} reducedMotion={reducedMotion} />
    {reveal > .18 && <Html position={[girl.position[0], girl.position[1] + .67, girl.position[2]]} distanceFactor={8} center style={{ opacity: Math.min(1, (reveal - .18) * 2.4) }}>
      <button className={`portal-label ${opened ? 'is-open' : ''}`} onClick={() => onOpen(girl.id)}>
        <span>{girl.f} {girl.city}</span><b>{girl.n}</b><small>{isAwake(girl) ? 'glowing' : 'resting'} · {localTime(girl)}</small>
      </button>
    </Html>}
  </group>;
}
