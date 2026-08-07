export function Navigation({ onJump, onRoom, onArchive, memories }) {
  return <header className="journey-nav">
    <button className="brand" onClick={() => onJump(0)}>✦ Girlie</button>
    <nav><button onClick={() => onJump(.12)}>The path</button><button onClick={() => onJump(.35)}>Stories</button><button onClick={() => onJump(.83)}>Memory field</button></nav>
    <div className="nav-right"><span>{memories}/11 blooms</span><button className="archive-button" onClick={onArchive}>Original collection</button><button className="room-button" onClick={onRoom}>My Room</button></div>
  </header>;
}
