import { useState } from 'react';

const halls = [
  ['Friendship Archive', 'archive'],
  ['Language Gallery', 'language'],
  ['Star Observatory', 'stars'],
  ['Listening Room', 'listening'],
];

/** Museum navigation keeps every original interactive collection within reach. */
export function Navigation({ onJump, onOpenHall }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const openHall = (hall) => { setMobileOpen(false); onOpenHall(hall); };

  return <header className="journey-nav">
    <button className="brand" onClick={() => onJump(0)}>✦ Girlie</button>
    <nav aria-label="Museum collections">
      <span>Collections</span>
      {halls.map(([label, hall]) => <button key={hall} onClick={() => openHall(hall)}>{label}</button>)}
    </nav>
    <div className="nav-right">
      <span className="living-mark">A living museum</span>
      <button className="studio-button" onClick={() => openHall('studio')}>Friendship Studio</button>
      <button className="mobile-halls-button" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>Halls</button>
    </div>
    {mobileOpen && <div className="mobile-halls" aria-label="Museum collections">
      {halls.map(([label, hall]) => <button key={hall} onClick={() => openHall(hall)}>{label}</button>)}
      <button className="mobile-studio" onClick={() => openHall('studio')}>Build a Secret House</button>
    </div>}
  </header>;
}
