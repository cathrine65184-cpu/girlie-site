import { useState } from 'react';

const halls = [
  ['01', 'Friendship Archive', 'archive'],
  ['02', 'Language Gallery', 'language'],
  ['03', 'Star Observatory', 'stars'],
  ['04', 'Listening Room', 'listening'],
];

/** Museum navigation keeps every original interactive collection within reach. */
export function Navigation({ onJump, onOpenHall, studioHref }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const openHall = (hall) => { setMobileOpen(false); onOpenHall(hall); };

  return <header className="journey-nav">
    <button className="brand" onClick={() => onJump(0)}>✦ Girlie</button>
    <nav aria-label="Museum collections">
      <span>Collections</span>
      {halls.map(([number, label, hall]) => <button className="nav-gallery-door" key={hall} onClick={() => openHall(hall)}><i>{number}</i><span>{label}</span></button>)}
    </nav>
    <div className="nav-right">
      <span className="living-mark">A living museum</span>
      <button className="studio-button" onClick={() => openHall('studio')}>Friendship Studio</button>
      <button className="mobile-halls-button" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>Halls</button>
    </div>
    {mobileOpen && <div className="mobile-halls" aria-label="Museum collections">
      {halls.map(([number, label, hall]) => <button key={hall} onClick={() => openHall(hall)}><i>{number}</i>{label}</button>)}
      <a className="mobile-studio" href={studioHref}>Build a Secret House</a>
    </div>}
  </header>;
}
