import { useState } from 'react';
import { LocaleMenu, useLocale } from '../locales.jsx';

const halls = [
  ['01', 'friendshipArchive', 'archive'],
  ['02', 'languageGallery', 'language'],
  ['03', 'starObservatory', 'stars'],
  ['04', 'listeningRoom', 'listening'],
];

/** Museum navigation keeps every original interactive collection within reach. */
export function Navigation({ onJump, onOpenHall, onCreate, onOpenPrivateRoom }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLocale();
  const openHall = (hall) => { setMobileOpen(false); onOpenHall(hall); };

  return <header className="journey-nav">
    <button className="brand" onClick={() => onJump(0)}>✦ Girlie</button>
    <nav aria-label={t('museumCollections')}>
      <span>{t('collections')}</span>
      {halls.map(([number, label, hall]) => <button className="nav-gallery-door" key={hall} onClick={() => openHall(hall)}><i>{number}</i><span>{t(label)}</span></button>)}
    </nav>
    <div className="nav-right">
      <span className="living-mark">{t('livingMuseum')}</span>
      <button className="create-nav-button" onClick={onCreate}>{t('tellStory')}</button>
      <button className="studio-button" onClick={onOpenPrivateRoom}>{t('privateGirlie')}</button>
      <LocaleMenu />
      <button className="mobile-halls-button" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>{t('halls')}</button>
    </div>
    {mobileOpen && <div className="mobile-halls" aria-label={t('museumCollections')}>
      {halls.map(([number, label, hall]) => <button key={hall} onClick={() => openHall(hall)}><i>{number}</i>{t(label)}</button>)}
      <button onClick={onCreate}>{t('tellStory')}</button>
      <button onClick={onOpenPrivateRoom}>{t('privateGirlie')}</button>
    </div>}
  </header>;
}
