import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { LocaleMenu, useLocale } from '../locales.jsx';

/** Keeps legacy pages available without breaking the cinematic journey. */
export function RoomOverlay({ open, onClose, onOpenArchive, title = 'Girlie Room', source, note }) {
  const { locale, t } = useLocale();
  const frameRef = useRef(null);
  const syncLocale = (frame) => frame?.contentWindow?.postMessage({ type: 'girlie:set-locale', locale }, window.location.origin);
  useEffect(() => { if (open) syncLocale(frameRef.current); }, [locale, open]);
  return <AnimatePresence>{open && <motion.div className="room-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="room-scrim" onClick={onClose} />
    <motion.div className="room-shell" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
      <div className="room-bar"><p>{t('privateHouse')}</p><div><span className="room-private-label">{t('privateForTwo')}</span><LocaleMenu />{onOpenArchive && <button onClick={onOpenArchive}>{t('friendshipArchives')}</button>}<button onClick={onClose}>{t('close')}</button></div></div>
      <iframe ref={frameRef} title={title} src={source} onLoad={(event) => syncLocale(event.currentTarget)} />
      {note && <p className="privacy-note">{note}</p>}
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
