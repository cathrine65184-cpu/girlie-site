import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { LocaleMenu, useLocale } from '../locales.jsx';

/** Embeds the established, authenticated private room and bridges its interview. */
export function RoomOverlay({ open, onClose, onMessage, title = 'Girlie Room', source, note, startInterview = false, incomingArchive = null }) {
  const { locale, t } = useLocale();
  const frameRef = useRef(null);
  const post = (message, frame = frameRef.current) => frame?.contentWindow?.postMessage(message, window.location.origin);
  const syncFrame = (frame) => {
    post({ type: 'girlie:set-locale', locale }, frame);
    if (startInterview) post({ type: 'girlie:start-interview' }, frame);
    if (incomingArchive) post({ type: 'girlie:interview-complete', archive: incomingArchive }, frame);
  };
  useEffect(() => { if (open) syncFrame(frameRef.current); }, [locale, open, startInterview, incomingArchive]);
  useEffect(() => {
    const receive = (event) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      onMessage?.(event.data);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [onMessage]);
  return <AnimatePresence>{open && <motion.div className="room-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="room-scrim" onClick={onClose} />
    <motion.div className="room-shell" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
      <div className="room-bar"><p>{t('privateHouse')}</p><div><span className="room-private-label">{t('privateForTwo')}</span><LocaleMenu /><button onClick={onClose}>{t('close')}</button></div></div>
      <iframe ref={frameRef} title={title} src={source} onLoad={(event) => syncFrame(event.currentTarget)} />
      {note && <p className="privacy-note">{note}</p>}
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
