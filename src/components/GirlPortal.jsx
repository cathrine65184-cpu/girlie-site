import { Html } from '@react-three/drei';
import { Flower, flowerCatalogue } from './Flower';
import { tripoFlowerAssets } from '../data/tripoFlowerAssets';
import { isAwake, localTime } from '../data/girls';
import { useLocale } from '../locales.jsx';

/** Couples the 3D flower with an editorial caption, avoiding a card-grid archive. */
export function GirlPortal({ girl, opened, onOpen, reducedMotion, reveal }) {
  const { t } = useLocale();
  if (reveal < .015) return null;
  const specimen = tripoFlowerAssets[girl.id];
  const flower = flowerCatalogue(girl.id);
  const labelY = girl.position[1] + specimen.labelY;
  return <group>
    <Flower girl={girl} opened={opened} onOpen={onOpen} reducedMotion={reducedMotion} />
    {reveal > .18 && <Html position={[girl.position[0], labelY, girl.position[2]]} distanceFactor={5} center style={{ opacity: Math.min(1, (reveal - .18) * 2.4) }}>
      <button className={`portal-label ${opened ? 'is-open' : ''}`} onClick={() => onOpen(girl.id)}>
        <span>{flower.number} · {flower.name}</span><b>{girl.f} {girl.n}</b><small>{t(isAwake(girl) ? 'glowing' : 'resting')} · {girl.city} · {localTime(girl)}</small>
      </button>
    </Html>}
  </group>;
}
