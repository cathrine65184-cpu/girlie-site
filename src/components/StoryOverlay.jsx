import { AnimatePresence, motion } from 'framer-motion';
import { localTime } from '../data/girls';

function VoiceButton({ girl }) {
  const sayWord = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(girl.word));
  };
  return <button className="voice-button" onClick={sayWord}>Listen to “{girl.word}”</button>;
}

/** An editorial story sheet replaces a disruptive route change. */
export function StoryOverlay({ girl, onClose, onContinue, studioHref }) {
  const catalogue = girl ? `CAT. GP-${String(Math.round((1 - girl.position[2]) / 3) + 1).padStart(3, '0')}` : '';
  return <AnimatePresence>{girl && <motion.aside className="story-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="story-scrim" initial={{ backdropFilter: 'blur(0px)' }} animate={{ backdropFilter: 'blur(18px)' }} exit={{ backdropFilter: 'blur(0px)' }} onClick={onClose} />
    <motion.article className="story-sheet" initial={{ y: '13%', opacity: 0, scale: .98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: '12%', opacity: 0, scale: .98 }} transition={{ type: 'spring', stiffness: 130, damping: 21 }}>
      <button className="story-close" onClick={onClose} aria-label="Close story">Close ×</button>
      <div className="story-portrait"><img src={girl.img} alt={`Portrait of ${girl.n}`} /><span>{girl.f}</span></div>
      <p className="story-eyebrow">Friendship Archive · {catalogue} · {girl.world}</p>
      <h2>{girl.n}</h2>
      <blockquote>“{girl.q}”</blockquote>
      <div className="story-copy">
        <section><span>HER WORD</span><strong>{girl.word}</strong><i>/{girl.sound}/ · {girl.lang}</i><VoiceButton girl={girl} /></section>
        <section><span>THE LOCAL MOMENT</span><strong>{girl.city} · {localTime(girl)}</strong><i>{girl.climate}</i></section>
        <section><span>HER DREAM</span><strong>{girl.dream}</strong><i>Friendship taught her: {girl.lesson}</i></section>
      </div>
      <div className="story-footer"><p>An entry in the living collection.</p><div><a className="text-button" href={studioHref}>Build a Secret House ↗</a><button className="text-button" onClick={() => { onClose(); onContinue(); }}>Continue visiting →</button></div></div>
    </motion.article>
  </motion.aside>}</AnimatePresence>;
}
