import { AnimatePresence, motion } from 'framer-motion';

/** Keeps legacy pages available without breaking the cinematic journey. */
export function RoomOverlay({ open, onClose, onOpenArchive, title = 'Girlie Room', source, note }) {
  return <AnimatePresence>{open && <motion.div className="room-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="room-scrim" onClick={onClose} />
    <motion.div className="room-shell" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
      <div className="room-bar"><p>{title}</p><div><span className="room-private-label">🔒 Just for the two of you</span>{onOpenArchive && <button onClick={onOpenArchive}>My Friendship Archives</button>}<button onClick={onClose}>Close ×</button></div></div>
      <iframe title={title} src={source} />
      {note && <p className="privacy-note">{note}</p>}
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
