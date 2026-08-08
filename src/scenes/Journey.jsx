import { GirlPortal } from '../components/GirlPortal';
import { DistantRocks, MasterLandscape } from '../components/MasterLandscape';

/** The continuous flower path is the archive: every story is physically embedded in the world. */
export function Journey({ girls, activeId, onOpen, reducedMotion, progress }) {
  // Loading the active exhibit and its immediate neighbours keeps the journey
  // cinematic on phones instead of mounting every high-detail object at once.
  const archiveProgress = Math.max(0, Math.min(1, (progress - .075) / .66));
  const focusIndex = Math.round(archiveProgress * (girls.length - 1));
  return <group>
    <MasterLandscape />
    <DistantRocks />
    {girls.map((girl, index) => {
      // Each city reveals just ahead of the camera, keeping the archive a discovery path.
      const start = .065 + index * .058;
      const reveal = Math.max(0, Math.min(1, (progress - start) / .11));
      const isNearby = Math.abs(index - focusIndex) <= 2 || girl.id === activeId;
      if (!isNearby) return null;
      return <GirlPortal key={girl.id} girl={girl} opened={girl.id === activeId} onOpen={onOpen} reducedMotion={reducedMotion} reveal={reveal} />;
    })}
  </group>;
}
